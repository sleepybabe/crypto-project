const { expect } = require("chai");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

  describe("AccountManager", function() {

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
        const AccountManager = await ethers.getContractFactory("AccountManager");
        const accountManager = await AccountManager.deploy(usdcAddress, traidingAccAddress, client.address);
        await usdc.transfer(client.address, 1_000_000e6);
        return {accountManager, manager, usdc, client, traidingAccount, traidingTime};
    }
    
    // describe("Deployment", function() {
    //     it("Should set the right manager", async function () {
    //         const {liquidityPool, manager} = await loadFixture(deployContract);
    //         expect(await liquidityPool.managerAddress()).to.equal(manager.address);
    //     });
    // });
    
    describe("Deployment", function() {
        it.only("Should create an account", async function () {
            const {accountManager, client, usdc, traidingTime} = await loadFixture(deployContract);
            
            const abc = accountManager.connect(client).createAccount(traidingTime)
            const tx = await abc;

            const receipt = await tx.wait()
            console.log(receipt.logs[0].args);

            const lpAddress = receipt.logs[0].args.lp;
            
            expect(await accountManager.getIsValid(lpAddress)).to.be.true;
            await expect(abc)
                    .to.emit(accountManager, 'LPCreated')
                    .withArgs(lpAddress, client.address);
        });

        
    });
});