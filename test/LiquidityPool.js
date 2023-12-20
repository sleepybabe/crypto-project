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
        const USDC = await ethers.getContractFactory("USDC");
        const usdc = await USDC.deploy();
        const TraidingAccount = await ethers.getContractFactory("TraidingAccount");
        const usdcAddress = await usdc.getAddress();
        const traidingAccount = await TraidingAccount.deploy(usdcAddress);
        const traidingAccAddress = await traidingAccount.getAddress();
        const traidingTime = 24*60*60;
        const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
        const liquidityPool = await LiquidityPool.deploy(manager.address, 
                                          usdcAddress, traidingTime, traidingAccAddress);
        await usdc.transfer(client.address, 1_000_000e6);
        return {liquidityPool, manager, usdc, client, traidingAccount, traidingTime};
    }
    
    describe("Deployment", function() {
        it("Should set the right manager", async function () {
            const {liquidityPool, manager} = await loadFixture(deployContract);
            expect(await liquidityPool.managerAddress()).to.equal(manager.address);
        });
    });
    
    describe("Withdrawals", function() {
        describe("Transfers", function() {
            it("Should transfer tokens to the LP", async function () {
                const {liquidityPool, client, usdc} = await loadFixture(deployContract);
                const amountToken = 100n;
                await usdc.connect(client).approve(await liquidityPool.getAddress(), amountToken);
                const clientBalance = await usdc.balanceOf(client.address);
                const lpBalance = await usdc.balanceOf(await liquidityPool.getAddress());
                await liquidityPool.connect(client).provide(amountToken);
                expect(amountToken).to.equal(await liquidityPool.getOwnerTokenCount(client.address));
                expect(clientBalance - BigInt(amountToken)).to.equal(await usdc.balanceOf(client.address));
                expect(lpBalance + BigInt(amountToken)).to.equal(await usdc.balanceOf(await liquidityPool.getAddress()));
            });

            it("Should transfer tokens to the client", async function () {
                const {liquidityPool, client, usdc} = await loadFixture(deployContract);
                const amountToken = 100n;
                for (i=0; i<2; i++){
                    await usdc.connect(client).approve(await liquidityPool.getAddress(), amountToken);
                    await liquidityPool.connect(client).provide(amountToken);
                }
                const clientBalance = await usdc.balanceOf(client.address);
                const lpBalance = await usdc.balanceOf(await liquidityPool.getAddress());
                await liquidityPool.connect(client).withdraw();
                expect(0).to.equal(await liquidityPool.getOwnerTokenCount(client.address));
                expect(clientBalance + 2n*amountToken).to.equal(await usdc.balanceOf(client.address));
                expect(lpBalance - 2n*amountToken).to.equal(await usdc.balanceOf(await liquidityPool.getAddress()));
            });   

            it("Should start the traiding", async function () {
                const {liquidityPool, traidingTime} = await loadFixture(deployContract);
                await time.increaseTo(await time.latest() + traidingTime);
                await liquidityPool.startTraiding();
                expect(await liquidityPool.getCanTraiding()).to.be.true;
            });

            it("Should swap USDC to ETH", async function(){
                const {liquidityPool, usdc, traidingAccount, manager} = await loadFixture(deployContract);
                const amountToken = 1n;
                await usdc.connect(manager).approve(await liquidityPool.getAddress(), amountToken);
                await liquidityPool.connect(manager).provide(amountToken);
                await manager.sendTransaction({
                  to: await traidingAccount.getAddress(),
                  value: ethers.parseEther("1.0")
                });
                const traidingEthBalance = await ethers.provider.getBalance(await traidingAccount.getAddress());
                const lpEthBalance = await ethers.provider.getBalance(await liquidityPool.getAddress());
                const lpUsdcBalance = await usdc.balanceOf(await liquidityPool.getAddress());
                const traidingUsdcBalance = await usdc.balanceOf(await traidingAccount.getAddress());
                await liquidityPool.connect(manager).swapUSDCtoETH(amountToken);
                expect(traidingUsdcBalance + amountToken).to.equal( await usdc.balanceOf(await traidingAccount.getAddress()));
                expect(lpUsdcBalance - amountToken).to.equal( await usdc.balanceOf(await liquidityPool.getAddress()));
                expect(traidingEthBalance - amountToken * BigInt(1e12)/2000n).to.
                                equal(await ethers.provider.getBalance(await traidingAccount.getAddress()));
                expect(lpEthBalance + amountToken * BigInt(1e12)/2000n).to.
                                equal(await ethers.provider.getBalance(await liquidityPool.getAddress()));
            });
            
            it("Should swap ETH to USDC", async function(){
              const {liquidityPool, usdc, traidingAccount, manager} = await loadFixture(deployContract);
              const amountToken = 1000000000000n;
              await usdc.transfer(await traidingAccount.getAddress(), 1_000_000e6);
              await manager.sendTransaction({
                to: await liquidityPool.getAddress(),
                value: ethers.parseEther("1.0")
              });
              const traidingEthBalance = await ethers.provider.getBalance(await traidingAccount.getAddress());
              const lpEthBalance = await ethers.provider.getBalance(await liquidityPool.getAddress());
              const lpUsdcBalance = await usdc.balanceOf(await liquidityPool.getAddress());
              const traidingUsdcBalance = await usdc.balanceOf(await traidingAccount.getAddress());
              // console.log("1usdc LP", await usdc.balanceOf(await liquidityPool.getAddress()))
              // console.log("1ETH TR",await ethers.provider.getBalance(await traidingAccount.getAddress()))
              // console.log("1ETH LP", await ethers.provider.getBalance(await liquidityPool.getAddress()))
              // console.log("1uscd TR", await usdc.balanceOf(await traidingAccount.getAddress()))
              await liquidityPool.connect(manager).swapETHtoUSDC(amountToken);
              expect(traidingUsdcBalance - 2000n * amountToken/BigInt(1e12)).to.
                                equal(await usdc.balanceOf(await traidingAccount.getAddress()));
              expect(lpUsdcBalance + 2000n * amountToken/BigInt(1e12)).to.
                                equal(await usdc.balanceOf(await liquidityPool.getAddress()));
              expect(traidingEthBalance + amountToken).to.equal(await ethers.provider.getBalance(await traidingAccount.getAddress()));
              expect(lpEthBalance - amountToken).to.equal(await ethers.provider.getBalance(await liquidityPool.getAddress()));
            });

            it("Should return the right manager fee", async function() {
              const {liquidityPool, usdc, traidingAccount, manager} = await loadFixture(deployContract);


              await liquidityPool.calculateManagerFee();
              const managerFee = await liquidityPool.getManagerFee();
              console.log(managerFee);
            });

            // it("Should close the traiding", async function() {
              
            // });
        });

        //revertedwith
        describe("Validation", function() {
            it("Should revert with the right error if the traiding can't be started yet", async function () {
                const {liquidityPool} = await loadFixture(deployContract);
                // await time.increaseTo(await time.latest());
                try {
                    await liquidityPool.startTraiding();
                    throw new Error("Expected an error but didn't get one");
                  } catch (error) {
                    expect(error.message).to.include("echo nelzuy torgovat");
                  }
            });

            it("Should revert with the right error if provide called too late", async function () {
                const {liquidityPool, traidingTime, client, usdc} = await loadFixture(deployContract);
                await time.increaseTo(await time.latest() + traidingTime);
                try {
                    await usdc.connect(client).approve(await liquidityPool.getAddress(), 100);
                    await liquidityPool.connect(client).provide(100);
                    throw new Error("Expected an error but didn't get one");
                  } catch (error) {
                    expect(error.message).to.include("fundrising was finished");
                  }
            });

            it("Should revert with the right error if the sender isn't the manager", async function () {
                const {liquidityPool, client} = await loadFixture(deployContract);
                try {
                    await liquidityPool.connect(client).swapUSDCtoETH(100);
                    throw new Error("Expected an error but didn't get one");
                  } catch (error) {
                    expect(error.message).to.include("");
                  }
                try {
                    await liquidityPool.connect(client).swapETHtoUSDC(100);
                    throw new Error("Expected an error but didn't get one");
                  } catch (error) {
                    expect(error.message).to.include("");
                  }
            });
        });
    });
  });
  

