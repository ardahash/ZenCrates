// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { FeeRebateController } from "../FeeRebateController.sol";

abstract contract CrateFeeBase is AccessControl, Pausable, ReentrancyGuard {
  bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

  FeeRebateController public rebateController;
  uint256 public immutable crateId;

  event FeeCharged(
    address indexed user,
    uint256 grossFee,
    uint16 rebateBps,
    uint256 netFee,
    uint256 indexed crateId
  );
  event RebateControllerUpdated(address indexed newController);

  error ZeroFee();

  constructor(uint256 crateId_, address rebateController_, address admin) {
    crateId = crateId_;
    rebateController = FeeRebateController(rebateController_);
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(FEE_MANAGER_ROLE, admin);
  }

  function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
    _pause();
  }

  function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
    _unpause();
  }

  function setRebateController(address newController)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    rebateController = FeeRebateController(newController);
    emit RebateControllerUpdated(newController);
  }

  function computeNetFee(address user, uint256 grossFee)
    public
    view
    returns (uint16 rebateBps, uint256 netFee)
  {
    if (grossFee == 0) return (0, 0);
    rebateBps = rebateController.rebateBps(user);
    uint256 rebateAmount = (grossFee * rebateBps) / 10_000;
    netFee = grossFee - rebateAmount;
  }

  function chargeFee(address user, uint256 grossFee)
    external
    whenNotPaused
    nonReentrant
    onlyRole(FEE_MANAGER_ROLE)
    returns (uint256 netFee)
  {
    if (grossFee == 0) revert ZeroFee();
    (uint16 rebateBps, uint256 computedNet) = computeNetFee(user, grossFee);
    netFee = computedNet;
    emit FeeCharged(user, grossFee, rebateBps, netFee, crateId);
  }
}
