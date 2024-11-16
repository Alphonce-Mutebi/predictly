import { useState } from "react";

export const BuySharesModal = ({
  isOpen,
  onClose,
  onSubmit,
  marketId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (marketId: number, isYes: boolean, amount: number) => void;
  marketId: number;
}) => {
  const [formValues, setFormValues] = useState({
    isYes: true,
    amount: 0,
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "isYes" ? value === "true" : Number(value),
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(marketId, formValues.isYes, formValues.amount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Buy Shares for Market {marketId}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Select Yes or No */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Bet
            </label>
            <select
              name="isYes"
              value={formValues.isYes ? "true" : "false"}
              onChange={handleChange}
              className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Enter Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formValues.amount}
              onChange={handleChange}
              className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter amount"
              min={1}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Buy Shares
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
