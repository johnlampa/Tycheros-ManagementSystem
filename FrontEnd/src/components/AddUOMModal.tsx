import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { CategoriesDataTypes } from "../../lib/types/CategoriesDataTypes";
import React from "react";

interface AddUOMModalProps {
  addUOMModalIsVisible: boolean;
  setAddUOMModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  modalTitle: string;
}

const AddUOMModal: React.FC<AddUOMModalProps> = ({
  addUOMModalIsVisible,
  setAddUOMModalVisibility,
  modalTitle,
}) => {
  const [UOMName, setUOMName] = useState("");
  const [ratio, setRatio] = useState<number>();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!UOMName.trim()) {
      alert("UOM name is required");
      return;
    }

    const newUOM = {
      UOMName,
      ratio,
      status: 1,
    };

    console.log(newUOM);

    //@adgramirez add code that adds the new uom to the DB

    setUOMName("");
    setRatio(0);
    setAddUOMModalVisibility(false);
  };

  const handleCancel = () => {
    setAddUOMModalVisibility(false);
    setUOMName("");
  };

  return (
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

export default AddUOMModal;
