import { task } from "hardhat/config";

import L1SwapAbi from "../artifacts/contracts/L1Swap.sol/L1Swap.json"
import L2SwapAbi from "../artifacts/contracts/L2Swap.sol/L2Swap.json"
import vethAbi from "../artifacts/contracts/VETH.sol/VETH.json"
import wethAbi from "../artifacts/contracts/WETH.sol/WETH9.json"
import L1bridgeAbi from "../artifacts/contracts/Bridge.sol/SimpleBridge.json"
import AstarMockWETHAbi from "../artifacts/contracts/astar/MockWETH.sol/MockWETH.json"

const l1SwapAddress = "0x7C216fB3C5C22989d0D2556702ea7AeCF474245f"
const l2SwapAddress = "0xDA49F943Be939Ef9eE1BdaB3C9D1644Baae763bb"

const l1WethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
const l2WethAddress = "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa"

const l1VethAddress = "0xfC6ae96facE347BB6419859C1592825B96224ab0"
const l2VethAddress = "0xe5b1C4Be4289CA511440C1287E0C9E031a3bfe3D"

const scethAddress = "0x153fab4B5E067724B4387713ABfBB6Eb581119d6"

const lidoAddress = "0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F"

const l1BridgeAddress = "0x66AC44FC2b84B6618D09b61BFd52d85Dc17daCAb"
const l2BridgeAddress = "0xdC1B4896e0AeFa938D38cA86E63Bd508bD249B32"

const astarWethAddress = "0xB83508bB360Ad2c8726ba6E1746D03d4BCac387C"


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

