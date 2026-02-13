// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ExposureCrate } from "./ExposureCrate.sol";
import { StrategyCrate } from "./StrategyCrate.sol";
import { EthCollateralCrate } from "./EthCollateralCrate.sol";

contract CrateFactory is AccessControl {
  bytes32 public constant FACTORY_ADMIN_ROLE = keccak256("FACTORY_ADMIN_ROLE");

  address[] public allCrates;
  mapping(uint256 => address) public crateById;

  event ExposureCrateDeployed(address indexed crate, uint256 indexed crateId, bytes32 oracleId);
  event StrategyCrateDeployed(address indexed crate, uint256 indexed crateId);
  event EthCollateralCrateDeployed(
    address indexed crate,
    uint256 indexed crateId,
    bytes32 oracleId,
    bytes32 ethOracleId
  );

  constructor(address admin) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(FACTORY_ADMIN_ROLE, admin);
  }

  function createExposureCrate(
    uint256 crateId,
    address rebateController,
    address oracle,
    bytes32 oracleId,
    address admin
  ) external onlyRole(FACTORY_ADMIN_ROLE) returns (address) {
    ExposureCrate crate = new ExposureCrate(crateId, rebateController, oracle, oracleId, admin);
    address crateAddress = address(crate);
    _trackCrate(crateId, crateAddress);
    emit ExposureCrateDeployed(crateAddress, crateId, oracleId);
    return crateAddress;
  }

  function createStrategyCrate(
    uint256 crateId,
    address rebateController,
    address admin
  ) external onlyRole(FACTORY_ADMIN_ROLE) returns (address) {
    StrategyCrate crate = new StrategyCrate(crateId, rebateController, admin);
    address crateAddress = address(crate);
    _trackCrate(crateId, crateAddress);
    emit StrategyCrateDeployed(crateAddress, crateId);
    return crateAddress;
  }

  function createEthCollateralCrate(
    string memory name,
    string memory symbol,
    uint256 crateId,
    address rebateController,
    EthCollateralCrate.OracleConfig calldata oracleCfg,
    EthCollateralCrate.FeeConfig calldata feeCfg,
    address admin
  ) external onlyRole(FACTORY_ADMIN_ROLE) returns (address) {
    EthCollateralCrate crate = new EthCollateralCrate(
      name,
      symbol,
      crateId,
      rebateController,
      oracleCfg,
      feeCfg,
      admin
    );
    address crateAddress = address(crate);
    _trackCrate(crateId, crateAddress);
    emit EthCollateralCrateDeployed(crateAddress, crateId, oracleCfg.priceOracleId, oracleCfg.ethOracleId);
    return crateAddress;
  }

  function crateCount() external view returns (uint256) {
    return allCrates.length;
  }

  function _trackCrate(uint256 crateId, address crateAddress) internal {
    allCrates.push(crateAddress);
    crateById[crateId] = crateAddress;
  }
}
