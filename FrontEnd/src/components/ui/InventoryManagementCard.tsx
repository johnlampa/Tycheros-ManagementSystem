"use client";

import React, { useState } from "react"; // Make sure React is imported
import { InventoryItem } from "../../../lib/types/InventoryItemDataTypes";

import { PiCaretCircleUpFill, PiCaretCircleDownFill } from "react-icons/pi";
import { IconContext } from "react-icons";
import axios from "axios";

import { format } from "date-fns";

export type InventoryManagementCardProps = {
  inventoryItem: InventoryItem;
  handleEditItem: Function;
  handleUpdateStock: Function;

  expandedRow: number | null;
  setExpandedRow: React.Dispatch<React.SetStateAction<number | null>>;
  toggleRow: Function;

  detailedData: { [key: number]: any };
  setDetailedData: React.Dispatch<React.SetStateAction<{ [key: number]: any }>>;
};

const InventoryManagementCard: React.FC<InventoryManagementCardProps> = ({
  inventoryItem,
  handleEditItem,
  handleUpdateStock,
  expandedRow,
  setExpandedRow,
  toggleRow,
  detailedData,
  setDetailedData,
}) => {
  return (
    <>
      <div className="p-3 w-[320px] rounded-md bg-cream">
        <div className="flex justify-between">
          <div className="flex gap-x-1">
            {inventoryItem?.inventoryStatus === 1 ? (
              <div className="py-1 px-2 rounded-md bg-tealGreen w-min text-xs text-white mb-2">
                Active
              </div>
            ) : (
              <div className="py-1 px-2 rounded-md bg-red w-min text-xs text-white mb-2">
                Inactive
              </div>
            )}
            {inventoryItem?.totalQuantity <= inventoryItem?.reorderPoint && (
              <div className="py-1 px-2 rounded-md bg-red text-xs text-white mb-2 w-max">
                Low stock
              </div>
            )}
          </div>
          <IconContext.Provider value={{ color: "#6C4E3D", size: "27px" }}>
            <button onClick={() => toggleRow(inventoryItem?.inventoryID)}>
              <PiCaretCircleDownFill className="text-white group-hover:text-primaryBrown transition-colors duration-300" />
            </button>
          </IconContext.Provider>
        </div>

        <div className="font-bold text-black">
          {inventoryItem?.inventoryName.toUpperCase()}
        </div>
        <div className="text-black text-sm">
          <span className="font-bold">
            {inventoryItem?.totalQuantity} {inventoryItem?.unitOfMeasure}
          </span>{" "}
          in stock
        </div>
        <div className="text-gray text-sm">
          {inventoryItem?.inventoryCategory}
        </div>
        <div className="flex justify-end gap-x-1 mt-3">
          <button
            onClick={() => {
              if (inventoryItem?.inventoryID !== null) {
                handleEditItem(inventoryItem.inventoryID); // Use the selected radio button's inventory ID
              }
            }}
            className="bg-cream border-2 border-primaryBrown text-primaryBrown py-1 px-2 text-sm rounded"
          >
            Edit Item
          </button>
          <button
            onClick={() => {
              if (inventoryItem?.inventoryID !== null) {
                handleUpdateStock(inventoryItem.inventoryID.toString()); // Use the selected radio button's inventory ID
              }
            }}
            className="bg-primaryBrown text-white py-1 px-2 text-sm rounded"
          >
            Update Stock
          </button>
        </div>

        {expandedRow === inventoryItem?.inventoryID &&
          detailedData[inventoryItem?.inventoryID] && (
            <div className="mt-6 text-black">
              <div className="flex justify-center items-center">
                <p className="text-black font-semibold text-base mb-1">
                  Stock In Records
                </p>
              </div>

              <div className="text-xs flex flex-col items-center w-full ">
                {detailedData[inventoryItem?.inventoryID] &&
                detailedData[inventoryItem?.inventoryID].length > 0 ? (
                  <>
                    {/* <div className="w-full h-[2px] bg-primaryBrown my-4"></div> */}

                    <ul>
                      {detailedData[inventoryItem?.inventoryID].map(
                        (detail: any, index: number) => (
                          <div key={index} className="p-2 w-[300px]">
                            <li className="w-full">
                              <div>
                                Date:{" "}
                                {detail.expiryDate
                                  ? format(
                                      new Date(detail.expiryDate),
                                      "yyyy-MM-dd"
                                    )
                                  : "N/A"}{" "}
                                by {detail.employeeName}
                              </div>
                              <div className="mb-1"></div>
                              <div className="grid grid-cols-[3fr_1fr]">
                                <div>
                                  <div className="text-base font-semibold">
                                    {detail.supplierName}
                                  </div>

                                  <div className="border border-gray rounded-md p-0.5 w-fit">
                                    {detail.quantityRemaining}{" "}
                                    {inventoryItem.unitOfMeasure} in stock
                                  </div>
                                  <div className="text-gray mt-0.5">
                                    best before{" "}
                                    <span className="font-semibold">
                                      {detail.expiryDate
                                        ? format(
                                            new Date(detail.expiryDate),
                                            "yyyy-MM-dd"
                                          )
                                        : "N/A"}{" "}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-center items-center text-sm font-semibold">
                                  &#8369; {detail.pricePerUnit} /{" "}
                                  {inventoryItem.unitOfMeasure}
                                </div>
                              </div>
                            </li>
                            {index <
                              detailedData[inventoryItem?.inventoryID].length -
                                1 && (
                              <div className="h-[2px] w-full bg-secondaryBrown mt-3"></div>
                            )}
                          </div>
                        )
                      )}
                    </ul>
                  </>
                ) : (
                  <>
                    <div className="h-[2px] w-full bg-primaryBrown my-4"></div>
                    <p>No Stock Available</p>
                  </>
                )}
              </div>
            </div>
          )}
      </div>
    </>
  );
};

export default React.memo(InventoryManagementCard);
