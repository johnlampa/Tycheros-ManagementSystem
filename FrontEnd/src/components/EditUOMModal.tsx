import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import ValidationDialog from "@/components/ValidationDialog"; // Validation dialog
import React from "react";
import { UOM } from "../../lib/types/UOMDataTypes";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import axios from "axios";

interface EditUOMModalProps {
  editUOMModalIsVisible: boolean;
  setEditUOMModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  modalTitle: string;
  UOMToEdit: UOM | undefined;
}

const EditUOMModal: React.FC<EditUOMModalProps> = ({
  editUOMModalIsVisible,
  setEditUOMModalVisibility,
  modalTitle,
  UOMToEdit,
}) => {
  const [UOMName, setUOMName] = useState("");
  const [ratio, setRatio] = useState<number | undefined>();
  const [isChecked, setIsChecked] = useState<boolean>();
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Update state when UOMToEdit changes
    setUOMName(UOMToEdit?.UoM || "");
    setRatio(UOMToEdit?.ratio);
    setIsChecked(UOMToEdit?.status === 1);
  }, [UOMToEdit]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!UOMName.trim()) {
      setValidationMessage("UOM name is required.");
      return;
    }

    if (ratio === undefined || ratio <= 0) {
      setValidationMessage("Ratio must be greater than 0.");
      return;
    }

    const updatedUOM = {
      UOMName,
      ratio,
      status: isChecked ? 1 : 0,
    };

    try {
      const response = await axios.put(
        `http://localhost:8081/inventoryManagement/editUoM/${UOMToEdit?.unitOfMeasurementID}`,
        updatedUOM
      );

      if (response.status === 200) {
        alert("Unit of Measurement updated successfully!");
        setEditUOMModalVisibility(false); // Close modal after success
        window.location.reload(); // Reload the page to reflect changes
      }
    } catch (error) {
      console.error("Error updating UOM:", error);
      setValidationMessage("Failed to update Unit of Measurement. Please try again.");
    }
  };

  const handleCancel = () => {
    // Reset the values to their defaults from UOMToEdit
    setUOMName(UOMToEdit?.UoM || "");
    setRatio(UOMToEdit?.ratio);
    setIsChecked(UOMToEdit?.status === 1);

    // Close the modal
    setEditUOMModalVisibility(false);
  };

  return (
    <Modal
      modalIsVisible={editUOMModalIsVisible}
      setModalVisibility={setEditUOMModalVisibility}
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

        {UOMToEdit?.ratio !== 1 && (
          <>
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
            <div className="flex gap-x-2 text-black mb-5">
              <p>Active: </p>
              <Toggle
                checked={isChecked}
                icons={false}
                onChange={(e) => {
                  setIsChecked(e.target.checked);
                }}
              />
            </div>
          </>
        )}

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
  );
};

export default EditUOMModal;
