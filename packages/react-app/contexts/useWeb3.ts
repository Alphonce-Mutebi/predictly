import { useState } from "react";
import StableTokenABI from "./cusd-abi.json";
import MinipayNFTABI from "./minipay-nft.json";
import PredictlyAbi from "./predictly.json";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
  parseEther,
  parseUnits,
  stringToHex,
} from "viem";
import { celoAlfajores } from "viem/chains";

const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http(),
});

const cUSDTokenAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Testnet
const MINIPAY_NFT_CONTRACT = "0xE8F4699baba6C86DA9729b1B0a1DA1Bd4136eFeF"; // Testnet
const predictlyContractAddress = "0x43c9C51A985f0f3Cb4BC3245f233D7d86a6B58c0"; // Testnet

export const useWeb3 = () => {
  const [address, setAddress] = useState<string | null>(null);

  const getUserAddress = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      let walletClient = createWalletClient({
        transport: custom(window.ethereum),
        chain: celoAlfajores,
      });

      let [address] = await walletClient.getAddresses();
      setAddress(address);
    }
  };

  const sendCUSD = async (to: string, amount: string) => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    let [address] = await walletClient.getAddresses();

    const amountInWei = parseEther(amount);

    const tx = await walletClient.writeContract({
      address: cUSDTokenAddress,
      abi: StableTokenABI.abi,
      functionName: "transfer",
      account: address,
      args: [to, amountInWei],
    });

    let receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    return receipt;
  };

  const mintMinipayNFT = async () => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    let [address] = await walletClient.getAddresses();

    const tx = await walletClient.writeContract({
      address: MINIPAY_NFT_CONTRACT,
      abi: MinipayNFTABI.abi,
      functionName: "safeMint",
      account: address,
      args: [
        address,
        "https://cdn-production-opera-website.operacdn.com/staticfiles/assets/images/sections/2023/hero-top/products/minipay/minipay__desktop@2x.a17626ddb042.webp",
      ],
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    return receipt;
  };

  const createMarket = async (
    _cryptoPairName: string,
    _targetPrice: number,
    _bettingDeadline: number,
    _resolutionTime: number,
    _priceFeedId: any
  ) => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    let [address] = await walletClient.getAddresses();

    const tx = await walletClient.writeContract({
      address: predictlyContractAddress,
      abi: PredictlyAbi,
      functionName: "createMarket",
      account: address,
      args: [
        _cryptoPairName,
        _targetPrice,
        _bettingDeadline,
        _resolutionTime,
        _priceFeedId,
      ],
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    return receipt;
  };

  const buyShares = async (
    _marketId: number,
    _isYes: boolean,
    _amount: number
  ) => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    let [address] = await walletClient.getAddresses();
    // TODO approve allowance for cusd contract
    // Approve CUSD allowance for Predictly contract
    const approveTx = await walletClient.writeContract({
      address: cUSDTokenAddress,
      abi: StableTokenABI.abi,
      functionName: "approve",
      account: address,
      args: [predictlyContractAddress, parseUnits("1000000", 18)],
    });

    console.log("Token approval successful");

    await publicClient.waitForTransactionReceipt({
      hash: approveTx,
    });

    const tx = await walletClient.writeContract({
      address: predictlyContractAddress,
      abi: PredictlyAbi,
      functionName: "purchaseTokens",
      account: address,
      args: [_marketId, _isYes, _amount],
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    return receipt;
  };

  const sellShares = async (
    _marketId: number,
    _isYes: boolean,
    _amount: number
  ) => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    let [address] = await walletClient.getAddresses();
    // TODO approve allowance for cusd contract
    // Approve CUSD allowance for Predictly contract
    const approveTx = await walletClient.writeContract({
      address: cUSDTokenAddress,
      abi: StableTokenABI.abi,
      functionName: "approve",
      account: address,
      args: [predictlyContractAddress, parseUnits("1000000", 18)],
    });

    console.log("Token approval successful");

    await publicClient.waitForTransactionReceipt({
      hash: approveTx,
    });

    const tx = await walletClient.writeContract({
      address: predictlyContractAddress,
      abi: PredictlyAbi,
      functionName: "sellTokens",
      account: address,
      args: [_marketId, _isYes, _amount],
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    return receipt;
  };

  const getNFTs = async () => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    const minipayNFTContract = getContract({
      abi: MinipayNFTABI.abi,
      address: MINIPAY_NFT_CONTRACT,
      client: publicClient,
    });

    const [address] = await walletClient.getAddresses();
    const nfts: any = await minipayNFTContract.read.getNFTsByAddress([address]);

    let tokenURIs: string[] = [];

    for (let i = 0; i < nfts.length; i++) {
      const tokenURI: string = (await minipayNFTContract.read.tokenURI([
        nfts[i],
      ])) as string;
      tokenURIs.push(tokenURI);
    }
    return tokenURIs;
  };

  const getMarkets = async () => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    const predictlyContract = getContract({
      abi: PredictlyAbi,
      address: predictlyContractAddress,
      client: publicClient,
    });
    const markets: any = await predictlyContract.read.listAllMarkets();
    console.log("markets: ", markets);
    return markets;
  };

  const signTransaction = async () => {
    let walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    let [address] = await walletClient.getAddresses();

    const res = await walletClient.signMessage({
      account: address,
      message: stringToHex("Hello from Celo Composer MiniPay Template!"),
    });

    return res;
  };

  return {
    address,
    getUserAddress,
    sendCUSD,
    mintMinipayNFT,
    getNFTs,
    signTransaction,
    createMarket,
    getMarkets,
    buyShares,
    sellShares,
  };
};
