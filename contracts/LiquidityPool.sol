// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LiquidityPool{
    
    uint perfomanseFee = 5;
    uint balance = 0;
    bool startFundraise = false;
    address public managerAddress;
    IERC20 USDC;

    constructor(address manager, IERC20 _USDC){
        require(manager != address(0) );
        managerAddress = manager;
        USDC = _USDC;
    }

    function changeBalance(uint amount) public{
        balance += amount;
    }

    function initStartFundraise() public{
        startFundraise = true;
    }


    function provide(uint amountToken) public{
       USDC.transferFrom(msg.sender, address(this), amountToken);
    }

}
