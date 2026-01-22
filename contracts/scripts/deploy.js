const hre = require("hardhat");

async function main() {
  console.log("Deploying LastRallyNFT to", hre.network.name);

  const LastRallyNFT = await hre.ethers.getContractFactory("LastRallyNFT");
  const nft = await LastRallyNFT.deploy();

  await nft.waitForDeployment();

  const address = await nft.getAddress();
  console.log("LastRallyNFT deployed to:", address);

  // Wait for confirmations before verifying
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await nft.deploymentTransaction().wait(5);

    console.log("Verifying contract on Snowtrace...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Log deployment info
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Contract:", address);
  console.log("Owner:", (await hre.ethers.getSigners())[0].address);
  console.log("\nAdd to .env:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
