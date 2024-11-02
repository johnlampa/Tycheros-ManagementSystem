import ValidationDialog from "@/components/ValidationDialog";
import React, { useState } from "react";

interface StockOutModalProps {
  stockOutData: {
    inventoryID: number;
    quantity: number;
    reason: string;
    stockOutDate: string;
  };
  setStockOutData: (data: any) => void;
  handleStockOutSubmit: () => Promise<void>;
  onClose: () => void;
  inventoryNames: { inventoryID: number; inventoryName: string }[];
}

const StockOutModal: React.FC<StockOutModalProps> = ({
  stockOutData,
  setStockOutData,
  handleStockOutSubmit,
  onClose,
  inventoryNames,
}) => {
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  const inventoryName =
    inventoryNames.find((inv) => inv.inventoryID === stockOutData.inventoryID)
      ?.inventoryName || "Unknown Item";

  const validateForm = () => {
    const missingFields: string[] = [];

    // Validate stockOutData fields
    if (!stockOutData.stockOutDate || stockOutData.stockOutDate.trim() === "") {
      missingFields.push("Stock Out Date");
    }

    if (stockOutData.quantity <= 0) {
      missingFields.push("Quantity");
    }

    if (!stockOutData.reason || stockOutData.reason.trim() === "") {
      missingFields.push("Reason");
    }

    if (missingFields.length > 0) {
      setValidationMessage(
        `Please fill out the following:\n${missingFields.join("\n")}`
      );
      return false;
    }

    setValidationMessage(null);
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      await handleStockOutSubmit();
      onClose();
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg w-96 max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-black">Stock Out</h2>
          <div className="flex items-center">
            <label htmlFor="stockOutDate" className="text-black mr-2">
              Date:
            </label>
            <input
              type="date"
              id="stockOutDate"
              value={stockOutData.stockOutDate ? stockOutData.stockOutDate : ""}
              onChange={(e) => {
                const newValue = e.target.value;
                setStockOutData({ ...stockOutData, stockOutDate: newValue });
              }}
              className="p-2 text-black border border-black"
            />
          </div>
        </div>

        {/* Inventory Name */}
        <div className="mb-2">
          <label className="text-black">Inventory Item:</label>
          <div className="p-2 border border-black text-black">
            {inventoryName}
          </div>
        </div>

        {/* Quantity Input */}
        <div className="mb-2">
          <label htmlFor="quantity" className="text-black">
            Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            placeholder="Quantity"
            value={stockOutData.quantity === 0 ? "" : stockOutData.quantity}
            min="0"
            onChange={(e) =>
              setStockOutData({
                ...stockOutData,
                quantity: e.target.value === "" ? 0 : Number(e.target.value),
              })
            }
            className="p-2 w-full text-black border border-black"
          />
        </div>

        {/* Reason Input */}
        <div className="mb-2">
          <label htmlFor="reason" className="text-black">
            Reason:
          </label>
          <input
            type="text"
            id="reason"
            placeholder="Reason"
            value={stockOutData.reason}
            onChange={(e) =>
              setStockOutData({ ...stockOutData, reason: e.target.value })
            }
            className="p-2 w-full text-black border border-black"
          />
        </div>

        {/* Save and Cancel Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleSubmit}
            className="bg-tealGreen text-black py-2 px-4 rounded cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-tealGreen text-black py-2 px-4 rounded cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Validation Dialog */}
      {validationMessage && (
        <ValidationDialog
          message={validationMessage}
          onClose={() => setValidationMessage(null)}
        />
      )}
    </div>
  );
};

export default StockOutModal;
