import { useState } from "react";

const CreateMarketModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}) => {
  const [formValues, setFormValues] = useState({
    cryptoPairName: "",
    targetPrice: "",
    bettingDeadline: "",
    resolutionTime: "",
    priceFeedId:
      "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // default value
  });

  const handleChange = (e: any) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(formValues);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Market</h2>
        <form onSubmit={handleSubmit}>
          {/* Crypto Pair Name */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Crypto Pair Name
            </label>
            <input
              type="text"
              name="cryptoPairName"
              value={formValues.cryptoPairName}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., ETH/USDT"
              required
            />
          </div>

          {/* Target Price */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Target Price
            </label>
            <input
              type="number"
              name="targetPrice"
              value={formValues.targetPrice}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 4000"
              required
            />
          </div>

          {/* Betting Deadline */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Betting Deadline
            </label>
            <input
              type="date"
              name="bettingDeadline"
              value={formValues.bettingDeadline}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Resolution Time */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Resolution Time
            </label>
            <input
              type="date"
              name="resolutionTime"
              value={formValues.resolutionTime}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Price Feed ID (Hidden Field) */}
          <input
            type="hidden"
            name="priceFeedId"
            value={formValues.priceFeedId}
          />

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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMarketModal;
