// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface ISCETH {
    function mint(address to, uint256 amount) external;
}

// L2 wETH -> vETH
contract L2Swap is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    IERC20 public WETH;
    IERC20 public VETH;
    ISCETH public SCETH;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IERC20 _weth,
        IERC20 _veth,
        ISCETH _sceth
    ) initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();

        WETH = _weth;
        VETH = _veth;
        SCETH = _sceth;
    }

    function swap(uint256 _amount) public payable {
        require(_amount > 0, "L2Swap: too small amount");
        
        // WETH 를 가져옴
        // approve 되어있음을 가정한다. 
        WETH.transferFrom(msg.sender, address(this), _amount);

        // VETH 를 유저에게 줌
        VETH.transfer(msg.sender, _amount);

        // scETh를 줌 (10%)
        if(_amount / 10 > 0){
            SCETH.mint(msg.sender, _amount / 10);
        }
    }
    
    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

}