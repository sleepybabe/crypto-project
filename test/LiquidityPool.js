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
        const liquidityPool = await LiquidityPool.deploy(manager.address, usdcAddress, 24*60*60);

        await usdc.transfer(client.address, 1_000_000e6);
    
        return {liquidityPool, manager, usdc, client};
    }
    
    describe("Deployment", function() {
        it("Should set the right manager", async function () {
            const { liquidityPool, manager} = await loadFixture(deployContract);
            expect(await liquidityPool.managerAddress()).to.equal(manager.address);
        })

        it("Should transfer tokens to the LP", async function () {
            const { liquidityPool, client, usdc, manager} = await loadFixture(deployContract);
            const amountToken = 100;
            await usdc.connect(client).approve(await liquidityPool.getAddress(), amountToken);
            const clientBalance = await usdc.balanceOf(client.address);
            const lpBalance = await usdc.balanceOf(await liquidityPool.getAddress());
            await liquidityPool.connect(client).provide(amountToken);
            expect(clientBalance - BigInt(amountToken)).to.equal(await usdc.balanceOf(client.address));
            expect(lpBalance + BigInt(amountToken)).to.equal(await usdc.balanceOf(await liquidityPool.getAddress()));
          });       

          it("Should transfer tokens to the client", async function () {
            const { liquidityPool, client, usdc, manager} = await loadFixture(deployContract);
            const amountToken = 100;
            // await usdc.transfer(await liquidityPool.getAddress(), 1_000_000e6);
            await usdc.connect(client).approve(await liquidityPool.getAddress(), amountToken);
            await liquidityPool.connect(client).provide(amountToken);
            console.log(await usdc.balanceOf(await liquidityPool.getAddress()));
            const clientBalance = await usdc.balanceOf(client.address);
            const lpBalance = await usdc.balanceOf(await liquidityPool.getAddress());
            await liquidityPool.connect(client).withdraw(amountToken);
            expect(clientBalance + BigInt(amountToken)).to.equal(await usdc.balanceOf(client.address));
            expect(lpBalance - BigInt(amountToken)).to.equal(await usdc.balanceOf(await liquidityPool.getAddress()));
          });   
    });
  });
  

