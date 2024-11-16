import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import React from "react";
import { UOM } from "../../lib/types/UOMDataTypes";
import Toggle from "react-toggle";
import "react-toggle/style.css";

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
  const [ratio, setRatio] = useState<number>();
  const [isChecked, setIsChecked] = useState<boolean>();

  useEffect(() => {
    // Update categoryName when categoryToEdit changes
    setUOMName(UOMToEdit?.UOMName || "");

    setRatio(UOMToEdit?.ratio);

    setIsChecked(UOMToEdit?.status === 1);
  }, [UOMToEdit]); // Dependencies include categoryToEdit and UOM

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!UOMName?.trim()) {
      alert("Category name is required");
      return;
    }

    const newUOM = {
      UOMName,
      ratio,
      status: isChecked ? 1 : 0,
    };

    //@adgramirez add code that saves the details of the UOM to the DB

    setEditUOMModalVisibility(false);
  };

  const handleCancel = () => {
    setEditUOMModalVisibility(false);
    setUOMName("");
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
            className="bg-white hover:bg-gray hover:text-white text-gray border-2 border-gray font-semibold py-2 px-4 w-full rounded"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUOMModal;
