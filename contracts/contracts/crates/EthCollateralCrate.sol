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
  }

  struct FeeConfig {
    uint16 mintFeeBps;
    uint16 burnFeeBps;
    address treasury;
  }

  IPriceOracle public priceOracle;
  bytes32 public priceOracleId;
  IPriceOracle public ethOracle;
  bytes32 public ethOracleId;
  uint8 public priceDecimals;
  uint8 public ethPriceDecimals;

  uint16 public mintFeeBps;
  uint16 public burnFeeBps;
  address public treasury;

  error AmountZero();
  error InvalidAddress();
  error InvalidFee();
  error ZeroPrice();
  error InsufficientLiquidity(uint256 available, uint256 required);
  error EthTransferFailed();

  event Minted(address indexed user, uint256 ethIn, uint256 tokensOut, uint256 feeEth);
  event Burned(address indexed user, uint256 tokensIn, uint256 ethOut, uint256 feeEth);
  event FeesUpdated(uint16 mintFeeBps, uint16 burnFeeBps);
  event TreasuryUpdated(address indexed treasury);
  event OraclesUpdated(address indexed priceOracle, bytes32 indexed priceOracleId, address indexed ethOracle, bytes32 ethOracleId);
  event DecimalsUpdated(uint8 priceDecimals, uint8 ethPriceDecimals);

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
    if (feeCfg.mintFeeBps > 10_000 || feeCfg.burnFeeBps > 10_000) revert InvalidFee();

    priceOracle = IPriceOracle(oracleCfg.priceOracle);
    priceOracleId = oracleCfg.priceOracleId;
    ethOracle = IPriceOracle(oracleCfg.ethOracle);
    ethOracleId = oracleCfg.ethOracleId;
    priceDecimals = oracleCfg.priceDecimals;
    ethPriceDecimals = oracleCfg.ethPriceDecimals;
    mintFeeBps = feeCfg.mintFeeBps;
    burnFeeBps = feeCfg.burnFeeBps;
    treasury = feeCfg.treasury;

    emit FeesUpdated(feeCfg.mintFeeBps, feeCfg.burnFeeBps);
    emit TreasuryUpdated(feeCfg.treasury);
    emit OraclesUpdated(oracleCfg.priceOracle, oracleCfg.priceOracleId, oracleCfg.ethOracle, oracleCfg.ethOracleId);
    emit DecimalsUpdated(oracleCfg.priceDecimals, oracleCfg.ethPriceDecimals);
  }

  receive() external payable {
    revert("Use mint()");
  }

  function latestPrice() external view returns (uint256 price, uint256 timestamp) {
    return priceOracle.getPrice(priceOracleId);
  }

  function latestEthPrice() external view returns (uint256 price, uint256 timestamp) {
    return ethOracle.getPrice(ethOracleId);
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

  function setFees(uint16 newMintFeeBps, uint16 newBurnFeeBps)
    external
    onlyRole(FEE_MANAGER_ROLE)
  {
    if (newMintFeeBps > 10_000 || newBurnFeeBps > 10_000) revert InvalidFee();
    mintFeeBps = newMintFeeBps;
    burnFeeBps = newBurnFeeBps;
    emit FeesUpdated(newMintFeeBps, newBurnFeeBps);
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
    (uint256 ethUsd, ) = ethOracle.getPrice(ethOracleId);
    (uint256 cratePrice, ) = priceOracle.getPrice(priceOracleId);
    if (ethUsd == 0 || cratePrice == 0) revert ZeroPrice();

    uint256 usdValue = Math.mulDiv(ethAmount, ethUsd, 1e18);
    usdValue = _alignDecimals(usdValue, ethPriceDecimals, priceDecimals);
    return Math.mulDiv(usdValue, 1e18, cratePrice);
  }

  function _cratesToEth(uint256 tokensIn) internal view returns (uint256) {
    (uint256 ethUsd, ) = ethOracle.getPrice(ethOracleId);
    (uint256 cratePrice, ) = priceOracle.getPrice(priceOracleId);
    if (ethUsd == 0 || cratePrice == 0) revert ZeroPrice();

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
}