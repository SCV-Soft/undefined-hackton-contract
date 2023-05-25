// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IWETH {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function withdraw(uint256 value) external;
    function balanceOf(address account) external view returns (uint256);
}

interface IVETH {
    function mint(address to, uint256 amount) external;
}

// 해커톤 편의를 위해 업그레이더블
contract L1Swap is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    IWETH public WETH;
    IVETH public VETH;
    address payable public LIDO;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IWETH _weth,
        IVETH _veth,
        address payable _lido
    ) initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();

        WETH = _weth;
        VETH = _veth;
        LIDO = _lido;

    }

    function ethSwap() public payable {
        require(msg.value > 0, "L1Swap: lack of msg.value");
        
        _satke();

        // VETH minting
        VETH.mint(msg.sender, msg.value);        
    }

    function wethSwap(uint256 _value) public {
        // approve 되어있음을 가정한다. 
        WETH.transferFrom(msg.sender, address(this), _value);
        // WETH -> eth 변환 (있는거 다 변환)
        WETH.withdraw(WETH.balanceOf(address(this)));

        _satke();

        // VETH minting
        VETH.mint(msg.sender, _value);
    }

    // 있는거 다 스테이킹
    function _satke() internal {
        (bool success, ) = LIDO.call{value:address(this).balance}("");
        require(success, "L1Swap: LIDO staking failed");
    }
    
    // 발행된 stETH를 꺼내는 함수
    function extract(IERC20 _erc20, uint256 _amount) public onlyOwner {
        _erc20.transfer(owner(), _amount);
    }

    // WETH 변환 위해
    receive() external payable {}

    fallback() external payable {}

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

}