// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { IPriceOracle } from "../interfaces/IPriceOracle.sol";

contract SignedPriceOracle is IPriceOracle, AccessControl, EIP712 {
  bytes32 public constant SIGNER_ADMIN_ROLE = keccak256("SIGNER_ADMIN_ROLE");

  struct PriceData {
    uint256 price;
    uint64 timestamp;
    uint64 nonce;
  }

  struct PriceUpdate {
    bytes32 crateId;
    uint256 price;
    uint64 timestamp;
    uint64 nonce;
  }

  bytes32 private constant PRICE_UPDATE_TYPEHASH =
    keccak256("PriceUpdate(bytes32 crateId,uint256 price,uint64 timestamp,uint64 nonce)");

  mapping(bytes32 => PriceData) private _prices;
  mapping(address => bool) public isSigner;
  uint256 public signerCount;
  uint256 public threshold;
  uint64 public maxAge;
  uint16 public maxDeviationBps;

  error InvalidSignature();
  error NotEnoughSignatures(uint256 provided, uint256 required);
  error UnauthorizedSigner(address signer);
  error DuplicateSigner(address signer);
  error StaleUpdate(uint64 timestamp, uint64 maxAge);
  error FutureTimestamp(uint64 timestamp);
  error NonceTooLow(uint64 provided, uint64 expectedNext);
  error ThresholdTooHigh(uint256 threshold, uint256 signerCount);
  error DeviationTooHigh(uint256 previousPrice, uint256 newPrice, uint16 maxDeviationBps);

  event SignerUpdated(address indexed signer, bool approved);
  event ThresholdUpdated(uint256 threshold);
  event MaxAgeUpdated(uint64 maxAge);
  event MaxDeviationBpsUpdated(uint16 maxDeviationBps);
  event PriceUpdated(bytes32 indexed crateId, uint256 price, uint64 timestamp, uint64 nonce);

  constructor(
    address admin,
    address[] memory signers,
    uint256 threshold_,
    uint64 maxAge_,
    uint16 maxDeviationBps_
  ) EIP712("ZenCrates Oracle", "1") {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(SIGNER_ADMIN_ROLE, admin);
    maxAge = maxAge_;
    maxDeviationBps = maxDeviationBps_;

    for (uint256 i = 0; i < signers.length; i++) {
      _setSigner(signers[i], true);
    }
    _setThreshold(threshold_);
  }

  function getPrice(bytes32 crateId) external view returns (uint256 price, uint256 timestamp) {
    PriceData memory data = _prices[crateId];
    return (data.price, data.timestamp);
  }

  function latestData(bytes32 crateId) external view returns (PriceData memory) {
    return _prices[crateId];
  }

  function setSigner(address signer, bool approved)
    external
    onlyRole(SIGNER_ADMIN_ROLE)
  {
    _setSigner(signer, approved);
  }

  function setThreshold(uint256 threshold_) external onlyRole(SIGNER_ADMIN_ROLE) {
    _setThreshold(threshold_);
  }

  function setMaxAge(uint64 maxAge_) external onlyRole(SIGNER_ADMIN_ROLE) {
    maxAge = maxAge_;
    emit MaxAgeUpdated(maxAge_);
  }

  function setMaxDeviationBps(uint16 maxDeviationBps_)
    external
    onlyRole(SIGNER_ADMIN_ROLE)
  {
    maxDeviationBps = maxDeviationBps_;
    emit MaxDeviationBpsUpdated(maxDeviationBps_);
  }

  function updatePrice(PriceUpdate calldata update, bytes[] calldata signatures) external {
    if (signatures.length < threshold) {
      revert NotEnoughSignatures(signatures.length, threshold);
    }
    if (update.timestamp > block.timestamp) {
      revert FutureTimestamp(update.timestamp);
    }
    if (maxAge > 0 && block.timestamp - update.timestamp > maxAge) {
      revert StaleUpdate(update.timestamp, maxAge);
    }

    PriceData memory previous = _prices[update.crateId];
    if (update.nonce <= previous.nonce) {
      revert NonceTooLow(update.nonce, previous.nonce + 1);
    }

    if (maxDeviationBps > 0 && previous.price > 0) {
      uint256 diff = update.price > previous.price
        ? update.price - previous.price
        : previous.price - update.price;
      if (diff * 10_000 > previous.price * maxDeviationBps) {
        revert DeviationTooHigh(previous.price, update.price, maxDeviationBps);
      }
    }

    bytes32 digest = _hashTypedDataV4(
      keccak256(
        abi.encode(
          PRICE_UPDATE_TYPEHASH,
          update.crateId,
          update.price,
          update.timestamp,
          update.nonce
        )
      )
    );

    address lastSigner = address(0);
    uint256 validCount = 0;

    for (uint256 i = 0; i < signatures.length; i++) {
      address signer = ECDSA.recover(digest, signatures[i]);
      if (!isSigner[signer]) revert UnauthorizedSigner(signer);
      if (signer <= lastSigner) revert DuplicateSigner(signer);
      lastSigner = signer;
      validCount++;
      if (validCount >= threshold) {
        break;
      }
    }

    if (validCount < threshold) {
      revert InvalidSignature();
    }

    _prices[update.crateId] = PriceData({
      price: update.price,
      timestamp: update.timestamp,
      nonce: update.nonce
    });

    emit PriceUpdated(update.crateId, update.price, update.timestamp, update.nonce);
  }

  function _setSigner(address signer, bool approved) internal {
    if (signer == address(0)) return;
    bool current = isSigner[signer];
    if (current == approved) return;

    isSigner[signer] = approved;
    if (approved) {
      signerCount += 1;
    } else {
      signerCount -= 1;
      if (threshold > signerCount) {
        revert ThresholdTooHigh(threshold, signerCount);
      }
    }
    emit SignerUpdated(signer, approved);
  }

  function _setThreshold(uint256 threshold_) internal {
    if (threshold_ == 0 || threshold_ > signerCount) {
      revert ThresholdTooHigh(threshold_, signerCount);
    }
    threshold = threshold_;
    emit ThresholdUpdated(threshold_);
  }
}
