import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import { ProductModalProps } from "../../lib/types/props/ProductModalProps";
import {
  ProductDataTypes,
  SubitemDataTypes,
} from "../../lib/types/ProductDataTypes";
import { FaTrashAlt } from "react-icons/fa";
import React from "react";
import { useEdgeStore } from "../../lib/edgestore";
import Link from "next/link";

const ProductModal: React.FC<ProductModalProps> = ({
  productModalIsVisible,
  setProductModalVisibility,
  modalTitle,
  setMenuProductHolder,
  inventoryData,
  type,
  menuProductToEdit,
  categoryName,
  menuData,
  setMenuData,
}) => {
  const categoryMap: { [key: string]: number } = {
    Appetizers: 1,
    Entrees: 2,
    Snacks: 3,
    "Combo Meals": 4,
    Wings: 5,
    Salads: 6,
    "Milk Tea": 7,
    Beer: 8,
    Coffee: 9,
    Whiskey: 10,
    Frappe: 11,
    Tea: 12,
  };
  const categoryID = categoryMap[categoryName] || 0;

  const [subitems, setSubitems] = useState<SubitemDataTypes[]>([]);
  const [deletedSubitemIds, setDeletedSubitemIds] = useState<number[]>([]);

  const [file, setFile] = React.useState<File>();
  const [urls, setUrls] = useState<{
    url: string;
    thumbnailUrl: string | null;
  }>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingMessage, setUploadingMessage] = useState<string | null>(null); // Upload message state
  const { edgestore } = useEdgeStore();

  const [loggedInEmployeeID, setLoggedInEmployeeID] = useState(-1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      if (loggedInEmployeeID) {
        setLoggedInEmployeeID(parseInt(loggedInEmployeeID));
      }
    }

    console.log("loggedInEmployeeID: ", loggedInEmployeeID);
  }, []);

  useEffect(() => {
    console.log("loggedInEmployeeID: ", loggedInEmployeeID);
  }, [loggedInEmployeeID]);

  useEffect(() => {
    if (type === "edit" && menuProductToEdit?.productID) {
      axios
        .get(
          `http://localhost:8081/menuManagement/getSpecificSubitems/${menuProductToEdit.productID}`
        )
        .then((response) => {
          setSubitems(response.data);
        })
        .catch((error) => {
          console.error("Error fetching subitems:", error);
        });
    } else if (type === "add") {
      setSubitems([]);
    }
  }, [type, menuProductToEdit]);

  useEffect(() => {
    return () => {
      setSubitems([]);
    };
  }, [productModalIsVisible]);

  const handleAddSubitem = () => {
    setSubitems([...subitems, { inventoryID: -1, quantityNeeded: 0 }]);
  };

  const handleDeleteSubitem = (inventoryID: number) => {
    if (inventoryID === -1) {
      if (subitems.length > 0) {
        setSubitems(subitems.slice(0, -1)); // Remove last element which is an empty select option
      }
    } else {
      const updatedSubitems = subitems.filter(
        (subitem) => subitem.inventoryID !== inventoryID
      );
      setSubitems(updatedSubitems);
      setDeletedSubitemIds((prev) => [...prev, inventoryID]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());

    let validationErrors = [];

    // Product Name validation
    if (!formJson.productName) {
      validationErrors.push("Product Name is required.");
    }

    // Selling Price validation
    const price = parseFloat(formJson.sellingPrice as string);
    if (!formJson.sellingPrice || price <= -1) {
      validationErrors.push("Price is required.");
    }

    // Subitems validation (at least one subitem should be selected)
    if (subitems.length === 0) {
      validationErrors.push("At least one subitem must be added.");
    } else {
      subitems.forEach((subitem, index) => {
        const inventoryID = parseInt(formJson[`subitem-${index}`] as string);
        const quantityNeeded = parseFloat(
          formJson[`quantityNeeded-${index}`] as string
        );

        if (inventoryID === -1 || isNaN(inventoryID)) {
          validationErrors.push(
            `Please select a valid subitem for entry #${index + 1}.`
          );
        }

        if (!quantityNeeded || isNaN(quantityNeeded) || quantityNeeded <= 0) {
          validationErrors.push(
            `Please enter a valid quantity for subitem ${index + 1}.`
          );
        }
      });
    }

    // Image upload validation
    if (type === "add" && !file) {
      validationErrors.push("Product Image is required.");
    }

    // If an image file is provided, check its format for both "add" and "edit" cases
    if (file && !["image/png", "image/jpeg"].includes(file.type)) {
      validationErrors.push(
        "Invalid file format. Only PNG and JPEG are allowed."
      );
    }

    // If there are validation errors, display them and stop submission
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      return;
    }

    const updatedProduct: ProductDataTypes = {
      productName: formJson.productName as string,
      sellingPrice: price,
      categoryID: categoryID,
      imageUrl: "", // Initially set as an empty string
      subitems: subitems.map((subitem, index) => ({
        inventoryID: parseInt(formJson[`subitem-${index}`] as string),
        quantityNeeded: parseFloat(
          formJson[`quantityNeeded-${index}`] as string
        ),
      })),
      //employeeID: loggedInEmployeeID
    };

    try {
      if (file) {
        setIsUploading(true);
        setUploadingMessage("Don’t close. Uploading file...");
        const res = await edgestore.myPublicImages.upload({ file });
        updatedProduct.imageUrl = res.url;
      } else if (type === "edit") {
        updatedProduct.imageUrl = menuProductToEdit?.imageUrl || "";
      }

      if (type === "edit" && menuProductToEdit?.productID) {
        await axios.put(
          `http://localhost:8081/menuManagement/putProduct/${menuProductToEdit.productID}`,
          { ...updatedProduct, deletedSubitemIds }
        );
        console.log("Product updated:", updatedProduct);
      } else {
        await axios.post(
          "http://localhost:8081/menuManagement/postProduct",
          updatedProduct
        );
        console.log("Product added:", updatedProduct);
      }

      if (setMenuProductHolder) {
        setMenuProductHolder(updatedProduct);
      }

      form.reset();
      setProductModalVisibility(false);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting product:", error);
    } finally {
      setIsUploading(false);
      setUploadingMessage(null);
    }
  };

  const handleDelete = () => {
    if (menuProductToEdit?.productID) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      );
      if (confirmDelete) {
        axios
          .delete(
            `http://localhost:8081/menuManagement/deleteProduct/${menuProductToEdit.productID}`
          )
          .then((response) => {
            console.log("Product deleted:", response.data);
            const updatedMenuData = menuData.filter(
              (product) => product.productID !== menuProductToEdit.productID
            );
            setMenuData(updatedMenuData);
            setProductModalVisibility(false);
          })
          .catch((error) => {
            console.error("Error deleting product:", error);
          });
      }
    }
  };

  const handleCancel = () => {
    setProductModalVisibility(false);
  };

  return (
    <Modal
      modalIsVisible={productModalIsVisible}
      setModalVisibility={setProductModalVisibility}
    >
      <form
        id="productForm"
        onSubmit={handleSubmit}
        className="w-[340px] p-6 mx-auto rounded"
      >
        <p className="text-center text-xl font-bold text-black mb-4">
          {modalTitle}
        </p>

        <div className="flex justify-between items-center mb-4 text-black">
          <label htmlFor="productName" className="pr-4">
            Product Name
          </label>
        </div>

        <input
          type="text"
          name="productName"
          id="productName"
          placeholder="Enter product name"
          className="border border-gray rounded w-full p-3 mb-4 text-black placeholder-gray"
          defaultValue={type === "edit" ? menuProductToEdit?.productName : ""}
        />

        <label htmlFor="sellingPrice" className="block mb-2 text-black">
          Price
        </label>
        <input
          type="number"
          name="sellingPrice"
          id="sellingPrice"
          placeholder="Enter price"
          className="border border-gray rounded w-full p-3 mb-4 text-black placeholder-gray"
          defaultValue={type === "edit" ? menuProductToEdit?.sellingPrice : ""}
          onInput={(e) => {
            const input = e.target as HTMLInputElement;
            if (input.valueAsNumber < 0) {
              input.value = "0"; // Reset the value to 0 if negative
            }
          }}
        />

        <label className="block mb-2 text-black">Subitems</label>
        {subitems.map((subitem, index) => (
          <div
            key={subitem.inventoryID}
            className="flex justify-between items-center mb-4"
          >
            <select
              className="border border-gray rounded w-[60%] p-3 text-black mr-5 h-12"
              defaultValue={subitem.inventoryID}
              name={`subitem-${index}`}
              id={`subitem-${index}`}
            >
              <option value="">Choose</option>
              {inventoryData
                ?.filter((item) => item.inventoryCategory !== "Condiments")
                .map((item) => (
                  <option value={item.inventoryID} key={item.inventoryID}>
                    {item.inventoryName} ({item.unitOfMeasure})
                  </option>
                ))}
            </select>

            <input
              type="number"
              name={`quantityNeeded-${index}`}
              id={`quantityNeeded-${index}`}
              placeholder="Quantity"
              className="border border-gray rounded w-[30%] p-3 text-black"
              defaultValue={subitem.quantityNeeded}
              min={0}
            />
            <button
              type="button"
              onClick={() => handleDeleteSubitem(subitem.inventoryID)}
              className="text-black ml-4"
            >
              <FaTrashAlt />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddSubitem}
          className="bg-white border-2 border-black hover:bg-black hover:text-white text-black text-sm font-semibold py-2 px-4 rounded w-full"
        >
          Add New Subitem
        </button>

        <div className="mt-7 mb-5">
          <label htmlFor="imageUpload" className="block mb-2 text-black">
            Upload Image <span className="text-gray">(PNG or JPEG format)</span>
          </label>
          <input
            id="imageUpload"
            name="imageUpload"
            type="file"
            className="cursor-pointer"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                // Check file size (2MB = 2 * 1024 * 1024 = 2097152 bytes)
                const maxSizeInBytes = 2 * 1024 * 1024;
                if (selectedFile.size > maxSizeInBytes) {
                  alert("File size exceeds 2MB. Please upload a smaller file.");
                  e.target.value = ""; // Reset file input
                  return;
                }
                setFile(selectedFile); // Proceed if file size is valid
              }
            }}
          />
        </div>

        {/* Save button with conditional disabled state */}
        <button
          type="submit"
          className={`bg-tealGreen hover:bg-tealGreen text-white font-semibold py-2 px-4 rounded w-full mt-5 ${
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isUploading}
        >
          Save
        </button>

        {/* Message indicating the upload status */}
        {uploadingMessage && (
          <p className="text-black text-center mt-4">{uploadingMessage}</p>
        )}

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

export default ProductModal;
