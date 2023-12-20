// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface ITraidingAccount{

    function swapUSDCtoETHUniswap(uint amountToken) external;

    function swapETHtoUSDCUniswap()external payable;

}