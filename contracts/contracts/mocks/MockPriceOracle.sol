// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IPriceOracle } from "../interfaces/IPriceOracle.sol";

contract MockPriceOracle is IPriceOracle {
  mapping(bytes32 => uint256) private _prices;
  mapping(bytes32 => uint256) private _timestamps;

  function setPrice(bytes32 id, uint256 price) external {
    _prices[id] = price;
    _timestamps[id] = block.timestamp;
  }

  function getPrice(bytes32 id) external view returns (uint256 price, uint256 timestamp) {
    return (_prices[id], _timestamps[id]);
  }
}
