// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {TraidingAccount} from "/TraidingAccount.sol";

contract LiquidityPool{
    
    uint perfomanseFee = 5;
    uint balance = 0;
    bool startFundraise = false;
    uint256 fundrisingStopTime;
    uint256 timeForWithdraw;
    address public managerAddress;
    uint managerFee;
    IERC20 USDC;
    TraidingAccount traidingAccount;

    mapping (address => uint) ownerTokenCount;

    constructor(address manager, IERC20 _USDC, uint256 fundrisingDuration, TraidingAccount traidAc){
        require(manager != address(0) );
        managerAddress = manager;
        traidingAccount = traidAc;
        USDC = _USDC;
        fundrisingStopTime = block.timestamp + fundrisingDuration;
    }

    //про время на привлечение денег и время для вывода

    function provide(uint amountToken) public{
       require(block.timestamp < fundrisingStopTime, "fundrising was finished");
       ownerTokenCount[msg.sender] += amountToken; 
       balance += amountToken;
       USDC.transferFrom(msg.sender, address(this), amountToken);
    }


    // function withdraw(uint amountToken)  public {
    //     require(amountToken <= ownerTokenCount[msg.sender], "amount is too large");
    //     USDC.transfer( msg.sender, amountToken);
    //     ownerTokenCount[msg.sender] -= amountToken;
    
    // }

    function withdraw()  public {
        uint a = (ownerTokenCount[msg.sender] /  balance) * (USDC.balanceOf(address(this)) -  managerFee);
        ownerTokenCount[msg.sender] = 0;
        USDC.transfer(msg.sender, a);
    }



    function startTraiding() public{
        traidingAccount.getToken();
    }


    function closeTraiding()public{
        //продать весь эфир
        // int pnl = int256(USDC.balanceOf(address(this))) - int256(balance);
        // int managerFee = (pnl / 100) * int256(perfomanseFee);
        //проверка на отриц число
        uint pnl = uint256(USDC.balanceOf(address(this))) - uint256(balance);
        managerFee = (pnl / 100) * uint256(perfomanseFee);
        //проверка на положит прибыль managerFee != 0
        USDC.transfer(managerAddress, managerFee);
    }

    


    function initStartFundraise() public{
        startFundraise = true;
    }


}
