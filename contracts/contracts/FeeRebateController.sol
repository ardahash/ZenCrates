// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IStakedCrates } from "./interfaces/IStakedCrates.sol";

contract FeeRebateController is AccessControl {
  struct Tier {
    uint256 minAmount;
    uint16 rebateBps;
  }

  IStakedCrates public immutable staking;
  uint16 public maxRebateBps;
  Tier[] private _tiers;

  error InvalidTierOrder();
  error RebateTooHigh(uint16 rebateBps);
  error InvalidCap(uint16 cap);

  event MaxRebateBpsUpdated(uint16 oldCap, uint16 newCap);
  event TiersCleared(uint256 previousLength);
  event TierSet(uint256 index, uint256 minAmount, uint16 rebateBps);

  constructor(address stakingContract, address admin, uint16 capBps) {
    if (capBps > 10_000) revert InvalidCap(capBps);
    staking = IStakedCrates(stakingContract);
    maxRebateBps = capBps;
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
  }

  function tiers() external view returns (Tier[] memory) {
    return _tiers;
  }

  function rebateBps(address user) external view returns (uint16) {
    uint256 amount = staking.stakedBalanceOf(user);
    return _rebateFor(amount);
  }

  function rebateBpsForAmount(uint256 amount) external view returns (uint16) {
    return _rebateFor(amount);
  }

  function setMaxRebateBps(uint16 newCap) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (newCap > 10_000) revert InvalidCap(newCap);
    uint16 oldCap = maxRebateBps;
    maxRebateBps = newCap;
    emit MaxRebateBpsUpdated(oldCap, newCap);
  }

  function setTiers(Tier[] calldata newTiers) external onlyRole(DEFAULT_ADMIN_ROLE) {
    uint256 previousLength = _tiers.length;
    delete _tiers;
    emit TiersCleared(previousLength);

    uint256 lastMin = 0;
    for (uint256 i = 0; i < newTiers.length; i++) {
      Tier memory tier = newTiers[i];
      if (i > 0 && tier.minAmount <= lastMin) revert InvalidTierOrder();
      if (tier.rebateBps > maxRebateBps) revert RebateTooHigh(tier.rebateBps);
      _tiers.push(tier);
      emit TierSet(i, tier.minAmount, tier.rebateBps);
      lastMin = tier.minAmount;
    }
  }

  function _rebateFor(uint256 amount) internal view returns (uint16) {
    uint16 rebate = 0;
    for (uint256 i = 0; i < _tiers.length; i++) {
      if (amount >= _tiers[i].minAmount) {
        rebate = _tiers[i].rebateBps;
      } else {
        break;
      }
    }
    if (rebate > maxRebateBps) {
      rebate = maxRebateBps;
    }
    return rebate;
  }
}
