// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IStableFX.sol";
import "./interfaces/IUSYCVault.sol";

/**
 * @title ArcTreasury
 * @dev Treasury vault with conditional escrow, vesting, FX swaps, and yield.
 * Supports AI agent autonomous operation and multi-recipient payouts.
 */
contract ArcTreasury is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;
    IERC20 public immutable eurc;
    IERC20 public immutable usyc;
    IStableFX public immutable stableFXRouter;
    IUSYCVault public immutable usycVault;

    address public agent;

    // ── Conditional Escrow ──────────────────────────────────────
    struct Escrow {
        address depositor;
        address beneficiary;
        address token;
        uint256 amount;
        uint256 releaseTime;     // block.timestamp after which auto-release
        uint256 threshold;       // optional: release when treasury USDC > threshold
        bool released;
        bool disputed;
        string condition;        // human-readable condition description
    }

    uint256 public nextEscrowId;
    mapping(uint256 => Escrow) public escrows;

    // ── Vesting Schedules ──────────────────────────────────────
    struct VestingSchedule {
        address beneficiary;
        address token;
        uint256 totalAmount;
        uint256 released;
        uint256 startTime;
        uint256 cliffDuration;   // seconds until first release
        uint256 vestingDuration; // total vesting period in seconds
        bool revoked;
    }

    uint256 public nextVestingId;
    mapping(uint256 => VestingSchedule) public vestingSchedules;

    // ── Transaction Log (on-chain receipt) ──────────────────────
    struct TxReceipt {
        uint256 timestamp;
        address executor;
        string action;       // "deposit", "withdraw", "swap", "escrow", "vesting", "payout"
        address token;
        uint256 amount;
        uint256 fee;
        address recipient;
    }

    TxReceipt[] public txLog;

    // ── Events ─────────────────────────────────────────────────
    event FundsDeposited(address indexed token, address indexed from, uint256 amount);
    event FundsWithdrawn(address indexed token, address indexed to, uint256 amount);
    event FXSwapExecuted(address indexed fromToken, address indexed toToken, uint256 amountIn, uint256 amountOut);
    event YieldDeposited(uint256 amount);
    event YieldWithdrawn(uint256 amount);
    event AgentDecision(address indexed agent, string decision);

    event EscrowCreated(uint256 indexed escrowId, address depositor, address beneficiary, uint256 amount, uint256 releaseTime);
    event EscrowReleased(uint256 indexed escrowId, address beneficiary, uint256 amount);
    event EscrowDisputed(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId, address depositor, uint256 amount);

    event VestingCreated(uint256 indexed vestingId, address beneficiary, uint256 totalAmount, uint256 startTime);
    event VestingReleased(uint256 indexed vestingId, address beneficiary, uint256 amount);
    event VestingRevoked(uint256 indexed vestingId, uint256 unreleased);

    event PayoutExecuted(address indexed token, address indexed to, uint256 amount, uint256 fee);

    modifier onlyAgent() {
        require(msg.sender == owner() || msg.sender == agent, "ArcTreasury: not authorized");
        _;
    }

    constructor(
        address _usdc, address _eurc, address _usyc,
        address _stableFXRouter, address _usycVault, address _agent
    ) {
        usdc = IERC20(_usdc);
        eurc = IERC20(_eurc);
        usyc = IERC20(_usyc);
        stableFXRouter = IStableFX(_stableFXRouter);
        usycVault = IUSYCVault(_usycVault);
        agent = _agent;
    }

    // ── Core Vault ─────────────────────────────────────────────

    function deposit(address token, uint256 amount) external onlyAgent nonReentrant {
        require(amount > 0, "amount must be > 0");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        _logTx("deposit", token, amount, 0, msg.sender);
        emit FundsDeposited(token, msg.sender, amount);
    }

    function withdraw(address token, uint256 amount, address to) external onlyAgent nonReentrant {
        require(amount > 0, "amount must be > 0");
        IERC20(token).transfer(to, amount);
        _logTx("withdraw", token, amount, 0, to);
        emit FundsWithdrawn(token, to, amount);
    }

    function swapFX(address fromToken, address toToken, uint256 amountIn) external onlyAgent nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "amountIn must be > 0");
        IERC20(fromToken).approve(address(stableFXRouter), amountIn);
        amountOut = stableFXRouter.swap(fromToken, toToken, amountIn);
        _logTx("swap", fromToken, amountIn, 0, address(this));
        emit FXSwapExecuted(fromToken, toToken, amountIn, amountOut);
    }

    function depositToYield(uint256 amount) external onlyAgent nonReentrant {
        require(amount > 0, "amount must be > 0");
        usdc.approve(address(usycVault), amount);
        usycVault.deposit(amount);
        _logTx("yield_deposit", address(usdc), amount, 0, address(usycVault));
        emit YieldDeposited(amount);
    }

    function withdrawFromYield(uint256 amount) external onlyAgent nonReentrant {
        require(amount > 0, "amount must be > 0");
        usycVault.withdraw(amount);
        _logTx("yield_withdraw", address(usdc), amount, 0, address(this));
        emit YieldWithdrawn(amount);
    }

    // ── Multi-Recipient Payout ─────────────────────────────────

    function batchPayout(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyAgent nonReentrant {
        require(recipients.length == amounts.length, "length mismatch");
        uint256 totalFee = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 fee = amounts[i] / 10000; // 0.01% protocol fee
            uint256 net = amounts[i] - fee;
            IERC20(token).transfer(recipients[i], net);
            totalFee += fee;
            _logTx("payout", token, net, fee, recipients[i]);
            emit PayoutExecuted(token, recipients[i], net, fee);
        }
    }

    // ── Conditional Escrow ─────────────────────────────────────

    function createEscrow(
        address beneficiary,
        address token,
        uint256 amount,
        uint256 releaseTime,
        uint256 threshold,
        string calldata condition
    ) external onlyAgent nonReentrant returns (uint256 escrowId) {
        require(amount > 0, "amount must be > 0");
        require(releaseTime > block.timestamp, "releaseTime must be future");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            depositor: msg.sender,
            beneficiary: beneficiary,
            token: token,
            amount: amount,
            releaseTime: releaseTime,
            threshold: threshold,
            released: false,
            disputed: false,
            condition: condition
        });
        _logTx("escrow_create", token, amount, 0, beneficiary);
        emit EscrowCreated(escrowId, msg.sender, beneficiary, amount, releaseTime);
    }

    function releaseEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(!e.released && !e.disputed, "invalid state");
        // Auto-release: time expired OR threshold met
        bool timeReached = block.timestamp >= e.releaseTime;
        bool thresholdMet = e.threshold > 0 && usdc.balanceOf(address(this)) >= e.threshold;
        require(
            timeReached || thresholdMet || msg.sender == owner() || msg.sender == agent,
            "conditions not met"
        );
        e.released = true;
        IERC20(e.token).transfer(e.beneficiary, e.amount);
        _logTx("escrow_release", e.token, e.amount, 0, e.beneficiary);
        emit EscrowReleased(escrowId, e.beneficiary, e.amount);
    }

    function disputeEscrow(uint256 escrowId) external {
        require(msg.sender == owner(), "only owner can dispute");
        Escrow storage e = escrows[escrowId];
        require(!e.released, "already released");
        e.disputed = true;
        emit EscrowDisputed(escrowId);
    }

    function refundEscrow(uint256 escrowId) external onlyAgent nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(e.disputed && !e.released, "must be disputed");
        e.released = true;
        IERC20(e.token).transfer(e.depositor, e.amount);
        _logTx("escrow_refund", e.token, e.amount, 0, e.depositor);
        emit EscrowRefunded(escrowId, e.depositor, e.amount);
    }

    // ── Vesting ────────────────────────────────────────────────

    function createVesting(
        address beneficiary,
        address token,
        uint256 totalAmount,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external onlyAgent nonReentrant returns (uint256 vestingId) {
        require(totalAmount > 0 && vestingDuration > 0, "invalid params");
        IERC20(token).transferFrom(msg.sender, address(this), totalAmount);
        vestingId = nextVestingId++;
        vestingSchedules[vestingId] = VestingSchedule({
            beneficiary: beneficiary,
            token: token,
            totalAmount: totalAmount,
            released: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            revoked: false
        });
        _logTx("vesting_create", token, totalAmount, 0, beneficiary);
        emit VestingCreated(vestingId, beneficiary, totalAmount, block.timestamp);
    }

    function releaseVesting(uint256 vestingId) external nonReentrant {
        VestingSchedule storage v = vestingSchedules[vestingId];
        require(!v.revoked, "revoked");
        uint256 vested = _vestedAmount(v);
        uint256 releasable = vested - v.released;
        require(releasable > 0, "nothing to release");
        v.released += releasable;
        IERC20(v.token).transfer(v.beneficiary, releasable);
        _logTx("vesting_release", v.token, releasable, 0, v.beneficiary);
        emit VestingReleased(vestingId, v.beneficiary, releasable);
    }

    function revokeVesting(uint256 vestingId) external onlyAgent nonReentrant {
        VestingSchedule storage v = vestingSchedules[vestingId];
        require(!v.revoked, "already revoked");
        uint256 vested = _vestedAmount(v);
        uint256 unreleased = v.totalAmount - vested;
        v.revoked = true;
        if (unreleased > 0) {
            IERC20(v.token).transfer(owner(), unreleased);
        }
        _logTx("vesting_revoke", v.token, unreleased, 0, owner());
        emit VestingRevoked(vestingId, unreleased);
    }

    function vestedAmount(uint256 vestingId) external view returns (uint256) {
        return _vestedAmount(vestingSchedules[vestingId]);
    }

    function _vestedAmount(VestingSchedule storage v) internal view returns (uint256) {
        if (block.timestamp < v.startTime + v.cliffDuration) return 0;
        if (block.timestamp >= v.startTime + v.vestingDuration) return v.totalAmount;
        return (v.totalAmount * (block.timestamp - v.startTime)) / v.vestingDuration;
    }

    // ── Views ──────────────────────────────────────────────────

    function getBalances() external view returns (uint256 usdcBal, uint256 eurcBal, uint256 usycBal) {
        usdcBal = usdc.balanceOf(address(this));
        eurcBal = eurc.balanceOf(address(this));
        usycBal = usyc.balanceOf(address(this));
    }

    function getTxLogLength() external view returns (uint256) {
        return txLog.length;
    }

    function getTxReceipt(uint256 index) external view returns (TxReceipt memory) {
        return txLog[index];
    }

    function setAgent(address newAgent) external onlyOwner {
        agent = newAgent;
    }

    // ── Internal ───────────────────────────────────────────────

    function _logTx(string memory action, address token, uint256 amount, uint256 fee, address recipient) internal {
        txLog.push(TxReceipt({
            timestamp: block.timestamp,
            executor: msg.sender,
            action: action,
            token: token,
            amount: amount,
            fee: fee,
            recipient: recipient
        }));
    }
}
