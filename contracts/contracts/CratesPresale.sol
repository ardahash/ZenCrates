// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CratesPresale is AccessControl, Pausable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 public constant CONFIG_ROLE = keccak256("CONFIG_ROLE");

  IERC20 public immutable crates;
  address public treasury;
  uint256 public cratesPerEth;
  uint256 public maxEth;
  uint256 public totalEthRaised;

  uint256 private constant WAD = 1e18;

  error AmountZero();
  error CapExceeded(uint256 remainingEth);
  error InsufficientCrates(uint256 available, uint256 required);
  error InvalidAddress();
  error InvalidPrice();
  error MaxEthTooLow(uint256 minRequired);
  error EthTransferFailed();

  event Purchase(address indexed buyer, uint256 ethIn, uint256 cratesOut);
  event TreasuryUpdated(address indexed treasury);
  event PriceUpdated(uint256 cratesPerEth);
  event MaxEthUpdated(uint256 maxEth);
  event UnsoldWithdrawn(address indexed to, uint256 amount);

  constructor(
    address cratesToken,
    address treasury_,
    uint256 cratesPerEth_,
    uint256 maxEth_,
    address admin
  ) {
    if (cratesToken == address(0) || treasury_ == address(0) || admin == address(0)) {
      revert InvalidAddress();
    }
    if (cratesPerEth_ == 0) revert InvalidPrice();

    crates = IERC20(cratesToken);
    treasury = treasury_;
    cratesPerEth = cratesPerEth_;
    maxEth = maxEth_;

    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(PAUSER_ROLE, admin);
    _grantRole(CONFIG_ROLE, admin);
  }

  receive() external payable {
    _buy(msg.sender, msg.value);
  }

  function buy() external payable whenNotPaused returns (uint256) {
    return _buy(msg.sender, msg.value);
  }

  function quote(uint256 ethAmount) public view returns (uint256) {
    if (ethAmount == 0) return 0;
    return (ethAmount * cratesPerEth) / WAD;
  }

  function setTreasury(address newTreasury) external onlyRole(CONFIG_ROLE) {
    if (newTreasury == address(0)) revert InvalidAddress();
    treasury = newTreasury;
    emit TreasuryUpdated(newTreasury);
  }

  function setCratesPerEth(uint256 newCratesPerEth) external onlyRole(CONFIG_ROLE) {
    if (newCratesPerEth == 0) revert InvalidPrice();
    cratesPerEth = newCratesPerEth;
    emit PriceUpdated(newCratesPerEth);
  }

  function setMaxEth(uint256 newMaxEth) external onlyRole(CONFIG_ROLE) {
    if (newMaxEth < totalEthRaised) {
      revert MaxEthTooLow(totalEthRaised);
    }
    maxEth = newMaxEth;
    emit MaxEthUpdated(newMaxEth);
  }

  function withdrawUnsold(address to, uint256 amount) external onlyRole(CONFIG_ROLE) {
    if (to == address(0)) revert InvalidAddress();
    crates.safeTransfer(to, amount);
    emit UnsoldWithdrawn(to, amount);
  }

  function pause() external onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() external onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  function _buy(address buyer, uint256 ethAmount) internal nonReentrant whenNotPaused returns (uint256) {
    if (ethAmount == 0) revert AmountZero();

    uint256 newTotal = totalEthRaised + ethAmount;
    if (maxEth > 0 && newTotal > maxEth) {
      uint256 remaining = maxEth - totalEthRaised;
      revert CapExceeded(remaining);
    }

    uint256 cratesOut = quote(ethAmount);
    if (cratesOut == 0) revert AmountZero();

    uint256 available = crates.balanceOf(address(this));
    if (available < cratesOut) {
      revert InsufficientCrates(available, cratesOut);
    }

    totalEthRaised = newTotal;
    crates.safeTransfer(buyer, cratesOut);

    (bool success, ) = treasury.call{ value: ethAmount }("");
    if (!success) revert EthTransferFailed();

    emit Purchase(buyer, ethAmount, cratesOut);
    return cratesOut;
  }
}
