// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IStableFX.sol";
import "./interfaces/IUSYCVault.sol";

/**
 * @title ArcTreasury
 * @dev Treasury vault that holds USDC, EURC, and USYC tokens.
 * Allows deposits, withdrawals, FX swaps via StableFX, and yield operations via USYC vault.
 */
contract ArcTreasury is Ownable, ReentrancyGuard {
    // Token addresses
    IERC20 public immutable usdc;
    IERC20 public immutable eurc;
    IERC20 public immutable usyc;

    // External contracts
    IStableFX public immutable stableFXRouter;
    IUSYCVault public immutable usycVault;

    // Agent address with privileged access
    address public agent;

    /**
     * @dev Emitted when funds are deposited.
     */
    event FundsDeposited(address indexed token, address indexed from, uint256 amount);
    /**
     * @dev Emitted when funds are withdrawn.
     */
    event FundsWithdrawn(address indexed token, address indexed to, uint256 amount);
    /**
     * @dev Emitted when an FX swap is executed.
     */
    event FXSwapExecuted(address indexed fromToken, address indexed toToken, uint256 amountIn, uint256 amountOut);
    /**
     * @dev Emitted when yield is deposited to USYC vault.
     */
    event YieldDeposited(uint256 amount);
    /**
     * @dev Emitted when yield is withdrawn from USYC vault.
     */
    event YieldWithdrawn(uint256 amount);
    /**
     * @dev Emitted when the agent makes a decision that triggers a vault action.
     */
    event AgentDecision(address indexed agent, string decision);

    /**
     * @dev Modifier that restricts function access to the owner or the agent.
     */
    modifier onlyAgent() {
        require(msg.sender == owner() || msg.sender == agent, "ArcTreasury: caller is not owner nor agent");
        _;
    }

    /**
     * @param _usdc Address of the USDC token contract.
     * @param _eurc Address of the EURC token contract.
     * @param _usyc Address of the USYC token contract.
     * @param _stableFXRouter Address of the StableFX router contract.
     * @param _usycVault Address of the USYC yield vault contract.
     * @param _agent Address of the AI agent wallet.
     */
    constructor(
        address _usdc,
        address _eurc,
        address _usyc,
        address _stableFXRouter,
        address _usycVault,
        address _agent
    ) {
        usdc = IERC20(_usdc);
        eurc = IERC20(_eurc);
        usyc = IERC20(_usyc);
        stableFXRouter = IStableFX(_stableFXRouter);
        usycVault = IUSYCVault(_usycVault);
        agent = _agent;
    }

    /**
     * @notice Deposit a specified ERC20 token into the vault.
     * @param token Address of the ERC20 token to deposit.
     * @param amount Amount of tokens to deposit.
     */
    function deposit(address token, uint256 amount) external onlyAgent nonReentrant {
        require(amount > 0, "ArcTreasury: amount must be > 0");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit FundsDeposited(token, msg.sender, amount);
    }

    /**
     * @notice Withdraw a specified ERC20 token from the vault.
     * @param token Address of the ERC20 token to withdraw.
     * @param amount Amount of tokens to withdraw.
     * @param to Destination address.
     */
    function withdraw(address token, uint256 amount, address to) external onlyAgent nonReentrant {
        require(amount > 0, "ArcTreasury: amount must be > 0");
        IERC20(token).transfer(to, amount);
        emit FundsWithdrawn(token, to, amount);
    }

    /**
     * @notice Perform an FX swap via StableFX.
     * @param fromToken Token to swap from.
     * @param toToken Token to swap to.
     * @param amountIn Amount of fromToken to swap.
     * @return amountOut Amount of toToken received.
     */
    function swapFX(address fromToken, address toToken, uint256 amountIn) external onlyAgent nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "ArcTreasury: amountIn must be > 0");
        // Approve StableFX router to spend fromToken
        IERC20(fromToken).approve(address(stableFXRouter), amountIn);
        amountOut = stableFXRouter.swap(fromToken, toToken, amountIn);
        emit FXSwapExecuted(fromToken, toToken, amountIn, amountOut);
    }

    /**
     * @notice Deposit USDC into the USYC yield vault.
     * @param amount Amount of USDC to deposit.
     */
    function depositToYield(uint256 amount) external onlyAgent nonReentrant {
        require(amount > 0, "ArcTreasury: amount must be > 0");
        usdc.approve(address(usycVault), amount);
        usycVault.deposit(amount);
        emit YieldDeposited(amount);
    }

    /**
     * @notice Withdraw USDC from the USYC yield vault.
     * @param amount Amount of USDC to withdraw.
     */
    function withdrawFromYield(uint256 amount) external onlyAgent nonReentrant {
        require(amount > 0, "ArcTreasury: amount must be > 0");
        usycVault.withdraw(amount);
        emit YieldWithdrawn(amount);
    }

    /**
     * @notice Get current balances of USDC, EURC, and USYC held by the vault.
     * @return usdcBal Balance of USDC.
     * @return eurcBal Balance of EURC.
     * @return usycBal Balance of USYC.
     */
    function getBalances() external view returns (uint256 usdcBal, uint256 eurcBal, uint256 usycBal) {
        usdcBal = usdc.balanceOf(address(this));
        eurcBal = eurc.balanceOf(address(this));
        usycBal = usyc.balanceOf(address(this));
    }

    /**
     * @notice Set a new agent address. Callable only by the owner.
     * @param newAgent Address of the new agent.
     */
    function setAgent(address newAgent) external onlyOwner {
        agent = newAgent;
    }
}
