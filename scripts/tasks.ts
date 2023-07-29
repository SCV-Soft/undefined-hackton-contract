import { task } from "hardhat/config";

import L1SwapAbi from "../artifacts/contracts/L1Swap.sol/L1Swap.json"
import L2SwapAbi from "../artifacts/contracts/L2Swap.sol/L2Swap.json"
import vethAbi from "../artifacts/contracts/VETH.sol/VETH.json"
import wethAbi from "../artifacts/contracts/WETH.sol/WETH9.json"
import L1bridgeAbi from "../artifacts/contracts/Bridge.sol/SimpleBridge.json"
import AstarMockWETHAbi from "../artifacts/contracts/astar/MockWETH.sol/MockWETH.json"
import CBridgeTestAbi from "../artifacts/contracts/cBridgeTest.sol/CBridgeTest.json"

const l1SwapAddress = "0x28E4D287AD405b848E40668fFE20DDafC925841C"
const l2SwapAddress = "0x2a90d4c4B799BD6238661E11920ad2E371046eEb"

const l1WethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
const l2WethAddress = "0xB83508bB360Ad2c8726ba6E1746D03d4BCac387C"

const l1VethAddress = "0xfaCC1871330DB8c7346e7F76514D04857eEEA089"
const l2VethAddress = "0xFF847bef92cdF7587341C7F1c8De03A35F4eE44D"

const l2AtomAddress = "0xAFc85AbC6DB664dAfF2Dc1007A0428cFCaDb392F"

const scethAddress = "0x485904f09Fec2e758FaF544893989a8d17cbd8Bc"

const lidoAddress = "0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F"

const l1BridgeAddress = "0x05134a61AF5E628E54cC609dA25B53FF2Caf293b"
const l2BridgeAddress = "0x920532BF55981cB98480AF0453aA7C63B23c1346"

const astarWethAddress = "0xB83508bB360Ad2c8726ba6E1746D03d4BCac387C"

const l1cBridgeTestAddress = "0x0D8ba3fDac0b42CBab9eDAbBa5ebAC11e22726a1"

const astarSwapRouterAddress = "0xD28D77DaB1af0334c130AAAd09525e3762B2D50d"

const cBridgeMessageBusAddress: {[key: number]:string} = {
    5: "0xF25170F86E4291a99a9A560032Fe9948b8BcFBB2", // goerli
    80001: "0x7d43AABC515C356145049227CeE54B608342c0ad", // mumbai
    81: "0xa3d23891f00b8d34e31096c0cee1734595840d4d" // shibuya
  }

// L1 스왑(ETH)
// @todo 프론트에서 호출해야 함 (이더리움에서 실행)
task("swap-l1-eth", "Swap L1 ETH to L1 vETH")
    .addParam("amount", "amount of tokens (wei)")
    .setAction(async (args, { ethers, network }) => {
        const accounts = await ethers.getSigners();
        const admin = accounts[0];
        const user = accounts[1];

        const l1swap = new ethers.Contract(l1SwapAddress, L1SwapAbi.abi, user);

        await (await l1swap.ethSwap({
            value: args.amount
        })).wait()
    });

// L1 스왑(WETH)
// @todo 프론트에서 호출해야 함 (이더리움에서 실행)
task("swap-l1-weth", "Swap L1 WETH to L1 vETH")
    .addParam("amount", "amount of tokens (wei)")
    .setAction(async (args, { ethers, network }) => {
        const accounts = await ethers.getSigners();
        const admin = accounts[0];
        const user = accounts[1];
        // 사용성을 올리려면 view 함수로 allowance 체크 
        const weth = new ethers.Contract(l1WethAddress, wethAbi.abi, user);
        await (await weth.approve(l1SwapAddress, args.amount)).wait();

        const l1swap = new ethers.Contract(l1SwapAddress, L1SwapAbi.abi, user);

        await (await l1swap.wethSwap(args.amount)).wait()
    });


