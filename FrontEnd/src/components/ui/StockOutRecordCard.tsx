"use client";

import React, { useState } from "react"; // Make sure React is imported
import { InventoryItem } from "../../../lib/types/InventoryItemDataTypes";

import { PiCaretCircleUpFill, PiCaretCircleDownFill } from "react-icons/pi";
import { IconContext } from "react-icons";
import axios from "axios";

import { format, set } from "date-fns";
import { StockOut } from "@/app/stock-out-records/page";

export type StockOutRecordCardProps = {
  stockOutData: StockOut;
  //   expandedRow: number | null;
  //   setExpandedRow: React.Dispatch<React.SetStateAction<number | null>>;
  //   toggleRow: Function;
  //   detailedData: { [key: number]: any };
  //   setDetailedData: React.Dispatch<React.SetStateAction<{ [key: number]: any }>>;
};

const StockOutRecordCard: React.FC<StockOutRecordCardProps> = ({
  stockOutData,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="p-3 w-[320px] rounded-md bg-cream">
        <div className="flex justify-between">
          <div className="flex flex-col text-black">
            <div className="text-sm">Date: {stockOutData.stockOutDateTime}</div>
            <div className="text-sm">
              Handled by: {stockOutData.employeeLastName},{" "}
              {stockOutData.employeeFirstName}
            </div>
            {/* <div>
              Date:{" "}
              {detail.stockInDate
                ? format(new Date(detail.stockInDate), "yyyy-MM-dd")
                : "N/A"}{" "}
              by {detail.employeeName}
            </div> */}
          </div>
          <div className="">
            <IconContext.Provider value={{ color: "#6C4E3D", size: "27px" }}>
              <button
                onClick={() =>
                  isExpanded ? setIsExpanded(false) : setIsExpanded(true)
                }
              >
                <PiCaretCircleDownFill className="text-white group-hover:text-primaryBrown transition-colors duration-300" />
              </button>
            </IconContext.Provider>
          </div>
        </div>

        {isExpanded && (
          <div className="text-black">
            <div className="h-[2px] w-full bg-secondaryBrown mt-6 mb-4"></div>
            <div className="text-xs flex flex-col items-center w-full ">
              <>
                <ul>
                  {stockOutData.stockOutItems.map(
                    (detail: any, index: number) => (
                      <div
                        key={index}
                        className="p-2 w-[300px] mb-2 flex justify-center items-center"
                      >
                        <li className="w-full">
                          <div className="grid grid-cols-[4fr_2fr]">
                            <div>
                              <div className="flex  items-end gap-x-1">
                                <div className="text-base font-semibold">
                                  {detail.stockOutItemName}
                                </div>
                              </div>

                              <div className="flex items-center gap-x-1 mt-1">
                                Reason: {detail.reason}
                              </div>
                            </div>
                            <div className="flex flex-col justify-center items-center text-sm font-semibold border border-gray rounded-md p-1 w-full">
                              <div>{detail.quantity}</div>{" "}
                              {detail.unitOfMeasurement}
                            </div>
                          </div>
                        </li>
                      </div>
                    )
                  )}
                </ul>
              </>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StockOutRecordCard;
