// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  let buyer, seller, inspector, greenplanet;
  // let greenToken;
  const signers = await ethers.getSigners();
  buyer = signers[0];
  seller = signers[1];
  inspector = signers[2];
  const GreenToken = await ethers.getContractFactory("GreenToken"); 
  const greenToken = await GreenToken.deploy(); 
  await greenToken.deployed();

  console.log("GreenToken deployed to:", greenToken.address);
  console.log("Minting...");
  for (let i = 0; i < 3; i++) {
    const transaction = await greenToken.connect(seller).mint(`https://nftsjkjk.infura-ipfs.io/ipfs/QmXM6SHsYpMCuzDLHXqh2Ks6r1airycFowE69v5kMgx18y/metadata/${i + 1}.json}`)
    await transaction.wait()
    console.log(`Minted token #${i + 1}`)
  }
  const Greenplanet = await ethers.getContractFactory("GreenPlanet"); 
  greenplanet = await Greenplanet.deploy( greenToken.address, seller.address, buyer.address, inspector.address);
  await greenplanet.deployed();
  
  console.log(`Deployed GreenPlanet Contract at: ${greenplanet.address}`)
  console.log(`Listing 3 properties...\n`)

  for (let i = 0; i < 3; i++) {
    // Approve properties...
    let transaction = await greenToken.connect(seller).approve(greenplanet.address, i + 1)
    await transaction.wait()
  }

  // Listing properties...
  let transaction = await greenplanet.connect(seller).list(1,  tokens(20), buyer.address,tokens(10))
  await transaction.wait()

  transaction = await greenplanet.connect(seller).list(2, tokens(15), buyer.address, tokens(5))
  await transaction.wait()

  transaction = await greenplanet.connect(seller).list(3, tokens(10), buyer.address, tokens(5))
  await transaction.wait()

  console.log(`Finished.`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