// L2 스왑(WETH)
// @todo 프론트에서 호출해야 함 (폴리곤(뭄바이)에서 실행)
task("swap-l2-weth", "Swap L2 WETH to L2 vETH + scETH")
    .addParam("amount", "amount of tokens (wei)")
    .setAction(async (args, { ethers, network }) => {
        const accounts = await ethers.getSigners();
        const admin = accounts[0];
        const user = accounts[1];
        // 사용성을 올리려면 view 함수로 allowance 체크 
        const weth = new ethers.Contract(l2WethAddress, wethAbi.abi, user);
        await (await weth.approve(l2SwapAddress, args.amount)).wait();

        const l2swap = new ethers.Contract(l2SwapAddress, L2SwapAbi.abi, user);

        await (await l2swap.swap(args.amount)).wait()
    });

// 브릿지
// @todo 프론트에서 호출해야 함 (이더리움에서 실행)
task("bridge_l1", "Bridge L1 vETH to L2")
.addParam("amount", "amount of tokens (wei)")
.setAction(async (args, { ethers, network }) => {
    const accounts = await ethers.getSigners();
    const admin = accounts[0];
    const user = accounts[1];
    // 사용성을 올리려면 view 함수로 allowance 체크 
    const veth = new ethers.Contract(l1VethAddress, vethAbi.abi, user);
    await (await veth.approve(l1BridgeAddress, args.amount)).wait();

    const l1bridge = new ethers.Contract(l1BridgeAddress, L1bridgeAbi.abi, user);

    await (await l1bridge.deposit(
        l1VethAddress,
        80001, // mumbai chainId
        args.amount,
        user.address,
        await l1bridge.nonce(user.address), // view 함수 호출 결과
    )).wait()
});



// VETH mint role
task("l1-add-minter-veth", "Swap L1 ETH to L1 vETH")
    .addParam("minter", "address of minter")
    .setAction(async (args, { ethers, network }) => {
        const accounts = await ethers.getSigners();
        const admin = accounts[0];
        const user = accounts[1];

        const veth = new ethers.Contract(l1VethAddress, vethAbi.abi, admin);

        await (await veth.addMinter(args.minter)).wait()
    });

// VETH mint
task("deposit-l2swap", "Deposit(mint) vETH to l2Swap")
    .addParam("amount", "amount of tokens (wei)")
    .setAction(async (args, { ethers, network }) => {
        const accounts = await ethers.getSigners();
        const admin = accounts[0];
        const user = accounts[1];

        const veth = new ethers.Contract(l2VethAddress, vethAbi.abi, admin);

        await (await veth.mint(l2SwapAddress, args.amount)).wait()
    });


// Mock WETH mint
task("mint-mock-weth", "Mint WETH for Astar chain test")
.addParam("amount", "amount of tokens (wei)")
.addParam("to", "address who get token")
.setAction(async (args, { ethers, network }) => {
    const accounts = await ethers.getSigners();
    const admin = accounts[0];
    const user = accounts[1];

    const weth = new ethers.Contract(astarWethAddress, AstarMockWETHAbi.abi, admin);

    await (await weth.mint(args.to, args.amount)).wait()
});

// Mock WETH mint
task("send-message", "cBridge test")
.addParam("dstaddress", "Destination address")
.addParam("dstchain", "Destination chainid")
.setAction(async (args, { ethers, network }) => {
    const accounts = await ethers.getSigners();
    const admin = accounts[0];
    const user = accounts[1];

    const chainId = (await ethers.provider.getNetwork()).chainId;
    const messageBusAddress = cBridgeMessageBusAddress[chainId];

    const messageBus = new ethers.Contract(
        messageBusAddress,
        ["function calcFee(bytes calldata _message) public view returns (uint256)"],
        admin
    );

    // 필요한 가스 계산
    const message = ethers.utils.arrayify("0x1234");
    console.log(message)
    const fee = (await messageBus.calcFee(message)).mul(3)
    console.log(fee)

    const test = new ethers.Contract(l1cBridgeTestAddress, CBridgeTestAbi.abi, admin);
 
    await (await test.sendtest(args.dstaddress, args.dstchain, message, {
        value: fee
    })).wait()
});

