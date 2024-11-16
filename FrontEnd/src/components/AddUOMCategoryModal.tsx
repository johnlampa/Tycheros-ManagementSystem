import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { CategoriesDataTypes } from "../../lib/types/CategoriesDataTypes";
import React from "react";

interface AddUOMCategoryModalProps {
  addUOMCategoryModalIsVisible: boolean;
  setAddUOMCategoryModalVisibility: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  modalTitle: string;
}

const AddUOMCategoryModal: React.FC<AddUOMCategoryModalProps> = ({
  addUOMCategoryModalIsVisible,
  setAddUOMCategoryModalVisibility,
  modalTitle,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [referenceUOMName, setReferenceUOMName] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Category name is required");
      return;
    }

    const newCategory = {
      categoryName,
      referenceUOMName,
      status: 1,
    };

    //@adgramirez add code that adds the new category to the DB

    setCategoryName("");
    setReferenceUOMName("");
    setAddUOMCategoryModalVisibility(false);
  };

  const handleCancel = () => {
    setAddUOMCategoryModalVisibility(false);
    setCategoryName("");
  };

  return (
    <Modal
      modalIsVisible={addUOMCategoryModalIsVisible}
      setModalVisibility={setAddUOMCategoryModalVisibility}
    >
      <form onSubmit={handleSave} className="w-[340px] p-6 mx-auto rounded">
        <p className="text-center text-xl font-bold text-black mb-4">
          {modalTitle}
        </p>

        <div className="flex justify-between items-center mb-4 text-black">
          <label htmlFor="categoryName" className="pr-4">
            Category Name
          </label>
        </div>

        <input
          type="text"
          name="categoryName"
          id="categoryName"
          placeholder="Enter category name"
          className="border border-gray rounded w-full p-3 mb-4 text-black placeholder-gray"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />

        <div className="flex justify-between items-center mb-4 text-black">
          <label htmlFor="referenceUOMName" className="pr-4">
            Reference UOM Name
          </label>
        </div>

        <input
          type="text"
          name="referenceUOMName"
          id="referenceUOMName"
          placeholder="Enter reference UOM name"
          className="border border-gray rounded w-full p-3 mb-4 text-black placeholder-gray"
          value={referenceUOMName}
          onChange={(e) => setReferenceUOMName(e.target.value)}
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

export default AddUOMCategoryModal;
