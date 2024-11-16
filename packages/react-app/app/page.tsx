"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const {
    address,
    getUserAddress,
    sendCUSD,
    mintMinipayNFT,
    getNFTs,
    signTransaction,
    createMarket,
    getMarkets,
    buyShares,
  } = useWeb3();

  const [cUSDLoading, setCUSDLoading] = useState(false);
  const [nftLoading, setNFTLoading] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [userOwnedNFTs, setUserOwnedNFTs] = useState<string[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);

  const [tx, setTx] = useState<any>(undefined);
  const [amountToSend, setAmountToSend] = useState<string>("0.1");
  const [messageSigned, setMessageSigned] = useState<boolean>(false); // State to track if a message was signed

  useEffect(() => {
    getUserAddress();
  }, []);

  useEffect(() => {
    const getData = async () => {
      const tokenURIs = await getNFTs();
      setUserOwnedNFTs(tokenURIs);
    };
    if (address) {
      getData();
    }
  }, [address]);

  useEffect(() => {
    const getData = async () => {
      const markets = await getMarkets();
      setMarkets(markets);
    };
    if (address) {
      getData();
    }
  }, [address]);

  async function sendingCUSD() {
    if (address) {
      setSigningLoading(true);
      try {
        const tx = await sendCUSD(address, amountToSend);
        setTx(tx);
      } catch (error) {
        console.log(error);
      } finally {
        setSigningLoading(false);
      }
    }
  }

  // TODO put necessary params in place
  async function handleCreateMarket() {
    try {
      const tx = await createMarket(
        "ETH/USDT",
        4000 * 10 ** 18,
        Math.floor(Date.now() / 1000) + 86400,
        Math.floor(Date.now() / 1000) + 172800,
        "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
      );
      console.log(tx);
      setTx(tx);
    } catch (error) {
      console.log(error);
    } finally {
    }
  }
  //   TODO ask for allowance ie approval
  const handleBuy = async (marketId: string) => {
    console.log(`Buy shares for market ${marketId}`);
    try {
      const tx = await buyShares(Number(marketId), true, 1 * 10 ** 18);
      console.log(tx);
      setTx(tx);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const handleSell = (marketId: string) => {
    console.log(`Sell shares for market ${marketId}`);
  };

  async function signMessage() {
    setCUSDLoading(true);
    try {
      await signTransaction();
      setMessageSigned(true);
    } catch (error) {
      console.log(error);
    } finally {
      setCUSDLoading(false);
    }
  }

  async function mintNFT() {
    setNFTLoading(true);
    try {
      const tx = await mintMinipayNFT();
      const tokenURIs = await getNFTs();
      setUserOwnedNFTs(tokenURIs);
      setTx(tx);
    } catch (error) {
      console.log(error);
    } finally {
      setNFTLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center">
      {!address && (
        <div className="h1">Please install Metamask and connect.</div>
      )}
      {/* {address && (
        <div className="h1">
          There you go... a canvas for your next Minipay project!
        </div>
      )} */}

      {/* <a
        href="https://faucet.celo.org/alfajores"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 mb-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        Get Test Tokens
      </a> */}
      <button
        onClick={handleCreateMarket}
        className="mt-4 mb-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        Create a Market
      </button>

      {address && (
        <>
          <div className="h2 text-center">
            Your address: <span className="font-bold text-sm">{address}</span>
          </div>
          {tx && (
            <p className="font-bold mt-4">
              Tx Completed:{" "}
              <a
                href={`https://celo-alfajores.blockscout.com/tx/${tx.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {tx.transactionHash.substring(0, 6)}...
                {tx.transactionHash.substring(tx.transactionHash.length - 6)}
              </a>
            </p>
          )}
          {/* <div className="w-full px-3 mt-7">
            <Input
              type="number"
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value)}
              placeholder="Enter amount to send"
              className="border rounded-md px-3 py-2 w-full mb-3"
            ></Input>
            <Button
              loading={signingLoading}
              onClick={sendingCUSD}
              title={`Send ${amountToSend} cUSD to your own address`}
              widthFull
            />
          </div>

          <div className="w-full px-3 mt-6">
            <Button
              loading={cUSDLoading}
              onClick={signMessage}
              title="Sign a Message"
              widthFull
            />
          </div>

          {messageSigned && (
            <div className="mt-5 text-green-600 font-bold">
              Message signed successfully!
            </div>
          )} */}

          {/* <div className="w-full px-3 mt-5">
            <Button
              loading={nftLoading}
              onClick={mintNFT}
              title="Mint Minipay NFT"
              widthFull
            />
          </div> */}

          {markets.length > 0 ? (
            markets.map((market) => (
              <div
                key={market.marketId.toString()}
                className="max-w-md mx-auto my-4 p-6 bg-white shadow-lg rounded-xl border border-gray-200"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Market ID: {market.marketId.toString()}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Crypto Pair:{" "}
                  <span className="font-medium">{market.cryptoPairName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Target Price:{" "}
                  <span className="font-medium">
                    {(
                      parseFloat(market.targetPrice) /
                      10 ** 18
                    ).toLocaleString()}{" "}
                    USD
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Betting Deadline:{" "}
                  <span className="font-medium">
                    {new Date(
                      Number(market.bettingDeadline) * 1000
                    ).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Resolution Time:{" "}
                  <span className="font-medium">
                    {new Date(
                      Number(market.resolutionTime) * 1000
                    ).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Total Yes Shares:{" "}
                  <span className="font-medium">
                    {market.totalYesTokens.toString()}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Total No Shares:{" "}
                  <span className="font-medium">
                    {market.totalNoTokens.toString()}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      market.isResolved ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {market.isResolved ? "Resolved" : "Ongoing"}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Result:{" "}
                  <span
                    className={`font-medium ${
                      market.result ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {market.result ? "Yes" : "No"}
                  </span>
                </p>

                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleBuy(market.marketId)}
                    className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
                  >
                    Buy Shares
                  </button>
                  <button
                    onClick={() => handleSell(market.marketId)}
                    className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
                  >
                    Sell Shares
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-6">
              No markets available
            </p>
          )}
        </>
      )}
    </div>
  );
}
