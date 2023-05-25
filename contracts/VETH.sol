// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

// 민터만 민팅 가능한 구조
// 브릿지에서는 브릿지를 민터로 셋팅

contract VETH is Initializable, ERC20Upgradeable, OwnableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC20_init("VETH", "VETH");
        __Ownable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender); // 시연용 
    }

    function mint(address _to, uint256 _amount) public onlyRole(MINTER_ROLE) {
        _mint(_to, _amount);
    }

    // L1 에서는 SwapAndStakeLido, L2는 브릿지 추가
    function addMinter(address _minter) public onlyOwner {
        _grantRole(MINTER_ROLE, _minter);
    }

    function removeMinter(address _minter) public onlyOwner {
        _revokeRole(MINTER_ROLE, _minter);
    }

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}
}
