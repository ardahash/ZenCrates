// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IStakedCrates {
  function stakedBalanceOf(address account) external view returns (uint256);
}
