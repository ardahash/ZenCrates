// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { Votes } from "@openzeppelin/contracts/governance/utils/Votes.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

contract StakedCrates is ERC721, EIP712, Votes, AccessControl, ReentrancyGuard, Pausable {
  using SafeERC20 for IERC20;

  struct Position {
    uint256 amount;
    uint64 lockEnd;
  }

  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  IERC20 public immutable crates;
  uint256 public totalStaked;
  uint256 public nextPositionId;

  mapping(uint256 => Position) private _positions;
  mapping(address => uint256) private _stakedBalance;

  error AmountZero();
  error PositionNotFound();
  error NotApproved();
  error LockActive(uint64 lockEnd);

  event Staked(address indexed user, uint256 indexed positionId, uint256 amount);
  event Unstaked(address indexed user, uint256 indexed positionId, uint256 amount);
  event PositionUpdated(uint256 indexed positionId, uint256 newAmount);
  event LockUpdated(uint256 indexed positionId, uint64 newLockEnd);

  constructor(address cratesToken, address admin)
    ERC721("Staked CRATES", "sCRATES")
    EIP712("Staked CRATES", "1")
  {
    crates = IERC20(cratesToken);
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(PAUSER_ROLE, admin);
    nextPositionId = 1;
  }

  function pause() external onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() external onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  function stakedBalanceOf(address account) external view returns (uint256) {
    return _stakedBalance[account];
  }

  function positionInfo(uint256 positionId) external view returns (Position memory) {
    if (_ownerOf(positionId) == address(0)) revert PositionNotFound();
    return _positions[positionId];
  }

  function stake(uint256 amount, uint64 lockDuration, uint256 positionId)
    external
    nonReentrant
    whenNotPaused
    returns (uint256)
  {
    if (amount == 0) revert AmountZero();

    if (positionId == 0) {
      uint256 newId = nextPositionId++;
      uint64 lockEnd = _computeLockEnd(lockDuration);
      _positions[newId] = Position({ amount: amount, lockEnd: lockEnd });
      totalStaked += amount;
      _mint(msg.sender, newId);
      crates.safeTransferFrom(msg.sender, address(this), amount);
      emit Staked(msg.sender, newId, amount);
      return newId;
    }

    if (!_isApprovedOrOwner(msg.sender, positionId)) revert NotApproved();
    Position storage position = _positions[positionId];
    if (position.amount == 0) revert PositionNotFound();

    position.amount += amount;
    totalStaked += amount;

    address owner = ownerOf(positionId);
    _stakedBalance[owner] += amount;
    _transferVotingUnits(address(0), owner, amount);

    if (lockDuration > 0) {
      uint64 updatedLock = _computeLockEnd(lockDuration);
      if (updatedLock > position.lockEnd) {
        position.lockEnd = updatedLock;
        emit LockUpdated(positionId, updatedLock);
      }
    }

    crates.safeTransferFrom(msg.sender, address(this), amount);
    emit PositionUpdated(positionId, position.amount);
    return positionId;
  }

  function unstake(uint256 positionId) external nonReentrant whenNotPaused {
    if (!_isApprovedOrOwner(msg.sender, positionId)) revert NotApproved();
    Position memory position = _positions[positionId];
    if (position.amount == 0) revert PositionNotFound();
    if (position.lockEnd > block.timestamp) revert LockActive(position.lockEnd);

    address owner = ownerOf(positionId);
    uint256 amount = position.amount;

    totalStaked -= amount;
    _burn(positionId);
    delete _positions[positionId];

    crates.safeTransfer(owner, amount);
    emit Unstaked(owner, positionId, amount);
  }

  function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
    address owner = ownerOf(tokenId);
    return (spender == owner ||
      isApprovedForAll(owner, spender) ||
      getApproved(tokenId) == spender);
  }

  function _computeLockEnd(uint64 lockDuration) private view returns (uint64) {
    if (lockDuration == 0) {
      return 0;
    }
    return uint64(block.timestamp + lockDuration);
  }

  function _update(address to, uint256 tokenId, address auth)
    internal
    override
    returns (address)
  {
    address from = super._update(to, tokenId, auth);
    uint256 amount = _positions[tokenId].amount;

    if (from != address(0)) {
      _stakedBalance[from] -= amount;
    }
    if (to != address(0)) {
      _stakedBalance[to] += amount;
    }

    _transferVotingUnits(from, to, amount);
    return from;
  }

  function _getVotingUnits(address account) internal view override returns (uint256) {
    return _stakedBalance[account];
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, AccessControl)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
