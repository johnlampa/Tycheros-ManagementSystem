import { useState } from "react";
import Modal from "@/components/ui/Modal";
import React from "react";
import axios from "axios";
import ValidationDialog from "@/components/ValidationDialog";
import Notification from "./Notification";

interface AddUOMModalProps {
  addUOMModalIsVisible: boolean;
  setAddUOMModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  modalTitle: string;
  categoryID: number; // Pass the categoryID for the UoM being added
}

const AddUOMModal: React.FC<AddUOMModalProps> = ({
  addUOMModalIsVisible,
  setAddUOMModalVisibility,
  modalTitle,
  categoryID,
}) => {
  const [UOMName, setUOMName] = useState<string>("");
  const [ratio, setRatio] = useState<number>(0);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = () => {
    if (!UOMName.trim()) {
      setValidationMessage("UOM name is required.");
      return false;
    }

    if (ratio <= 0 || isNaN(ratio)) {
      setValidationMessage("Ratio must be a number greater than 0.");
      return false;
    }

    setValidationMessage(null);
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newUOM = {
      categoryID,
      UOMName,
      ratio,
      status: 1, // Active status by default
    };

    try {
      const response = await axios.post(
        "http://localhost:8081/inventoryManagement/addUoM",
        newUOM
      );

      if (response.status === 201) {
        setSuccessMessage(`UoM added successfully`);
        setAddUOMModalVisibility(false);
        setUOMName(""); // Clear the input fields
        setRatio(0); // Reset ratio to default
        setTimeout(() => {
          window.location.reload();
        }, 3000); // Reload the page to reflect changes
      }
    } catch (error) {
      console.error("Error adding UoM:", error);
      setValidationMessage("Failed to add Unit of Measurement. Please try again.");
    }
  };

  const handleCancel = () => {
    setAddUOMModalVisibility(false);
    setUOMName("");
    setRatio(0);
  };

  return (
    <>
      <Modal
        modalIsVisible={addUOMModalIsVisible}
        setModalVisibility={setAddUOMModalVisibility}
      >
        <form onSubmit={handleSave} className="w-[340px] p-6 mx-auto rounded">
          <p className="text-center text-xl font-bold text-black mb-4">
            {modalTitle}
          </p>

          <div className="flex justify-between items-center mb-4 text-black">
            <label htmlFor="UOMName" className="pr-4">
              Name
            </label>
          </div>

          <input
            type="text"
            name="UOMName"
            id="UOMName"
            placeholder="Enter name"
            className="border border-gray rounded w-full p-3 mb-4 text-black placeholder-gray"
            value={UOMName}
            onChange={(e) => setUOMName(e.target.value)}
          />

          <div className="flex justify-between items-center mb-4 text-black">
            <label htmlFor="ratio" className="pr-4">
              Ratio to Reference
            </label>
          </div>

          <input
            type="number"
            name="ratio"
            id="ratio"
            placeholder="Enter ratio"
            className="border border-gray rounded w-full p-3 mb-4 text-black placeholder-gray"
            value={ratio}
            onChange={(e) => setRatio(parseFloat(e.target.value))}
          />

          <button
            type="submit"
            className="bg-tealGreen hover:bg-tealGreen text-white font-semibold py-2 px-4 rounded w-full mt-5"
          >
            Save
          </button>

          <div className="mt-2 text-center">
            <button
              type="button"
              className="bg-white hover:bg-gray hover:text-white text-gray border-2 border-gray font-semibold py-2 px-4 w-full rounded"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
        {validationMessage && (
          <ValidationDialog
            message={validationMessage}
            onClose={() => setValidationMessage(null)}
          />
        )}
      </Modal>
      {successMessage && (
        <Notification
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </>
  );
};

export default AddUOMModal;