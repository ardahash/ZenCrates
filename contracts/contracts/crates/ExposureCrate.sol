// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { CrateFeeBase } from "./CrateFeeBase.sol";
import { IPriceOracle } from "../interfaces/IPriceOracle.sol";

contract ExposureCrate is CrateFeeBase {
  IPriceOracle public oracle;
  bytes32 public oracleId;

  event OracleUpdated(address indexed oracle, bytes32 indexed oracleId);

  constructor(
    uint256 crateId_,
    address rebateController_,
    address oracle_,
    bytes32 oracleId_,
    address admin
  ) CrateFeeBase(crateId_, rebateController_, admin) {
    oracle = IPriceOracle(oracle_);
    oracleId = oracleId_;
    emit OracleUpdated(oracle_, oracleId_);
  }

  function setOracle(address newOracle, bytes32 newOracleId)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    oracle = IPriceOracle(newOracle);
    oracleId = newOracleId;
    emit OracleUpdated(newOracle, newOracleId);
  }

  function latestPrice() external view returns (uint256 price, uint256 timestamp) {
    return oracle.getPrice(oracleId);
  }
}
