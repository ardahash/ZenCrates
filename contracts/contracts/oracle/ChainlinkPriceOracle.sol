// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IPriceOracle } from "../interfaces/IPriceOracle.sol";

interface AggregatorV3Interface {
  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
}

contract ChainlinkPriceOracle is IPriceOracle, AccessControl {
  bytes32 public constant FEED_ADMIN_ROLE = keccak256("FEED_ADMIN_ROLE");
  mapping(bytes32 => AggregatorV3Interface) public feeds;

  event FeedUpdated(bytes32 indexed crateId, address indexed feed);

  constructor(address admin) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(FEED_ADMIN_ROLE, admin);
  }

  function setFeed(bytes32 crateId, address feed) external onlyRole(FEED_ADMIN_ROLE) {
    feeds[crateId] = AggregatorV3Interface(feed);
    emit FeedUpdated(crateId, feed);
  }

  function getPrice(bytes32 crateId) external view returns (uint256 price, uint256 timestamp) {
    AggregatorV3Interface feed = feeds[crateId];
    (, int256 answer, , uint256 updatedAt, ) = feed.latestRoundData();
    if (answer < 0) {
      return (0, updatedAt);
    }
    return (uint256(answer), updatedAt);
  }
}
