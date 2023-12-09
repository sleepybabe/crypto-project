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

    mapping (address => uint) ownerTokenCount;

    constructor(address manager, IERC20 _USDC){
        require(manager != address(0) );
        managerAddress = manager;
        USDC = _USDC;
    }

    //про время на привлечение денег и время для вывода

    function provide(uint amountToken) public{
       require(startFundraise == true);
       USDC.transferFrom(msg.sender, address(this), amountToken);
       ownerTokenCount[msg.sender] += amountToken; //будет ли вот тут ломаться, мы же не задавали исходное значение = 0
       balance += amountToken;
    }


    function withdraw(uint amountToken)  public {
        require(amountToken <= ownerTokenCount[msg.sender]);
        USDC.transferFrom(address(this), msg.sender, amountToken);
        balance -= amountToken;
    }

    function shareOf()  public returns (uint){
       return ownerTokenCount[msg.sender];
    }

    function claimManagerFees(uint amountToken) public{
        USDC.transferFrom(address(this), managerAddress, amountToken); 
    }



    function initStartFundraise() public{
        startFundraise = true;
    }


}
