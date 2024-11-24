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
import ValidationDialog from "@/components/ValidationDialog";
import Notification from "./Notification";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import { InventoryDataTypes } from "../../lib/types/InventoryDataTypes";

const ProductModal: React.FC<ProductModalProps> = ({
  productModalIsVisible,
  setProductModalVisibility,
  modalTitle,
  setMenuProductHolder,
  type,
  menuProductToEdit,
  categoryName,
  menuData,
  setMenuData,
  setProductIDForPriceRecords,
  setPriceRecordsModalIsVisible,
  onSuccess,
}) => {
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: number }>({});
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [loggedInEmployeeID, setLoggedInEmployeeID] = useState(-1);

  // Fetch categories and populate categoryMap dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/menuManagement/getAllCategories"
        );
        const categories = response.data;

        // Create categoryMap dynamically
        const dynamicCategoryMap: { [key: string]: number } = {};
        categories.forEach(
          (category: { categoryName: string; categoryID: number }) => {
            dynamicCategoryMap[category.categoryName] = category.categoryID;
          }
        );

        setCategoryMap(dynamicCategoryMap);
        console.log("Category Map:", dynamicCategoryMap);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    console.log(inventoryData);
  });

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

  const [inventoryData, setInventoryData] = useState<InventoryDataTypes[]>([]);
  const [activeInventoryData, setActiveInventoryData] = useState<
    InventoryDataTypes[]
  >([]);
  const [
    activeInventoryPlusInactiveSubitemsData,
    setActiveInventoryPlusInactiveSubitemsData,
  ] = useState<InventoryDataTypes[]>([]);

  useEffect(() => {
    //Fetch All Inventory Items
    axios
      .get("http://localhost:8081/menuManagement/getAllInventoryItemsEdit")
      .then((response) => {
        setInventoryData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching inventory data:", error);
      });

    //Fetch Active Inventory Items
    axios
      .get("http://localhost:8081/menuManagement/getAllInventoryItemsAdd")
      .then((response) => {
        setActiveInventoryData(response.data);
        setActiveInventoryPlusInactiveSubitemsData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching inventory data:", error);
      });
  }, []);

  useEffect(() => {
    const updatedData: InventoryDataTypes[] =
      activeInventoryPlusInactiveSubitemsData;

    subitems.forEach((subitem) => {
      const matchedInventory = inventoryData.find(
        (inventory) => inventory.inventoryID === subitem.inventoryID
      );

      if (matchedInventory) {
        updatedData.push(matchedInventory);
      }
    });

    setActiveInventoryPlusInactiveSubitemsData(updatedData);
  }, [inventoryData]);

  useEffect(() => {
    console.log(
      "activeInventoryPlusInactiveSubitemsData: ",
      activeInventoryPlusInactiveSubitemsData
    );
  }, [activeInventoryPlusInactiveSubitemsData]);

  useEffect(() => {
    if (type === "edit" && menuProductToEdit?.productID) {
      axios
        .get(
          `http://localhost:8081/menuManagement/getSpecificSubitems/${menuProductToEdit.productID}`
        )
        .then((response) => {
          setSubitems(response.data);
          console.log(
            "productModalIsVisible changed. response data: ",
            response.data
          );
        })
        .catch((error) => {
          console.error("Error fetching subitems:", error);
        });
    } else if (type === "add") {
      setSubitems([]);
    }
  }, [type, menuProductToEdit, productModalIsVisible]);

  useEffect(() => {
    return () => {
      setSubitems([]);
    };
  }, [productModalIsVisible]);

  const [isChecked, setIsChecked] = useState<boolean>();

  useEffect(() => {
    setIsChecked(menuProductToEdit?.status === 1);
  }, [menuProductToEdit]);

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

  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let validationErrors = [];

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());

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
      setValidationMessage(
        `Please fill out the following:\n${validationErrors.join("\n")}`
      );
      return false;
    }

    const updatedProduct: ProductDataTypes = {
      productName: formJson.productName as string,
      sellingPrice: price,
      categoryID: categoryID,
      imageUrl: "", // Initially set as an empty string
      subitems: subitems.map((subitem, index) => ({
        inventoryID: parseInt(subitem.inventoryID.toString()),
        quantityNeeded: parseFloat(
          formJson[`quantityNeeded-${index}`] as string
        ),
      })),
      status: type === "edit" ? (isChecked ? 1 : 0) : 1, // Conditional status logic
      //@adgramirez modify backend
      employeeID: loggedInEmployeeID,
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
        if (onSuccess)
          onSuccess(`Product updated: ${updatedProduct.productName}`);
      } else {
        await axios.post(
          "http://localhost:8081/menuManagement/postProduct",
          updatedProduct
        );
        console.log("Product added:", updatedProduct);
        if (onSuccess)
          onSuccess(`Product added: ${updatedProduct.productName}`);
      }

      if (setMenuProductHolder) {
        setMenuProductHolder(updatedProduct);
      }

      console.log(updatedProduct);
      form.reset();
      setProductModalVisibility(false);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error submitting product:", error);
    } finally {
      setIsUploading(false);
      setUploadingMessage(null);
    }
  };

  const handleCancel = () => {
    setProductModalVisibility(false);
  };

  const [selectedInventories, setSelectedInventories] = useState<number[]>([]);

  // Reset subitems when productModalIsVisible changes
  useEffect(() => {
    setSubitems([]); // Clear subitems when modal changes
  }, [productModalIsVisible]);

  // Update selectedInventories as component mounts
  useEffect(() => {
    const updatedInventories = subitems.map(
      (subitem) => subitem.inventoryID || 0
    );
    setSelectedInventories(updatedInventories);
  }, []);

  // Update selectedInventories when subitems change
  useEffect(() => {
    const updatedInventories = subitems.map(
      (subitem) => subitem.inventoryID || 0
    );
    setSelectedInventories(updatedInventories);
  }, [subitems]);

  const handleInventoryChange = (index: number, newInventoryID: number) => {
    // Update selectedInventories
    setSelectedInventories((prev) => {
      const updatedSelections = [...prev];
      updatedSelections[index] = newInventoryID;
      return updatedSelections;
    });

    // Safely update subitems
    setSubitems((prev) =>
      prev.map((subitem, i) =>
        i === index ? { ...subitem, inventoryID: newInventoryID } : subitem
      )
    );
  };

  useEffect(() => {
    console.log("Updated selectedInventories: ", selectedInventories);
  }, [selectedInventories]);

  useEffect(() => {
    console.log("Updated subitems: ", subitems);
  }, [subitems]);

  return (
    <>
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

          <div className="flex justify-between">
            <label htmlFor="sellingPrice" className="block mb-2 text-black">
              Price
            </label>
            <p className="underline font-semibold text-sm pt-1">
              <button
                className="underline font-semibold text-sm block"
                onClick={(e) => {
                  e.preventDefault();
                  setProductIDForPriceRecords(menuProductToEdit?.productID);
                  setPriceRecordsModalIsVisible(true);
                }}
              >
                Records
              </button>
            </p>
          </div>

          <input
            type="number"
            name="sellingPrice"
            id="sellingPrice"
            placeholder="Enter price"
            className="border border-gray rounded w-full p-3 mb-4 text-black placeholder-gray"
            defaultValue={
              type === "edit" ? menuProductToEdit?.sellingPrice : ""
            }
            onInput={(e) => {
              const input = e.target as HTMLInputElement;
              if (input.valueAsNumber < 0) {
                input.value = "0"; // Reset the value to 0 if negative
              }
            }}
          />

          <label className="block mb-2 text-black">
            Subitems{" "}
            <span className="text-xs text-gray">
              (Subitems in red are inactive.)
            </span>
          </label>
          {subitems.map((subitem, index) => {
            // Find the matching inventory data for the current subitem
            const matchingInventory =
              activeInventoryPlusInactiveSubitemsData.find(
                (item) => item.inventoryID === subitem.inventoryID
              );

            console.log("matching inv: ", matchingInventory);

            // Determine if the subitem is inactive
            const isInactive = matchingInventory?.inventoryStatus === 0;

            return (
              <div
                key={subitem.inventoryID}
                className="flex justify-between items-center mb-4"
              >
                <select
                  className={`border border-gray rounded w-[60%] p-3 mr-5 h-12 ${
                    isInactive ? "text-red" : "text-black"
                  }`}
                  value={selectedInventories[index] || ""} // Bind only to state
                  name={`subitem-${index}`}
                  id={`subitem-${index}`}
                  onChange={(e) => {
                    handleInventoryChange(index, parseInt(e.target.value));
                    console.log(
                      "updated activeInventoryPlusInactiveSubitemsData after change: ",
                      activeInventoryPlusInactiveSubitemsData
                    );
                  }}
                >
                  <option value="" disabled>
                    Choose
                  </option>
                  {activeInventoryPlusInactiveSubitemsData
                    ?.filter((item) => {
                      const isUnselected = !selectedInventories.some(
                        (id, i) => id === item.inventoryID && i !== index
                      );
                      console.log(
                        "isUnselected:",
                        isUnselected,
                        "for item:",
                        item.inventoryID
                      );

                      return (
                        (item.inventoryCategory === "Produce" ||
                          item.inventoryCategory === "Dairy and Eggs" ||
                          item.inventoryCategory === "Meat and Poultry" ||
                          item.inventoryCategory === "Seafood" ||
                          item.inventoryCategory === "Canned Goods" ||
                          item.inventoryCategory === "Beverages") &&
                        isUnselected
                      );
                    })
                    .map((item, index) => (
                      <option value={item.inventoryID} key={index}>
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
            );
          })}

          <button
            type="button"
            onClick={handleAddSubitem}
            className="bg-white border-2 border-black hover:bg-black hover:text-white text-black text-sm font-semibold py-2 px-4 rounded w-full"
          >
            Add New Subitem
          </button>

          <div className="mt-7 mb-5">
            <label htmlFor="imageUpload" className="block mb-2 text-black">
              Upload Image{" "}
              <span className="text-gray">(PNG or JPEG format)</span>
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
                    alert(
                      "File size exceeds 2MB. Please upload a smaller file."
                    );
                    e.target.value = ""; // Reset file input
                    return;
                  }
                  setFile(selectedFile); // Proceed if file size is valid
                }
              }}
            />
          </div>

          {type === "edit" && (
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
          )}

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

export default ProductModal;
