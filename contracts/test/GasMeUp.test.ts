import { expect } from "chai";
import { ethers } from "hardhat";

describe("GasMeUp", function () {
  let gasMeUp: any;
  let owner: any;
  let platformWallet: any;
  let builder: any;
  let supporter: any;

  beforeEach(async function () {
    [owner, platformWallet, builder, supporter] = await ethers.getSigners();

    const GasMeUp = await ethers.getContractFactory("GasMeUp");
    gasMeUp = await GasMeUp.deploy(
      platformWallet.address,
      300, // 3%
      ethers.parseEther("0.001") // 0.001 ETH min
    );
  });

  it("Should deploy with correct settings", async function () {
    expect(await gasMeUp.platformWallet()).to.equal(platformWallet.address);
    expect(await gasMeUp.platformFeeBps()).to.equal(300);
  });

  it("Should process support correctly", async function () {
    const amount = ethers.parseEther("1.0");

    const builderBefore = await ethers.provider.getBalance(builder.address);
    const platformBefore = await ethers.provider.getBalance(platformWallet.address);

    await gasMeUp
      .connect(supporter)
      .support(builder.address, "Great work!", { value: amount });

    const builderAfter = await ethers.provider.getBalance(builder.address);
    const platformAfter = await ethers.provider.getBalance(platformWallet.address);

    const expectedFee = (amount * 300n) / 10000n;
    const expectedBuilder = amount - expectedFee;

    expect(builderAfter - builderBefore).to.equal(expectedBuilder);
    expect(platformAfter - platformBefore).to.equal(expectedFee);
  });

  it("Should emit SupportSent event", async function () {
    await expect(
      gasMeUp.connect(supporter).support(builder.address, "Test", {
        value: ethers.parseEther("1.0"),
      })
    ).to.emit(gasMeUp, "SupportSent");
  });

  it("Should reject amount below minimum", async function () {
    await expect(
      gasMeUp.connect(supporter).support(builder.address, "", {
        value: ethers.parseEther("0.0001"),
      })
    ).to.be.revertedWithCustomError(gasMeUp, "InsufficientAmount");
  });

  it("Should update totals correctly", async function () {
    const amount = ethers.parseEther("1.0");
    await gasMeUp
      .connect(supporter)
      .support(builder.address, "", { value: amount });

    const expectedBuilder = amount - (amount * 300n) / 10000n;
    expect(await gasMeUp.builderTotalRaised(builder.address)).to.equal(
      expectedBuilder
    );
  });
});

