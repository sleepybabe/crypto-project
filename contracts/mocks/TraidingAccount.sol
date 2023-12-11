// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ITraidingAccount} from "ITraidingAccount.sol";

contract TraidingAccount{

    IERC20 USDC;
    ITraidingAccount traidingAccount;
     
    constructor( IERC20 _USDC, ITraidingAccount _tradAc){
        USDC = _USDC;
        traidingAccount = _tradAc;
    }


    function getToken() public{

    }

}