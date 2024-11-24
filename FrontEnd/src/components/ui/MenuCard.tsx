import Image from "next/image";
import React, { useEffect, useState } from "react";

import { MenuCardProps } from "../../../lib/types/props/MenuCardProps";
import axios from "axios";
import { SubitemDataTypes } from "../../../lib/types/ProductDataTypes";
import { InventoryItem } from "../../../lib/types/InventoryItemDataTypes";

const MenuCard: React.FC<MenuCardProps> = ({
  product,
  setProductToAdd,
  setQuantityModalVisibility,
}) => {
  const [subitems, setSubitems] = useState<SubitemDataTypes[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [availability, setAvailability] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch subitems for the given product
  useEffect(() => {
    axios
      .get(
        `http://localhost:8081/menuManagement/getSpecificSubitems/${product.productID}`
      )
      .then((response) => {
        setSubitems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching subitems:", error);
        setError(error);
      });
  }, [product]);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/inventoryManagement/getInventoryItem"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: InventoryItem[] = await response.json();
        setInventoryData(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Check product availability based on subitems and inventory
  useEffect(() => {
    if (subitems.length > 0 && inventoryData.length > 0) {
      const isAvailable = subitems.every((subitem) => {
        const matchingInventory = inventoryData.find(
          (inventory) => inventory.inventoryID === subitem.inventoryID
        );

        // Define isActive based on matching inventory
        const isActive =
          matchingInventory?.inventoryStatus === 1 ? true : false;

        // Check if the inventory is active and if the quantity needed is less than or equal to the total quantity remaining in inventory
        return matchingInventory
          ? isActive &&
              subitem.quantityNeeded <= matchingInventory.totalQuantity
          : false;
      });

      setAvailability(isAvailable);
    }
  }, [subitems, inventoryData]);

  return (
    <div className="w-36 flex flex-col bg-cream border border-gray rounded-md shadow-2xl overflow-hidden h-[280px]">
      {/* Image Section */}
      <div className="w-full h-[150px] relative">
        <Image
          draggable={false}
          fill
          src={product.imageUrl}
          className="object-cover"
          alt={product.productName}
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col p-3 flex-1">
        <p className="text-sm font-extrabold text-black">
          {product.productName}
        </p>
        <p className="text-sm text-gray-500 text-black">
          ₱{product.sellingPrice}
        </p>

        {/* Button at the bottom */}
        <button
          className={`mt-auto enabled:bg-tealGreen disabled:bg-gray text-white py-2 rounded-md enabled:hover:bg-[#30594f] duration-200 enabled:font-semibold disabled:font-normal text-xs`}
          disabled={!availability}
          onClick={() => {
            setQuantityModalVisibility(true);
            setProductToAdd(product);
            console.log("product to add: ", product);
          }}
        >
          {availability ? "Add Item" : "Unavailable"}
        </button>
      </div>
    </div>
  );
};

export default MenuCard;
