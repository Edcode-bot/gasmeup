import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address))
  );

  const platformWallet = process.env.PLATFORM_WALLET!;
  const platformFeeBps = 300; // 3%
  const minContribution = ethers.parseEther("0.001");

  const GasMeUp = await ethers.getContractFactory("GasMeUp");
  const gasMeUp = await GasMeUp.deploy(
    platformWallet,
    platformFeeBps,
    minContribution
  );

  await gasMeUp.waitForDeployment();

  const address = await gasMeUp.getAddress();
  console.log("✅ GasMeUp deployed to:", address);
  console.log("Platform Wallet:", platformWallet);
  console.log("Platform Fee:", platformFeeBps / 100, "%");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

