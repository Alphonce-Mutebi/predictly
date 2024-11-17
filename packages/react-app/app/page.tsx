"use client";

import { BuySharesModal } from "@/components/BuySharesModal";
import CreateMarketModal from "@/components/CreateMarketModal";
/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    address,
    getUserAddress,
    createMarket,
    getMarkets,
    buyShares,
    sellShares,
  } = useWeb3();

  const [markets, setMarkets] = useState<any[]>([]);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [tx, setTx] = useState<any>(undefined);

  useEffect(() => {
    getUserAddress();
  }, []);

  useEffect(() => {
    const getData = async () => {
      const markets = await getMarkets();
      setMarkets(markets);
    };
    if (address) {
      getData();
    }
  }, [address]);

  const handleCreateMarketSubmit = async (formValues: any) => {
    console.log("Market data submitted:", formValues);
    // Call your `createMarket` function here with formValues
    try {
      const tx = await createMarket(
        formValues.cryptoPairName,
        formValues.targetPrice * 10 ** 18,
        Math.floor(Date.now() / 1000) + 86400,
        Math.floor(Date.now() / 1000) + 172800,
        "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
      );
      const markets = await getMarkets();
      setMarkets(markets);
      console.log(tx);
      setTx(tx);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const handleSell = (marketId: number) => {
    console.log("marketId: ", marketId);
    setSelectedMarketId(marketId);
    setIsBuyModalOpen(true);
  };

  const handleBuyClick = (marketId: number) => {
    console.log("marketId: ", marketId);
    setSelectedMarketId(marketId);
    setIsBuyModalOpen(true);
  };

  const handleBuyModalSubmit = async (
    marketId: number,
    isYes: boolean,
    amount: number
  ) => {
    console.log("reached here: ");
    console.log(
      `Market ID: ${marketId}, Bet: ${isYes ? "Yes" : "No"}, Amount: ${amount}`
    );
    // Call your buy shares logic here
    try {
      const tx = await buyShares(Number(marketId), isYes, amount * 10 ** 18);
      const markets = await getMarkets();
      setMarkets(markets);
      console.log(tx);
      setTx(tx);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {!address && (
        <div className="h1">Please install Metamask and connect.</div>
      )}

      <div className="flex items-center justify-between mt-4 mb-4">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search markets..."
          className="w-full max-w-xs rounded-full px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Create Market
        </button>
        <CreateMarketModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateMarketSubmit}
        />
      </div>

      {address && (
        <>
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

          {markets.length > 0 ? (
            [...markets].reverse().map((market) => (
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
                    {(
                      parseFloat(market.totalYesTokens.toString()) /
                      10 ** 18
                    ).toLocaleString()}
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
                    onClick={() => handleBuyClick(market.marketId)}
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
          {/* Modal */}
          {selectedMarketId !== null && (
            <BuySharesModal
              isOpen={isBuyModalOpen}
              onClose={() => setIsBuyModalOpen(false)}
              onSubmit={handleBuyModalSubmit}
              marketId={selectedMarketId}
            />
          )}
        </>
      )}
    </div>
  );
}
