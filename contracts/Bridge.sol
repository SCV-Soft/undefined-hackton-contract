// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

interface ISCETH {
    function mint(address to, uint256 amount) external;
}

interface IVETH {
    function mint(address to, uint256 amount) external;
}

contract SimpleBridge is Initializable, UUPSUpgradeable, OwnableUpgradeable {

    address private constant NATIVE_TOKEN = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    mapping(address => uint256) public nonce;
    mapping(uint256 => mapping(address => mapping(uint256 => bool))) public withdrawNonce;
    ISCETH public SCETH;
    bool public isL2;

    event Deposit(address _token, uint256 _fromChainId, uint256 _toChainId, uint256 _amount, address _from, address _to, uint256 _nonce);
    event Withdraw(address _token, uint256 _fromChainId, uint256 _toChainId, uint256 _amount, address _from, address _to, uint256 _nonce);

    function initialize(ISCETH _sceth, bool _isL2) initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();

        isL2 = _isL2;
        // L2쪽 브릿지 컨트랙트에서만 사용
        if(_isL2){
            SCETH = _sceth;
        }
    }

    function deposit(
        IERC20Upgradeable _token,
        uint256 _toChainId,
        uint256 _amount,
        address _to,
        uint256 _nonce
    ) public payable {

        require(_to != address(0), "Bridge: wrong _to");
        require(_toChainId != block.chainid, "Bridge: wrong _toChainId");

        // nonce 확인 후 업데이트
        _handleNonce(msg.sender, _nonce);

        emit Deposit(address(_token), block.chainid, _toChainId, _amount, msg.sender, _to, _nonce);
        
        // ERC20 의 경우 - approve 되어있다 가정, 아니면 실패
        _token.transferFrom(msg.sender, address(this), _amount);
    }

   function _handleNonce(address caller, uint256 _nonce) internal {
        require(nonce[caller] == _nonce, "Bridge: wrong nonce");
        nonce[caller] += 1;
    }

    function withdraw(
        IERC20Upgradeable _token,
        uint256 _fromChainId,
        uint256 _amount,
        address _from,
        address _to,
        uint256 _nonce
    ) public onlyOwner {
        require(_to != address(0), "Bridge: wrong _to");
        require(!withdrawNonce[_fromChainId][_from][_nonce], "Bridge: nonce used");

        withdrawNonce[_fromChainId][_from][_nonce] = true;
        emit Withdraw(address(_token), _fromChainId, block.chainid, _amount, _from, _to, _nonce);

        // L2 의 경우 (mumbai)
        // 이 브릿지에서는 임시적으로 vETH만 옮기므로 OK
        if(isL2 && _amount / 10 > 0){
            // vETH mint
            IVETH(address(_token)).mint(_to, _amount);
            
            // scETH 10% 민팅
            SCETH.mint(_to, _amount / 10 );
        }
        else{
            // ERC20 의 경우
            _token.transfer(_to, _amount);
        }
    }

    // 마이그레이션 등 긴급 상황 출금
    function emergencyWithdraw(IERC20Upgradeable _token, uint256 _amount) public onlyOwner {
        if(address(_token) == NATIVE_TOKEN){
            // native token의 경우 전송
            payable(owner()).transfer(address(this).balance);
        }
        else{
            _token.transfer(owner(), _amount);
        }
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
