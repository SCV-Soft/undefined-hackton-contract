import { ethers, upgrades } from "hardhat";

const bridgeAddress: {[key: number]:string} = {
  5: "", // goerli
  80001: "" // mumbai
}

const l1SwapAddress = "0x7C216fB3C5C22989d0D2556702ea7AeCF474245f"
const l2SwapAddress = "0xDA49F943Be939Ef9eE1BdaB3C9D1644Baae763bb"

const l1WethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
const l2WethAddress = "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa"

const l1VethAddress = "0xfC6ae96facE347BB6419859C1592825B96224ab0"
const l2VethAddress = "0xe5b1C4Be4289CA511440C1287E0C9E031a3bfe3D"

const scethAddress = "0x153fab4B5E067724B4387713ABfBB6Eb581119d6"

const lidoAddress = "0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F"

const l1Bridge = "0x66AC44FC2b84B6618D09b61BFd52d85Dc17daCAb"
const l2Bridge = "0xdC1B4896e0AeFa938D38cA86E63Bd508bD249B32"

async function deploy_bridge_l1() {

  // Bridge
  const bridgeFactory = await ethers.getContractFactory("SimpleBridge");
  const bridge = await upgrades.deployProxy(
    bridgeFactory,
    [
      ethers.constants.AddressZero,
      false,
    ],
    {kind: "uups"},
  );
  await bridge.deployed();
  console.log(`bridge l1: ${bridge.address}`);
}

async function deploy_bridge_l2() {
  const accounts = await ethers.getSigners();
  const admin = accounts[0];
  const user = accounts[1];

  // Bridge
  const bridgeFactory = await ethers.getContractFactory("SimpleBridge");
  const bridge = await upgrades.deployProxy(
    bridgeFactory,
    [
      scethAddress,
      true,
    ],
    {kind: "uups"},
  );
  await bridge.deployed();
  console.log(`bridge l2: ${bridge.address}`);

  // veth 민터로 설정
  const veth = new ethers.Contract(l2VethAddress, [{
    "inputs": [
      {
        "internalType": "address",
        "name": "_minter",
        "type": "address"
      }
    ],
    "name": "addMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }], admin);

  await (await veth.addMinter(bridge.address)).wait()


  // sceth 민터로 설정
  const sceth = new ethers.Contract(scethAddress, [{
    "inputs": [
      {
        "internalType": "address",
        "name": "_minter",
        "type": "address"
      }
    ],
    "name": "addMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }], admin);

  await (await sceth.addMinter(bridge.address)).wait()
}

async function deploy_veth() {

  // VETH
  const vethFactory = await ethers.getContractFactory("VETH");
  const veth = await upgrades.deployProxy(
    vethFactory,
    [],
    {kind: "uups"},
  );
  await veth.deployed();
  console.log(`veth: ${veth.address}`);
}

async function deploy_l1Swap() {
  const accounts = await ethers.getSigners();
  const admin = accounts[0];
  const user = accounts[1];

  // L1Swap
  const l1swapFactory = await ethers.getContractFactory("L1Swap");
  const l1swap = await upgrades.deployProxy(
    l1swapFactory,
    [
      l1WethAddress,// _weth
      l1VethAddress, // _veth
      lidoAddress,// _lido
    ],
    {kind: "uups"},
  );
  await l1swap.deployed();
  console.log(`L1Swap: ${l1swap.address}`);

  // veth의 minter를 l1sawp로 지정함

  const veth = new ethers.Contract(l1VethAddress, [{
    "inputs": [
      {
        "internalType": "address",
        "name": "_minter",
        "type": "address"
      }
    ],
    "name": "addMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }], admin);

  await (await veth.addMinter(l1swap.address)).wait()
}

async function deploy_sceth() {
  const accounts = await ethers.getSigners();
  const admin = accounts[0];
  const user = accounts[1];

  // SCETH
  const scethFactory = await ethers.getContractFactory("SCETH");
  const sceth = await upgrades.deployProxy(
    scethFactory,
    [],
    {kind: "uups"},
  );
  await sceth.deployed();
  console.log(`sceth: ${sceth.address}`);
}

async function deploy_l2Swap() {
  const accounts = await ethers.getSigners();
  const admin = accounts[0];
  const user = accounts[1];

  // L1Swap
  const l2swapFactory = await ethers.getContractFactory("L2Swap");
  const l2swap = await upgrades.deployProxy(
    l2swapFactory,
    [
      l2WethAddress,// _weth
      l2VethAddress, // _veth
      scethAddress,// _sceth
    ],
    {kind: "uups"},
  );
  await l2swap.deployed();
  console.log(`L2Swap: ${l2swap.address}`);

  // veth를 예치해 둠 (실제로는 브릿지에서 꺼내온 VETH를 예치한다.)
  // 시연을 위한 민팅
  const veth = new ethers.Contract(l2VethAddress, [{
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }], admin);

  // 예치금 시뮬레이션
  await (await veth.mint(l2swap.address, "1000000000000000000")).wait()

  // sc minter로 설정
  const sceth = new ethers.Contract(scethAddress, [{
    "inputs": [
      {
        "internalType": "address",
        "name": "_minter",
        "type": "address"
      }
    ],
    "name": "addMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }], admin);

  await (await sceth.addMinter(l2swap.address)).wait()
}





async function upgrade_bridge() {
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const bridge_address = bridgeAddress[chainId];

  // Bridge
  const bridgeFactory = await ethers.getContractFactory("SimpleBridge");
  const proxyContract = await upgrades.upgradeProxy(bridge_address, bridgeFactory);
  await proxyContract.deployed();
}

deploy_bridge_l2().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
