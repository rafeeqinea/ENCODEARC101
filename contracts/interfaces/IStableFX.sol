// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IStableFX
 * @dev Interface for the StableFX router used for token swaps.
 */
interface IStableFX {
    /**
     * @notice Swap `amountIn` of `fromToken` to `toToken`.
     * @param fromToken Address of the token to swap from.
     * @param toToken Address of the token to swap to.
     * @param amountIn Amount of `fromToken` to swap.
     * @return amountOut Amount of `toToken` received.
     */
    function swap(address fromToken, address toToken, uint256 amountIn) external returns (uint256 amountOut);
}
