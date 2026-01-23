// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract GasMeUp is Ownable, ReentrancyGuard, Pausable {
    // Platform wallet receives 3% fee
    address public platformWallet;

    // Platform fee: 300 = 3%
    uint256 public platformFeeBps;

    // Minimum contribution amount
    uint256 public minContribution;

    // Constants
    uint256 public constant MAX_BPS = 10000;
    uint256 public constant MAX_FEE_BPS = 1000; // 10% max

    // Track totals
    mapping(address => uint256) public builderTotalRaised;
    mapping(address => uint256) public supporterTotalGiven;

    // Support counter
    uint256 public supportCount;

    // Events
    event SupportSent(
        bytes32 indexed supportId,
        address indexed supporter,
        address indexed builder,
        uint256 builderAmount,
        uint256 fee,
        uint256 timestamp,
        string message
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformWalletUpdated(address oldWallet, address newWallet);

    // Errors
    error InvalidBuilder();
    error InvalidPlatformWallet();
    error InvalidFee();
    error InsufficientAmount();
    error TransferFailed();

    constructor(
        address _platformWallet,
        uint256 _platformFeeBps,
        uint256 _minContribution
    ) Ownable(msg.sender) {
        if (_platformWallet == address(0)) revert InvalidPlatformWallet();
        if (_platformFeeBps > MAX_FEE_BPS) revert InvalidFee();

        platformWallet = _platformWallet;
        platformFeeBps = _platformFeeBps;
        minContribution = _minContribution;
    }

    // Main support function
    function support(
        address builder,
        string calldata message
    ) external payable nonReentrant whenNotPaused returns (bytes32) {
        if (builder == address(0)) revert InvalidBuilder();
        if (msg.value < minContribution) revert InsufficientAmount();

        // Calculate amounts
        uint256 fee = (msg.value * platformFeeBps) / MAX_BPS;
        uint256 builderAmount = msg.value - fee;

        // Generate unique support ID
        bytes32 supportId = keccak256(
            abi.encodePacked(msg.sender, builder, block.timestamp, supportCount++)
        );

        // Update totals
        builderTotalRaised[builder] += builderAmount;
        supporterTotalGiven[msg.sender] += msg.value;

        // Transfer to builder (97%)
        (bool successBuilder, ) = builder.call{value: builderAmount}("");
        if (!successBuilder) revert TransferFailed();

        // Transfer fee to platform (3%)
        if (fee > 0) {
            (bool successPlatform, ) = platformWallet.call{value: fee}("");
            if (!successPlatform) revert TransferFailed();
        }

        // Emit event
        emit SupportSent(
            supportId,
            msg.sender,
            builder,
            builderAmount,
            fee,
            block.timestamp,
            message
        );

        return supportId;
    }

    // Calculate fee for display purposes
    function calculateFee(
        uint256 amount
    ) external view returns (uint256 fee, uint256 builderAmount) {
        fee = (amount * platformFeeBps) / MAX_BPS;
        builderAmount = amount - fee;
    }

    // Admin: Update platform fee
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert InvalidFee();
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }

    // Admin: Update platform wallet
    function setPlatformWallet(address newWallet) external onlyOwner {
        if (newWallet == address(0)) revert InvalidPlatformWallet();
        address oldWallet = platformWallet;
        platformWallet = newWallet;
        emit PlatformWalletUpdated(oldWallet, newWallet);
    }

    // Admin: Pause in emergency
    function pause() external onlyOwner {
        _pause();
    }

    // Admin: Unpause
    function unpause() external onlyOwner {
        _unpause();
    }

    // Reject direct ETH transfers
    receive() external payable {
        revert("Use support() function");
    }
}

