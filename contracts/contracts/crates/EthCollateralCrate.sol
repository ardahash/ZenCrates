// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IPriceOracle } from "../interfaces/IPriceOracle.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { CrateFeeBase } from "./CrateFeeBase.sol";

contract EthCollateralCrate is ERC20, CrateFeeBase {
  struct OracleConfig {
    address priceOracle;
    bytes32 priceOracleId;
    address ethOracle;
    bytes32 ethOracleId;
    uint8 priceDecimals;
    uint8 ethPriceDecimals;
    uint64 priceMaxAge;
    uint64 ethPriceMaxAge;
    bool priceInverted;
    uint256 unitScale;
  }

  struct FeeConfig {
    uint16 mintFeeBps;
    uint16 burnFeeBps;
    uint16 collateralFactorBps;
    address treasury;
  }

  IPriceOracle public priceOracle;
  bytes32 public priceOracleId;
  IPriceOracle public ethOracle;
  bytes32 public ethOracleId;
  uint8 public priceDecimals;
  uint8 public ethPriceDecimals;
  uint64 public priceMaxAge;
  uint64 public ethPriceMaxAge;
  bool public priceInverted;
  // 1e18 = 1 token per oracle unit (e.g., 1 GLD share). Adjust to change token unit.
  uint256 public unitScale;

  uint256 public constant UNIT_SCALE = 1e18;

  uint16 public mintFeeBps;
  uint16 public burnFeeBps;
  uint16 public collateralFactorBps;
  address public treasury;

  error AmountZero();
  error InvalidAddress();
  error InvalidFee();
  error InvalidCollateralFactor();
  error ZeroPrice();
  error StalePrice(uint256 timestamp, uint64 maxAge);
  error InvalidUnitScale();
  error InsufficientLiquidity(uint256 available, uint256 required);
  error EthTransferFailed();

  event Minted(address indexed user, uint256 ethIn, uint256 tokensOut, uint256 feeEth);
  event Burned(address indexed user, uint256 tokensIn, uint256 ethOut, uint256 feeEth);
  event FeesUpdated(uint16 mintFeeBps, uint16 burnFeeBps);
  event CollateralFactorUpdated(uint16 collateralFactorBps);
  event TreasuryUpdated(address indexed treasury);
  event OraclesUpdated(address indexed priceOracle, bytes32 indexed priceOracleId, address indexed ethOracle, bytes32 ethOracleId);
  event DecimalsUpdated(uint8 priceDecimals, uint8 ethPriceDecimals);
  event OracleMaxAgeUpdated(uint64 priceMaxAge, uint64 ethPriceMaxAge);
  event PriceInversionUpdated(bool priceInverted);
  event UnitScaleUpdated(uint256 unitScale);

  constructor(
    string memory name_,
    string memory symbol_,
    uint256 crateId_,
    address rebateController_,
    OracleConfig memory oracleCfg,
    FeeConfig memory feeCfg,
    address admin
  ) ERC20(name_, symbol_) CrateFeeBase(crateId_, rebateController_, admin) {
    if (
      oracleCfg.priceOracle == address(0) ||
      oracleCfg.ethOracle == address(0) ||
      feeCfg.treasury == address(0) ||
      admin == address(0)
    ) {
      revert InvalidAddress();
    }
    if (oracleCfg.unitScale == 0) revert InvalidUnitScale();
    if (feeCfg.mintFeeBps > 10_000 || feeCfg.burnFeeBps > 10_000) revert InvalidFee();
    if (feeCfg.collateralFactorBps < 10_000 || feeCfg.collateralFactorBps > 100_000) {
      revert InvalidCollateralFactor();
    }

    priceOracle = IPriceOracle(oracleCfg.priceOracle);
    priceOracleId = oracleCfg.priceOracleId;
    ethOracle = IPriceOracle(oracleCfg.ethOracle);
    ethOracleId = oracleCfg.ethOracleId;
    priceDecimals = oracleCfg.priceDecimals;
    ethPriceDecimals = oracleCfg.ethPriceDecimals;
    priceMaxAge = oracleCfg.priceMaxAge;
    ethPriceMaxAge = oracleCfg.ethPriceMaxAge;
    priceInverted = oracleCfg.priceInverted;
    unitScale = oracleCfg.unitScale;
    mintFeeBps = feeCfg.mintFeeBps;
    burnFeeBps = feeCfg.burnFeeBps;
    collateralFactorBps = feeCfg.collateralFactorBps;
    treasury = feeCfg.treasury;

    emit FeesUpdated(feeCfg.mintFeeBps, feeCfg.burnFeeBps);
    emit CollateralFactorUpdated(feeCfg.collateralFactorBps);
    emit TreasuryUpdated(feeCfg.treasury);
    emit OraclesUpdated(oracleCfg.priceOracle, oracleCfg.priceOracleId, oracleCfg.ethOracle, oracleCfg.ethOracleId);
    emit DecimalsUpdated(oracleCfg.priceDecimals, oracleCfg.ethPriceDecimals);
    emit OracleMaxAgeUpdated(oracleCfg.priceMaxAge, oracleCfg.ethPriceMaxAge);
    emit PriceInversionUpdated(oracleCfg.priceInverted);
    emit UnitScaleUpdated(oracleCfg.unitScale);
  }

  receive() external payable {
    revert("Use mint()");
  }

  function latestPrice() external view returns (uint256 price, uint256 timestamp) {
    (uint256 raw, uint256 ts) = priceOracle.getPrice(priceOracleId);
    return (_normalizePrice(raw, priceDecimals, priceInverted, true), ts);
  }

  function latestEthPrice() external view returns (uint256 price, uint256 timestamp) {
    (uint256 raw, uint256 ts) = ethOracle.getPrice(ethOracleId);
    return (_normalizePrice(raw, ethPriceDecimals, false, false), ts);
  }

  function setOracles(
    address newPriceOracle,
    bytes32 newPriceOracleId,
    address newEthOracle,
    bytes32 newEthOracleId
  ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (newPriceOracle == address(0) || newEthOracle == address(0)) revert InvalidAddress();
    priceOracle = IPriceOracle(newPriceOracle);
    priceOracleId = newPriceOracleId;
    ethOracle = IPriceOracle(newEthOracle);
    ethOracleId = newEthOracleId;
    emit OraclesUpdated(newPriceOracle, newPriceOracleId, newEthOracle, newEthOracleId);
  }

  function setDecimals(uint8 newPriceDecimals, uint8 newEthPriceDecimals)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    priceDecimals = newPriceDecimals;
    ethPriceDecimals = newEthPriceDecimals;
    emit DecimalsUpdated(newPriceDecimals, newEthPriceDecimals);
  }

  function setOracleMaxAge(uint64 newPriceMaxAge, uint64 newEthPriceMaxAge)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    priceMaxAge = newPriceMaxAge;
    ethPriceMaxAge = newEthPriceMaxAge;
    emit OracleMaxAgeUpdated(newPriceMaxAge, newEthPriceMaxAge);
  }

  function setPriceInversion(bool newPriceInverted)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    priceInverted = newPriceInverted;
    emit PriceInversionUpdated(newPriceInverted);
  }

  function setUnitScale(uint256 newUnitScale)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    if (newUnitScale == 0) revert InvalidUnitScale();
    unitScale = newUnitScale;
    emit UnitScaleUpdated(newUnitScale);
  }

  function setFees(uint16 newMintFeeBps, uint16 newBurnFeeBps)
    external
    onlyRole(FEE_MANAGER_ROLE)
  {
    if (newMintFeeBps > 10_000 || newBurnFeeBps > 10_000) revert InvalidFee();
    mintFeeBps = newMintFeeBps;
    burnFeeBps = newBurnFeeBps;
    emit FeesUpdated(newMintFeeBps, newBurnFeeBps);
  }

  function setCollateralFactor(uint16 newCollateralFactorBps)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    if (newCollateralFactorBps < 10_000 || newCollateralFactorBps > 100_000) {
      revert InvalidCollateralFactor();
    }
    collateralFactorBps = newCollateralFactorBps;
    emit CollateralFactorUpdated(newCollateralFactorBps);
  }

  function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (newTreasury == address(0)) revert InvalidAddress();
    treasury = newTreasury;
    emit TreasuryUpdated(newTreasury);
  }

  function previewMint(address user, uint256 ethIn)
    public
    view
    returns (uint256 tokensOut, uint256 feeEth)
  {
    if (ethIn == 0) return (0, 0);
    uint256 grossFee = (ethIn * mintFeeBps) / 10_000;
    (, uint256 netFee) = computeNetFee(user, grossFee);
    uint256 netEth = ethIn - netFee;
    tokensOut = _ethToCrates(netEth);
    if (collateralFactorBps != 10_000) {
      tokensOut = (tokensOut * 10_000) / collateralFactorBps;
    }
    feeEth = netFee;
  }

  function previewBurn(address user, uint256 tokensIn)
    public
    view
    returns (uint256 ethOut, uint256 feeEth)
  {
    if (tokensIn == 0) return (0, 0);
    uint256 grossEth = _cratesToEth(tokensIn);
    uint256 grossFee = (grossEth * burnFeeBps) / 10_000;
    (, uint256 netFee) = computeNetFee(user, grossFee);
    ethOut = grossEth - netFee;
    feeEth = netFee;
  }

  function mint() external payable nonReentrant whenNotPaused returns (uint256) {
    if (msg.value == 0) revert AmountZero();
    (uint256 tokensOut, uint256 feeEth) = previewMint(msg.sender, msg.value);
    if (tokensOut == 0) revert AmountZero();

    _mint(msg.sender, tokensOut);
    _transferFee(feeEth);

    emit Minted(msg.sender, msg.value, tokensOut, feeEth);
    return tokensOut;
  }

  function burn(uint256 tokensIn) external nonReentrant whenNotPaused returns (uint256) {
    if (tokensIn == 0) revert AmountZero();
    (uint256 ethOut, uint256 feeEth) = previewBurn(msg.sender, tokensIn);
    if (ethOut == 0) revert AmountZero();

    uint256 available = address(this).balance;
    if (available < ethOut + feeEth) {
      revert InsufficientLiquidity(available, ethOut + feeEth);
    }

    _burn(msg.sender, tokensIn);
    _transferFee(feeEth);

    (bool success, ) = msg.sender.call{ value: ethOut }("");
    if (!success) revert EthTransferFailed();

    emit Burned(msg.sender, tokensIn, ethOut, feeEth);
    return ethOut;
  }

  function _transferFee(uint256 feeEth) internal {
    if (feeEth == 0) return;
    (bool success, ) = treasury.call{ value: feeEth }("");
    if (!success) revert EthTransferFailed();
  }

  function _ethToCrates(uint256 ethAmount) internal view returns (uint256) {
    (uint256 ethUsd, ) = _checkedOraclePrice(
      ethOracle,
      ethOracleId,
      ethPriceDecimals,
      ethPriceMaxAge,
      false,
      false
    );
    (uint256 cratePrice, ) = _checkedOraclePrice(
      priceOracle,
      priceOracleId,
      priceDecimals,
      priceMaxAge,
      priceInverted,
      true
    );

    uint256 usdValue = Math.mulDiv(ethAmount, ethUsd, 1e18);
    usdValue = _alignDecimals(usdValue, ethPriceDecimals, priceDecimals);
    return Math.mulDiv(usdValue, 1e18, cratePrice);
  }

  function _cratesToEth(uint256 tokensIn) internal view returns (uint256) {
    (uint256 ethUsd, ) = _checkedOraclePrice(
      ethOracle,
      ethOracleId,
      ethPriceDecimals,
      ethPriceMaxAge,
      false,
      false
    );
    (uint256 cratePrice, ) = _checkedOraclePrice(
      priceOracle,
      priceOracleId,
      priceDecimals,
      priceMaxAge,
      priceInverted,
      true
    );

    uint256 usdValue = Math.mulDiv(tokensIn, cratePrice, 1e18);
    usdValue = _alignDecimals(usdValue, priceDecimals, ethPriceDecimals);
    return Math.mulDiv(usdValue, 1e18, ethUsd);
  }

  function _alignDecimals(uint256 value, uint8 fromDecimals, uint8 toDecimals)
    internal
    pure
    returns (uint256)
  {
    if (fromDecimals == toDecimals) return value;
    if (fromDecimals > toDecimals) {
      return value / (10 ** (fromDecimals - toDecimals));
    }
    return value * (10 ** (toDecimals - fromDecimals));
  }

  function _checkedOraclePrice(
    IPriceOracle oracle,
    bytes32 id,
    uint8 decimals,
    uint64 maxAge,
    bool inverted,
    bool applyUnitScale
  ) internal view returns (uint256 price, uint256 timestamp) {
    (uint256 raw, uint256 ts) = oracle.getPrice(id);
    if (raw == 0) revert ZeroPrice();
    if (maxAge > 0 && block.timestamp > ts + maxAge) {
      revert StalePrice(ts, maxAge);
    }
    price = _normalizePrice(raw, decimals, inverted, applyUnitScale);
    timestamp = ts;
  }

  function _normalizePrice(
    uint256 raw,
    uint8 decimals,
    bool inverted,
    bool applyUnitScale
  ) internal view returns (uint256) {
    if (raw == 0) return 0;
    uint256 price = raw;
    if (inverted) {
      uint256 scale = 10 ** decimals;
      price = Math.mulDiv(scale, scale, price);
    }
    if (applyUnitScale && unitScale != UNIT_SCALE) {
      price = Math.mulDiv(price, unitScale, UNIT_SCALE);
    }
    return price;
  }
}
