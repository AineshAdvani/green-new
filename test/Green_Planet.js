const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('GreenPlanet', () => {
    let buyer, seller, greenToken, inspector;
    let greenplanet;
    beforeEach(async () => {
        const signers = await ethers.getSigners();
        buyer = signers[0];
        seller = signers[1];
        inspector = signers[2];
        const GreenToken = await ethers.getContractFactory("GreenToken");
        greenToken = await GreenToken.deploy();

        let transaction  = await greenToken.connect(seller).mint("https://nftsjkjk.infura-ipfs.io/ipfs/QmXM6SHsYpMCuzDLHXqh2Ks6r1airycFowE69v5kMgx18y");
        await transaction.wait();

        const Greenplanet = await ethers.getContractFactory("GreenPlanet"); 
        greenplanet = await Greenplanet.deploy( greenToken.address, seller.address, buyer.address, inspector.address); 
        
        transaction = await greenToken.connect(seller).approve(greenplanet.address, 1);
        await transaction.wait();
        
        transaction = await greenplanet.connect(seller).list(1, tokens(10),buyer.address , tokens(5));
        await transaction.wait();
    })  
    describe('Deployment', async () => {

        
        it('Returns NFT address', async () => {
            const result = await greenplanet.nftAddress();
            expect(result).to.be.equal(greenToken.address);
        })
        it('Returns Seller', async () => {
            const result = await greenplanet.seller();
            expect(result).to.be.equal(seller.address);
        })
        it('Returns inspector', async () => {
            const result = await greenplanet.inspector()
            expect(result).to.be.equal(inspector.address)
        })
        it('Returns Buyer', async () => {
            const result = await greenplanet.buyer();
            expect(result).to.be.equal(buyer.address);
        })
    })
    describe('Listing', async () => {
        it('NFT listed', async () => {
            const result = await greenplanet.isListed(1);
            expect(result).to.be.true;
        })
            it('Getting the NFT to contract', async () => {
            expect(await greenToken.ownerOf(1)).to.be.equal(greenplanet.address);

        })
        it('Returns price of NFT', async () => {
            const result = await greenplanet.price(1);
            expect(result).to.be.equal(tokens(10));
        })
        it('Returns amount of NFT', async () => {
            const result = await greenplanet.amount(1);
            expect(result).to.be.equal(tokens(5));
        })
        it('Returns buyer of NFT', async () => {
            const result = await greenplanet.buyerof(1);
            expect(result).to.be.equal(buyer.address);
        })

    })
    describe('Checking', async () => {
        it("Checking the inspection", async () => {
            const transaction = await greenplanet.connect(inspector).updateInspection(1, true);
            await transaction.wait();
            const result = await greenplanet.inspectionPassed(1);
            expect(result).to.be.true;
        })
        it("Checking the Approval", async () => {
            let transaction = await greenplanet.connect(buyer).approve(1);
            await transaction.wait();

            transaction = await greenplanet.connect(seller).approve(1);
            await transaction.wait();

            expect(await greenplanet.approval(1, buyer.address)).to.be.equal(true);
            expect(await greenplanet.approval(1, seller.address)).to.be.equal(true);
        })
    })
    describe('Process', async () => {
        beforeEach(async () => {
            let transaction = await greenplanet.connect(inspector).updateInspection(1, true);
            await transaction.wait();

            transaction = await greenplanet.connect(buyer).approve(1);
            await transaction.wait();

            transaction = await greenplanet.connect(seller).approve(1);
            await transaction.wait();
        })
        it('Updates Balance', async () => {
            expect(await greenplanet.getBalance()).to.be.equal(0);
        })
    })
})
