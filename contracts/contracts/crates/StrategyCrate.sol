// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { CrateFeeBase } from "./CrateFeeBase.sol";

contract StrategyCrate is CrateFeeBase {
  constructor(uint256 crateId_, address rebateController_, address admin)
    CrateFeeBase(crateId_, rebateController_, admin)
  {}
}