// add liquidity
task("add-liquidity", "Add liquidity")
.addParam("amount", "Amount of stake")
.setAction(async (args, { ethers, network }) => {
    const accounts = await ethers.getSigners();
    const admin = accounts[0];
    const user = accounts[1];

    // approve first
    const veth = new ethers.Contract(l2VethAddress, vethAbi.abi, admin);
    await (await veth.approve(astarSwapRouterAddress, ethers.constants.MaxUint256)).wait()

    const vatom = new ethers.Contract(l2AtomAddress, vethAbi.abi, admin);
    await (await vatom.approve(astarSwapRouterAddress, ethers.constants.MaxUint256)).wait()

    const router = new ethers.Contract(
        astarSwapRouterAddress,
        ["function addLiquidity(address,address,uint,uint,uint,uint,address,uint) external returns (uint,uint,uint)"],
        admin
    );

    await (await router.addLiquidity(
        l2VethAddress, //     address tokenA,
        l2AtomAddress, //     address tokenB,
        args.amount, //     uint amountADesired,
        args.amount,//     uint amountBDesired,
        args.amount,//     uint amountAMin,
        args.amount,//     uint amountBMin,
        admin.address, //     address to,
        ethers.constants.MaxUint256 //     uint deadline
    )).wait()
});


// VETH mint
task("l2-veth-mint", "mint l2 veth")
    .addParam("amount", "amount of tokens (wei)")
    .addParam("to", "to address")
    .setAction(async (args, { ethers, network }) => {
        const accounts = await ethers.getSigners();
        const admin = accounts[0];
        const user = accounts[1];

        const veth = new ethers.Contract(l2VethAddress, vethAbi.abi, admin);

        await (await veth.mint(args.to, args.amount)).wait()
    });


// @todo [Astar hackerton] swap vETH -> vATOM (하실때 메타마스크에서 Astar testnet으로 네트워크 변경)
task("swap-veth-to-vatom", "swap")
.addParam("amountin", "Amount of stake")
.setAction(async (args, { ethers, network }) => {
    const accounts = await ethers.getSigners();
    const admin = accounts[0];
    const user = accounts[1];

    // approve first
    const veth = new ethers.Contract(l2VethAddress, vethAbi.abi, admin);
    await (await veth.connect(user).approve(astarSwapRouterAddress, ethers.constants.MaxUint256)).wait()

    const vatom = new ethers.Contract(l2AtomAddress, vethAbi.abi, admin);
    // await (await vatom.connect(user).approve(astarSwapRouterAddress, ethers.constants.MaxUint256)).wait()

    const router = new ethers.Contract(
        astarSwapRouterAddress,
        ["function swapExactTokensForTokens(uint,uint,address[],address,uint) external returns (uint[])"],
        admin
    );

    await (await router.connect(user).swapExactTokensForTokens(
        args.amountin, // uint amountIn,
        0, // uint amountOutMin,
        [veth.address, vatom.address], // address[] calldata path,
        user.address, // address to,
        ethers.constants.MaxUint256 // uint deadline  
    )).wait()
});


// @todo [Astar hackerton] swap vATOM -> vETH (하실때 메타마스크에서 Astar testnet으로 네트워크 변경)
task("swap-vatom-to-veth", "swap")
.addParam("amountin", "Amount of stake")
.setAction(async (args, { ethers, network }) => {
    const accounts = await ethers.getSigners();
    const admin = accounts[0];
    const user = accounts[1];

    // approve first
    const veth = new ethers.Contract(l2VethAddress, vethAbi.abi, admin);
    // await (await veth.connect(user).approve(astarSwapRouterAddress, ethers.constants.MaxUint256)).wait()

    const vatom = new ethers.Contract(l2AtomAddress, vethAbi.abi, admin);
    await (await vatom.connect(user).approve(astarSwapRouterAddress, ethers.constants.MaxUint256)).wait()

    const router = new ethers.Contract(
        astarSwapRouterAddress,
        ["function swapExactTokensForTokens(uint,uint,address[],address,uint) external returns (uint[])"],
        admin
    );

    await (await router.connect(user).swapExactTokensForTokens(
        args.amountin, // uint amountIn,
        0, // uint amountOutMin,
        [vatom.address, veth.address], // address[] calldata path,
        user.address, // address to,
        ethers.constants.MaxUint256 // uint deadline  
    )).wait()
});