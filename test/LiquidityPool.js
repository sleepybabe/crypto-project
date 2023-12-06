const { expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

  describe("LiquidityPool", function() {

    async function deployContract() {
        // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
        // const ONE_GWEI = 1_000_000_000;
    
        // const lockedAmount = ONE_GWEI;
        // const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
        


        // Contracts are deployed using the first signer/account by default
        const [manager, otherAccount] = await ethers.getSigners();

        // console.log(manager.address)
        const USDC = await ethers.getContractFactory("USDC");
        const usdc = await USDC.deploy();
        const usdcAddress = await usdc.getAddress()
    
    
        const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
        const liquidityPool = await LiquidityPool.deploy(manager.address, usdcAddress);
    
        return {liquidityPool, manager, usdc};
    }
    
    describe("Deployment", function() {
        it("Should set the right manager", async function () {
            const { liquidityPool, manager} = await loadFixture(deployContract);
            expect(await liquidityPool.managerAddress()).to.equal(manager.address);
        })

        it("Should transfer tokens", async function () {
            const { liquidityPool, manager, usdc } = await loadFixture(deployContract);
            await usdc.approve(liquidityPool.target, usdc.target)
            const amountToken = 100;
            await liquidityPool.provide(amountToken);
            const contractBalance = await usdc.balanceOf(liquidityPool.target);
            // console.log("contractBalance", contractBalance)
            expect(contractBalance).to.equal(amountToken);
            const managerBalance = await usdc.balanceOf(manager.address);
            // console.log("managerBalance", managerBalance)
            expect(managerBalance).to.equal(10_000_000e6 - amountToken);
          });       
    });
  });
  

