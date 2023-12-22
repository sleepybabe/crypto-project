// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {LiquidityPool} from "./LiquidityPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ITraidingAccount} from "./mocks/ITraidingAccount.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AccountManager is Ownable{

    IERC20 USDC;
    ITraidingAccount traidingAccount;

    mapping (LiquidityPool => bool)  isValid;

    event LPCreated(LiquidityPool indexed lp, address indexed manager) ;

    constructor(IERC20 _USDC,  ITraidingAccount traidAc) Ownable(msg.sender){
        traidingAccount = traidAc;
        USDC = _USDC;
    }


    function createAccount(uint256 _fundrisingDuration) public {
        LiquidityPool lp = new LiquidityPool(msg.sender, USDC, _fundrisingDuration, traidingAccount);
        isValid[lp] = true;
        emit LPCreated(lp, msg.sender);
    }


    function setUSDC(IERC20 newusdc) public onlyOwner {
        USDC = newusdc;
    }

    function setTraidingAccount(ITraidingAccount newTraidingAccount)  public onlyOwner{
        traidingAccount = newTraidingAccount;
    }




    function getIsValid(LiquidityPool lp) public view returns (bool){
        return isValid[lp];
    }
    
    
}