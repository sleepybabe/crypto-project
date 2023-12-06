const { expect } = require("chai");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

  describe("LiquidityPool", function() {

    async function deployContract() {

        // Contracts are deployed using the first signer/account by default
        const [manager, client] = await ethers.getSigners();
        console.log(client)
        // console.log(manager.address)
        const USDC = await ethers.getContractFactory("USDC");
        const usdc = await USDC.deploy();
        const usdcAddress = await usdc.getAddress()
        const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
        const liquidityPool = await LiquidityPool.deploy(manager.address, usdcAddress);
    
        return {liquidityPool, manager, usdc, client};
    }
    
    describe("Deployment", function() {
        it("Should set the right manager", async function () {
            const { liquidityPool, manager} = await loadFixture(deployContract);
            expect(await liquidityPool.managerAddress()).to.equal(manager.address);
        })

        it("Should transfer tokens", async function () {
            const { liquidityPool, client, usdc, manager} = await loadFixture(deployContract);
            const amountToken = 100;
            await usdc.connect(client).approve(await liquidityPool.getAddress(), amountToken);
            const clientBalance = await usdc.balanceOf(client.address);
            console.log("clientBalance", clientBalance)
            const managerBalance = await usdc.balanceOf(manager.address);
            console.log("managerBalance", managerBalance)
            console.log("address of client", client.address)
            console.log("address of LP", await liquidityPool.getAddress())
            await liquidityPool.connect(client).provide(amountToken);
          });       
    });
  });
  

