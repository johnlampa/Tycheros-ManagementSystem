"use client";

import React, { useState } from "react"; // Make sure React is imported
import { InventoryItem } from "../../../lib/types/InventoryItemDataTypes";

import { PiCaretCircleUpFill, PiCaretCircleDownFill } from "react-icons/pi";
import { IconContext } from "react-icons";
import axios from "axios";

import { format } from "date-fns";
import { UOM, UOMCategory } from "../../../lib/types/UOMDataTypes";

export type UOMManagementCardProps = {
  category: UOMCategory;
  UOM: UOM[];

  toggleRow: Function;

  //   inventoryItem: InventoryItem;
  //   handleEditItem: Function;
  //   handleUpdateStock: Function;

  expandedRow: number | null;
  setExpandedRow: React.Dispatch<React.SetStateAction<number | null>>;
  //

  detailedData: { [key: number]: any };
  setDetailedData: React.Dispatch<React.SetStateAction<{ [key: number]: any }>>;

  setEditUOMCategoryModalIsVisible: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setCategoryToEdit: React.Dispatch<
    React.SetStateAction<UOMCategory | undefined>
  >;

  setAddUOMModalIsVisible: React.Dispatch<React.SetStateAction<boolean>>;

  setEditUOMModalIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setUOMToEdit: React.Dispatch<React.SetStateAction<UOM | undefined>>;
};

function formatRatio(ratio: any): string {
  const numericRatio = Number(ratio); // Ensure ratio is a number

  if (isNaN(numericRatio)) {
    return "Invalid Ratio"; // Handle non-numeric values gracefully
  }

  if (numericRatio >= 1) {
    // For numbers >= 1, remove unnecessary trailing zeros
    return parseFloat(numericRatio.toFixed(10)).toString();
  } else if (numericRatio > 0) {
    // For small numbers < 1, remove unnecessary trailing zeros
    return parseFloat(numericRatio.toFixed(10)).toString();
  } else {
    return "0"; // Handle zero values explicitly
  }
}

const UOMManagementCard: React.FC<UOMManagementCardProps> = ({
  category,
  UOM,
  toggleRow,
  expandedRow,
  setExpandedRow,
  detailedData,
  setDetailedData,
  setEditUOMCategoryModalIsVisible,
  setCategoryToEdit,
  setAddUOMModalIsVisible,
  setEditUOMModalIsVisible,
  setUOMToEdit,
}) => {
  return (
    <>
      <div className="p-4 w-[320px] rounded-md bg-cream">
        <div className="flex justify-between items-center">
          {category.status === 1 ? (
            <div className="py-1 px-2 rounded-md bg-tealGreen w-min text-xs text-white mb-2">
              Active
            </div>
          ) : (
            <div className="py-1 px-2 rounded-md bg-red w-min text-xs text-white mb-2">
              Inactive
            </div>
          )}
          <IconContext.Provider value={{ color: "#6C4E3D", size: "27px" }}>
            <button onClick={() => toggleRow(category.categoryID)}>
              {expandedRow === category.categoryID ? (
                <PiCaretCircleUpFill className="text-white group-hover:text-primaryBrown transition-colors duration-300" />
              ) : (
                <PiCaretCircleDownFill className="text-white group-hover:text-primaryBrown transition-colors duration-300" />
              )}
            </button>
          </IconContext.Provider>
        </div>

        <div className="text-black flex gap-x-3">
          <div className="font-bold flex items-center">
            {category.categoryName.toUpperCase()}
          </div>
          <div>
            <button
              onClick={() => {
                setCategoryToEdit(category);
                setEditUOMCategoryModalIsVisible(true);
              }}
              className="text-black px-3 text-xs rounded-full border border-black "
            >
              Edit
            </button>
          </div>
        </div>

        <div className="w-full mt-4 text-sm">
          <div className="w-full flex gap-x-2 text-black ">
            <div>Reference: </div>
            {UOM.find(
              (uom: UOM) =>
                category.categoryID === uom.categoryID &&
                parseInt(uom.ratio.toString()) === 1
            ) ? (
              <div className="font-semibold">
                {
                  UOM.find(
                    (uom: UOM) =>
                      category.categoryID === uom.categoryID &&
                      parseInt(uom.ratio.toString()) === 1
                  )?.UoM
                }
              </div>
            ) : (
              <div>Not found</div>
            )}
          </div>

          <div className="w-full flex gap-x-2 text-black">
            <div>Others: </div>
            {UOM.map(
              (uom: UOM) =>
                category.categoryID === uom.categoryID &&
                parseInt(uom.ratio.toString()) !== 1
            ) ? (
              <div className="font-semibold">
                {
                  UOM.find(
                    (uom: UOM) =>
                      category.categoryID === uom.categoryID &&
                      parseInt(uom.ratio.toString()) !== 1
                  )?.UoM
                }
              </div>
            ) : (
              <div>Not found</div>
            )}
          </div>
        </div>

        <div className="w-full flex justify-end">
          <button
            onClick={() => setAddUOMModalIsVisible(true)}
            className="bg-cream text-primaryBrown border-2 border-primaryBrown py-1 px-2 text-sm rounded mt-2"
          >
            Add UOM
          </button>
        </div>

        {expandedRow === category.categoryID &&
          detailedData[category.categoryID] && (
            <div className="mt-6 text-black">
              <div className="flex justify-center items-center">
                <p className="text-black font-semibold text-base mb-[-9px]">
                  Units of Measurement
                </p>
              </div>
              <div className="text-sm flex flex-col items-center w-full">
                {detailedData[category.categoryID] &&
                detailedData[category.categoryID].length > 0 ? (
                  <>
                    <div className="w-full">
                      {detailedData[category.categoryID]?.map(
                        (detail: UOM, index: number) => (
                          <div key={index} className="mt-5">
                            <div className="flex items-center gap-x-3">
                              <div className="text-base font-semibold mb-1">
                                {detail.UoM}
                              </div>
                              <div>
                                <button
                                  onClick={() => {
                                    setUOMToEdit(detail);
                                    console.log(detail);
                                    setEditUOMModalIsVisible(true);
                                  }}
                                  className="text-black px-3 text-xs rounded-full border border-black"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>

                            {parseInt(detail.ratio.toString()) === 1 ? (
                              <div>Reference</div>
                            ) : (
                              <div className="flex gap-x-2">
                                {parseInt(detail.ratio.toString()) !== 1 ? (
                                  <>
                                    <div>Ratio to Reference:</div>
                                    <div className="font-semibold">{formatRatio(detail.ratio)}</div>
                                  </>
                                ) : null}
                              </div>
                            )}
                            <div className="flex gap-x-2">
                              {parseInt(detail.ratio.toString()) !== 1 ? (
                                <>
                                  <div>Status:</div>
                                  {detail.status === 1 ? (
                                    <div className="text-tealGreen">Active</div>
                                  ) : (
                                    <div className="text-red">Inactive</div>
                                  )}
                                </>
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-[2px] w-full bg-primaryBrown my-4"></div>
                    <p>No UOM found</p>
                  </>
                )}
              </div>
            </div>
          )}
      </div>
    </>
  );
};

export default React.memo(UOMManagementCard);
