// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ITraidingAccount} from "./mocks/ITraidingAccount.sol";

contract LiquidityPool{
    
    uint perfomanseFee = 5;
    uint balance = 0;//баланс, который занесли нам инвесторы
    //bool startFundraise = false;
    bool canTraiding = false;
    uint256 fundrisingStopTime;//когда закончится время на ввод денег
    uint256 timeForWithdraw; //24 часа на вывод 
    // uint256 withdrawStartTime; // когда начнется 24 часа на вывод
    // uint256 withdrawStopTime;// когда закончится 24 часа на вывод
    address public managerAddress;
    uint managerFee;
    IERC20 USDC;
    ITraidingAccount traidingAccount;

    mapping (address => uint) ownerTokenCount;

    constructor(address manager, IERC20 _USDC, uint256 fundrisingDuration, ITraidingAccount traidAc){
        require(manager != address(0) );
        managerAddress = manager;
        traidingAccount = traidAc;
        USDC = _USDC;
        fundrisingStopTime = block.timestamp + fundrisingDuration;
        // timeForWithdraw = _timeForWithdraw;
    }

    receive()payable external{}

    function provide(uint amountToken) public{
       require(block.timestamp < fundrisingStopTime, "fundrising was finished");
       ownerTokenCount[msg.sender] += amountToken; 
       balance += amountToken;
       USDC.transferFrom(msg.sender, address(this), amountToken);
    }

    function withdraw() public {
        // require(block.timestamp >  withdrawStartTime, "time for vyvod escho ne nastalo");
        // require(block.timestamp <  withdrawStopTime, "time for vyvod yche prochlo");
        uint amountLPToken = (ownerTokenCount[msg.sender] /  balance) * (USDC.balanceOf(address(this)) -  managerFee);
        ownerTokenCount[msg.sender] = 0;
        USDC.transfer(msg.sender, amountLPToken);
    }

    function startTraiding() public{
        require(block.timestamp > fundrisingStopTime, "echo nelzuy torgovat");
        canTraiding = true;
    }


    function swapUSDCtoETH(uint amountToken) public{
        require(managerAddress == msg.sender, "error usdc to eth");
        USDC.approve(address(traidingAccount), amountToken);
        traidingAccount.swapUSDCtoETHUniswap(amountToken);
    }

    function swapETHtoUSDC(uint amountToken)public {
        require(managerAddress == msg.sender, "error eth to usdc");
        traidingAccount.swapETHtoUSDCUniswap{value: amountToken}();
    }


    function calculateManagerFee() public returns(uint){
        if(USDC.balanceOf(address(this)) <= balance){
            managerFee = 0;
            return managerFee;
        }
        else {
            uint pnl = uint256(USDC.balanceOf(address(this))) - uint256(balance);
            managerFee = (pnl / 100) * uint256(perfomanseFee);
            USDC.transfer(managerAddress, managerFee);
            return managerFee;
        }
    }

    function closeTraiding() public{
        traidingAccount.swapETHtoUSDCUniswap{value: address(this).balance}();
        calculateManagerFee();
        canTraiding = false;
        // withdrawStartTime = block.timestamp;
        // withdrawStopTime = block.timestamp + timeForWithdraw;
    }

    //для теста
    function getOwnerTokenCount(address _address) public view returns (uint){
        return ownerTokenCount[_address];
    }

    //для теста
    function getCanTraiding() public view returns (bool){
        return canTraiding;
    }

    //для теста
    function getManagerFee() public view returns (uint){
        return managerFee;
    }

    //для теста
    function getBalance() public view returns (uint){
        return balance;
    }


    // function initStartFundraise() public{
    //     startFundraise = true;
    // }

    // function withdraw(uint amountToken)  public {
    //     require(amountToken <= ownerTokenCount[msg.sender], "amount is too large");
    //     USDC.transfer( msg.sender, amountToken);
    //     ownerTokenCount[msg.sender] -= amountToken;
    
    // }

}
