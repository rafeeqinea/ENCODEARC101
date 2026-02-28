// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IUSYCVault
 * @dev Interface for the USYC yield vault.
 */
interface IUSYCVault {
    /**
     * @notice Deposit USDC into the vault to receive USYC.
     * @param amount Amount of USDC to deposit.
     */
    function deposit(uint256 amount) external;

    /**
     * @notice Withdraw USDC from the vault by burning USYC.
     * @param amount Amount of USDC to withdraw.
     */
    function withdraw(uint256 amount) external;
}
