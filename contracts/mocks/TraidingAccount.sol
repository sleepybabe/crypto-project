// SPDX-License-Identifier: UNLICENSED returns uint
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ITraidingAccount} from "./ITraidingAccount.sol";

contract  TraidingAccount is ITraidingAccount{

    IERC20 USDC;
    ITraidingAccount traidingAccount;
    address LP;
     
    constructor( IERC20 _USDC){
        USDC = _USDC;
    }


    function swapUSDCtoETHUniswap(uint amountToken) public override returns (uint){
        //transfrom 
        return 10;
    }

    function swapETHtoUSDCUniswap(uint amountToken)public override returns (uint){
        return 10;
    }


}