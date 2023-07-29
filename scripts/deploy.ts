import { ethers, upgrades } from "hardhat";

const bridgeAddress: {[key: number]:string} = {
  5: "0x05134a61AF5E628E54cC609dA25B53FF2Caf293b", // goerli
  80001: "", // mumbai
  81: "0x920532BF55981cB98480AF0453aA7C63B23c1346" // shibuya
}

const cBridgeMessageBusAddress: {[key: number]:string} = {
  5: "0xF25170F86E4291a99a9A560032Fe9948b8BcFBB2", // goerli
  80001: "0x7d43AABC515C356145049227CeE54B608342c0ad", // mumbai
  81: "0xa3d23891f00b8d34e31096c0cee1734595840d4d" // shibuya
}

// L2는 Shibuya를 의미함

const l1SwapAddress = "0x28E4D287AD405b848E40668fFE20DDafC925841C"
const l2SwapAddress = "0x2a90d4c4B799BD6238661E11920ad2E371046eEb"

const l1WethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6" // 고정
const l2WethAddress = "0xB83508bB360Ad2c8726ba6E1746D03d4BCac387C" // 고정

const l1VethAddress = "0xfaCC1871330DB8c7346e7F76514D04857eEEA089"
const l2VethAddress = "0xFF847bef92cdF7587341C7F1c8De03A35F4eE44D"

const l2scethAddress = "0x485904f09Fec2e758FaF544893989a8d17cbd8Bc"

const lidoAddress = "0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F"

const l1Bridge = "0x05134a61AF5E628E54cC609dA25B53FF2Caf293b"
const l2Bridge = "0x920532BF55981cB98480AF0453aA7C63B23c1346"

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

async function deploy_bridge_l2(l2_veth_address: string, l2_sceth_address: string) {
  const accounts = await ethers.getSigners();
  const admin = accounts[0];
  const user = accounts[1];

  // Bridge
  const bridgeFactory = await ethers.getContractFactory("SimpleBridge");
  const bridge = await upgrades.deployProxy(
    bridgeFactory,
    [
      l2_sceth_address,
      true,
    ],
    {kind: "uups"},
  );
  await bridge.deployed();
  console.log(`bridge l2: ${bridge.address}`);

  // veth 민터로 설정
  const veth = new ethers.Contract(l2_veth_address, [{
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
  const sceth = new ethers.Contract(l2_sceth_address, [{
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

  return veth.address;
}

async function deploy_l1Swap(l1_veth_address: string) {
  const accounts = await ethers.getSigners();
  const admin = accounts[0];
  const user = accounts[1];

  // L1Swap
  const l1swapFactory = await ethers.getContractFactory("L1Swap");
  const l1swap = await upgrades.deployProxy(
    l1swapFactory,
    [
      l1WethAddress,// _weth
      l1_veth_address, // _veth
      lidoAddress,// _lido
    ],
    {kind: "uups"},
  );
  await l1swap.deployed();
  console.log(`L1Swap: ${l1swap.address}`);

  // veth의 minter를 l1sawp로 지정함

  const veth = new ethers.Contract(l1_veth_address, [{
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

  return sceth.address;
}

async function deploy_l2Swap(l2_veth_address: string, l2_sceth_address: string) {
  const accounts = await ethers.getSigners();
  const admin = accounts[0];
  const user = accounts[1];

  // L1Swap
  const l2swapFactory = await ethers.getContractFactory("L2Swap");
  const l2swap = await upgrades.deployProxy(
    l2swapFactory,
    [
      l2WethAddress,// _weth
      l2_veth_address, // _veth
      l2_sceth_address,// _sceth
    ],
    {kind: "uups"},
  );
  await l2swap.deployed();
  console.log(`L2Swap: ${l2swap.address}`);

  // veth를 예치해 둠 (실제로는 브릿지에서 꺼내온 VETH를 예치한다.)
  // 시연을 위한 민팅
  const veth = new ethers.Contract(l2_veth_address, [{
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
  const sceth = new ethers.Contract(l2_sceth_address, [{
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

async function deploy_astar_mockweth() { // 처음 한번만 배포해두고 계속 이용하면 됨

  const mockWethFactory = await ethers.getContractFactory("MockWETH");
  const mockWeth = await upgrades.deployProxy(
    mockWethFactory,
    [],
    {kind: "uups"},
  );
  await mockWeth.deployed();
  console.log(`mock Weth: ${mockWeth.address}`);
}

async function cbridge_test() {

  const chainId = (await ethers.provider.getNetwork()).chainId;
  const messageBusAddress = cBridgeMessageBusAddress[chainId];

  const cBridgeTestFactory = await ethers.getContractFactory("CBridgeTest");
  const bridgeTest = await cBridgeTestFactory.deploy(messageBusAddress);
  await bridgeTest.deployed();
  console.log(`bridgeTest for ${chainId} chain: ${bridgeTest.address}, message bus is ${messageBusAddress}`);

}

async function upgrade_bridge() {
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const bridge_address = bridgeAddress[chainId];

  // Bridge
  const bridgeFactory = await ethers.getContractFactory("SimpleBridge");
  const proxyContract = await upgrades.upgradeProxy(bridge_address, bridgeFactory);
  await proxyContract.deployed();
}

async function deploy_l1_all() {
  await deploy_bridge_l1();
  const veth_address = await deploy_veth();
  await deploy_l1Swap(veth_address);
}

async function deploy_l2_all() {
  // const veth_address = await deploy_veth();
  // const sceth_address = await deploy_sceth();
  // await deploy_bridge_l2(veth_address, sceth_address);
  await deploy_l2Swap(l2VethAddress, l2scethAddress);
}

cbridge_test().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
