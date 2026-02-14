// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ZenStakingPool is AccessControl, Pausable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 public constant CONFIG_ROLE = keccak256("CONFIG_ROLE");

  IERC20 public immutable zen;
  IERC20 public immutable crates;
  address public treasury;

  uint256 public cratesPerZen;
  uint16 public unstakeFeeBps;

  uint256 public totalZenStaked;

  uint256 public rewardRate;
  uint256 public rewardsDuration = 1 days;
  uint256 public periodFinish;
  uint256 public lastUpdateTime;
  uint256 public rewardPerTokenStored;
  uint256 public rewardReserve;

  mapping(address => uint256) private _stakedZen;
  mapping(address => uint256) public userRewardPerTokenPaid;
  mapping(address => uint256) public rewards;

  uint256 private constant REWARD_PRECISION = 1e18;
  uint16 private constant MAX_FEE_BPS = 2000;

  error AmountZero();
  error InvalidAddress();
  error InvalidRate();
  error FeeTooHigh(uint16 feeBps);
  error InvalidRewardDuration();
  error RewardsActive(uint256 until);
  error InsufficientStake(uint256 available, uint256 required);
  error InsufficientRewardReserve(uint256 available, uint256 required);

  event Staked(address indexed user, uint256 zenAmount);
  event Unstaked(address indexed user, uint256 zenAmount, uint256 feeZen);
  event TreasuryUpdated(address indexed treasury);
  event RateUpdated(uint256 cratesPerZen);
  event UnstakeFeeUpdated(uint16 feeBps);
  event RewardAdded(uint256 reward, uint256 duration);
  event RewardPaid(address indexed user, uint256 reward);
  event RewardsDurationUpdated(uint256 duration);

  constructor(
    address zenToken,
    address cratesToken,
    address treasury_,
    uint256 cratesPerZen_,
    uint16 unstakeFeeBps_,
    address admin
  ) {
    if (
      zenToken == address(0) ||
      cratesToken == address(0) ||
      treasury_ == address(0) ||
      admin == address(0)
    ) {
      revert InvalidAddress();
    }
    if (cratesPerZen_ == 0) revert InvalidRate();
    if (unstakeFeeBps_ > MAX_FEE_BPS) revert FeeTooHigh(unstakeFeeBps_);

    zen = IERC20(zenToken);
    crates = IERC20(cratesToken);
    treasury = treasury_;
    cratesPerZen = cratesPerZen_;
    unstakeFeeBps = unstakeFeeBps_;

    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(PAUSER_ROLE, admin);
    _grantRole(CONFIG_ROLE, admin);
  }

  modifier updateReward(address account) {
    rewardPerTokenStored = rewardPerToken();
    lastUpdateTime = lastTimeRewardApplicable();
    if (account != address(0)) {
      rewards[account] = earned(account);
      userRewardPerTokenPaid[account] = rewardPerTokenStored;
    }
    _;
  }

  function pause() external onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() external onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  function stakedBalanceOf(address account) external view returns (uint256) {
    return _stakedZen[account];
  }

  function lastTimeRewardApplicable() public view returns (uint256) {
    return block.timestamp < periodFinish ? block.timestamp : periodFinish;
  }

  function rewardPerToken() public view returns (uint256) {
    if (totalZenStaked == 0) return rewardPerTokenStored;
    uint256 timeDelta = lastTimeRewardApplicable() - lastUpdateTime;
    return rewardPerTokenStored + ((timeDelta * rewardRate * REWARD_PRECISION) / totalZenStaked);
  }

  function earned(address account) public view returns (uint256) {
    uint256 accrued = (rewardPerToken() - userRewardPerTokenPaid[account]);
    return (_stakedZen[account] * accrued) / REWARD_PRECISION + rewards[account];
  }

  function setTreasury(address newTreasury) external onlyRole(CONFIG_ROLE) {
    if (newTreasury == address(0)) revert InvalidAddress();
    treasury = newTreasury;
    emit TreasuryUpdated(newTreasury);
  }

  function setCratesPerZen(uint256 newCratesPerZen) external onlyRole(CONFIG_ROLE) {
    if (newCratesPerZen == 0) revert InvalidRate();
    cratesPerZen = newCratesPerZen;
    emit RateUpdated(newCratesPerZen);
  }

  function setUnstakeFeeBps(uint16 newFeeBps) external onlyRole(CONFIG_ROLE) {
    if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh(newFeeBps);
    unstakeFeeBps = newFeeBps;
    emit UnstakeFeeUpdated(newFeeBps);
  }

  function setRewardsDuration(uint256 duration) external onlyRole(CONFIG_ROLE) {
    if (duration == 0) revert InvalidRewardDuration();
    if (block.timestamp < periodFinish) revert RewardsActive(periodFinish);
    rewardsDuration = duration;
    emit RewardsDurationUpdated(duration);
  }

  function notifyRewardAmount(uint256 reward) external onlyRole(CONFIG_ROLE) updateReward(address(0)) {
    if (reward == 0) revert AmountZero();

    uint256 available = crates.balanceOf(address(this));
    uint256 required = rewardReserve + reward;
    if (available < required) revert InsufficientRewardReserve(available, required);

    if (block.timestamp >= periodFinish) {
      rewardRate = reward / rewardsDuration;
    } else {
      uint256 remaining = periodFinish - block.timestamp;
      uint256 leftover = remaining * rewardRate;
      rewardRate = (reward + leftover) / rewardsDuration;
    }

    lastUpdateTime = block.timestamp;
    periodFinish = block.timestamp + rewardsDuration;
    rewardReserve += reward;
    emit RewardAdded(reward, rewardsDuration);
  }

  function claimRewards() external nonReentrant updateReward(msg.sender) {
    uint256 reward = rewards[msg.sender];
    if (reward == 0) return;
    if (reward > rewardReserve) revert InsufficientRewardReserve(rewardReserve, reward);
    rewards[msg.sender] = 0;
    rewardReserve -= reward;
    crates.safeTransfer(msg.sender, reward);
    emit RewardPaid(msg.sender, reward);
  }

  function stake(uint256 zenAmount)
    external
    nonReentrant
    whenNotPaused
    updateReward(msg.sender)
    returns (uint256)
  {
    if (zenAmount == 0) revert AmountZero();

    _stakedZen[msg.sender] += zenAmount;
    totalZenStaked += zenAmount;

    zen.safeTransferFrom(msg.sender, address(this), zenAmount);
    emit Staked(msg.sender, zenAmount);
    return zenAmount;
  }

  function unstake(uint256 zenAmount)
    external
    nonReentrant
    whenNotPaused
    updateReward(msg.sender)
    returns (uint256)
  {
    if (zenAmount == 0) revert AmountZero();
    uint256 staked = _stakedZen[msg.sender];
    if (zenAmount > staked) revert InsufficientStake(staked, zenAmount);

    uint256 fee = (zenAmount * unstakeFeeBps) / 10_000;
    uint256 netZen = zenAmount - fee;

    _stakedZen[msg.sender] = staked - zenAmount;
    totalZenStaked -= zenAmount;

    if (fee > 0) {
      zen.safeTransfer(treasury, fee);
    }
    zen.safeTransfer(msg.sender, netZen);

    emit Unstaked(msg.sender, zenAmount, fee);
    return netZen;
  }
}
