import { task } from "hardhat/config";

import L1SwapAbi from "../artifacts/contracts/L1Swap.sol/L1Swap.json"
import vethAbi from "../artifacts/contracts/VETH.sol/VETH.json"
import wethAbi from "../artifacts/contracts/WETH.sol/WETH9.json"

const l1SwapAddress = "0x7C216fB3C5C22989d0D2556702ea7AeCF474245f"
const l2SwapAddress = ""

const l1WethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
const l2WethAddress = ""

const l1VethAddress = "0xfC6ae96facE347BB6419859C1592825B96224ab0"
const l2VethAddress = "0xe5b1C4Be4289CA511440C1287E0C9E031a3bfe3D"

const scethAddress = ""

const lidoAddress = "0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F"

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

