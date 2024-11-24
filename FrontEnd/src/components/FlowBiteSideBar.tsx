import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import Notification from "./Notification";
import Link from "next/link";

interface FlowBiteSideBarProps {
  setSideBarVisibility: React.Dispatch<React.SetStateAction<boolean>>;
}

const FlowBiteSideBar: React.FC<FlowBiteSideBarProps> = ({
  setSideBarVisibility,
}) => {
  const [inventorySubCatsVisibility, setInventorySubCatsVisibility] =
    useState(false);
  const [menuSubCatsVisibility, setMenuSubCatsVisibility] = useState(false);

  const [designation, setDesignation] = useState("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loggedInDesignation = localStorage.getItem("designation");

    setDesignation(loggedInDesignation || "");
  }, []);

  useEffect(() => {
    console.log(designation);
  }, [designation]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8081/login/logout", {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
      });

      if (response.ok) {
        setSuccessMessage("Logout successful");
        setTimeout(() => {
          localStorage.removeItem("loggedInEmployeeID");
          localStorage.removeItem("designation");
          window.location.href = "/login"; // Redirect to the login page
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(`Logout failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Logout failed. Please try again later.");
    }
  };

  const [employees, setEmployees] = useState<
    { employeeID: number; firstName: string; lastName: string }[]
  >([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/employeemanagement/getEmployee"
        );
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const [loggedInEmployeeID, setLoggedInEmployeeID] = useState(1);
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      if (loggedInEmployeeID) {
        setLoggedInEmployeeID(parseInt(loggedInEmployeeID));
      }
    }

    // Find employee with matching ID
    const employee = employees.find(
      (emp) => emp.employeeID === loggedInEmployeeID
    );

    if (employee) {
      // Set the employee's name in state
      setLoggedInEmployeeName(employee.lastName + ", " + employee.firstName);
    }
  }, [employees, loggedInEmployeeID]);

  return (
    <>
      <div className="text-primaryBrown">
        <aside
          id="separator-sidebar"
          className="fixed bg-cream top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full translate-x-0"
          aria-label="Sidebar"
        >
          <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <ul className="space-y-2 font-medium">
              <li>
                <button
                  type="button"
                  className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  aria-controls="dropdown-example"
                  data-collapse-toggle="dropdown-example"
                  onClick={() => {
                    setSideBarVisibility(false);
                  }}
                >
                  <span className="flex-1 text-left ml-2 whitespace-nowrap"></span>
                  <svg
                    className="w-[18px] h-[18px] text-gray-800 dark:text-white mr-[-2px]"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M6 18 17.94 6M18 18 6.06 6"
                    />
                  </svg>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  aria-controls="dropdown-example"
                  data-collapse-toggle="dropdown-example"
                >
                  <span className="flex-1 text-left ml-2 whitespace-nowrap"></span>
                </button>
              </li>
              <li>
                <Link
                  href="/order-management"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z" />
                    <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z" />
                    <path d="M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z" />
                  </svg>
                  <span className="flex-1 ms-3 whitespace-nowrap">Orders</span>
                </Link>
              </li>

              <li>
                <button
                  type="button"
                  className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  aria-controls="dropdown-example"
                  data-collapse-toggle="dropdown-example"
                  onClick={() => {
                    menuSubCatsVisibility
                      ? setMenuSubCatsVisibility(false)
                      : setMenuSubCatsVisibility(true);
                  }}
                >
                  <svg
                    className="w-[24px] h-[24px] text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.857 3A1.857 1.857 0 0 0 3 4.857v4.286C3 10.169 3.831 11 4.857 11h4.286A1.857 1.857 0 0 0 11 9.143V4.857A1.857 1.857 0 0 0 9.143 3H4.857Zm10 0A1.857 1.857 0 0 0 13 4.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 21 9.143V4.857A1.857 1.857 0 0 0 19.143 3h-4.286Zm-10 10A1.857 1.857 0 0 0 3 14.857v4.286C3 20.169 3.831 21 4.857 21h4.286A1.857 1.857 0 0 0 11 19.143v-4.286A1.857 1.857 0 0 0 9.143 13H4.857Zm10 0A1.857 1.857 0 0 0 13 14.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 21 19.143v-4.286A1.857 1.857 0 0 0 19.143 13h-4.286Z"
                      clip-rule="evenodd"
                    />
                  </svg>

                  <span className="flex-1 text-left ml-2 whitespace-nowrap">
                    Menu
                  </span>
                  {menuSubCatsVisibility ? (
                    <svg
                      className="w-[18px] h-[18px] text-gray-800 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="3"
                        d="m5 15 7-7 7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m1 1 4 4 4-4"
                      />
                    </svg>
                  )}
                </button>
                {menuSubCatsVisibility && (
                  <ul id="dropdown-example" className=" py-2 space-y-2">
                    <li>
                      <Link
                        href="/food-menu-management"
                        className=" text-sm flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                      >
                        <svg
                          className="w-[24px] h-[24px] text-gray-800 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm4.996 2a1 1 0 0 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM11 8a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-6Zm-4.004 3a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM11 11a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-6Zm-4.004 3a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM11 14a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-6Z"
                            clip-rule="evenodd"
                          />
                        </svg>

                        <div className="ml-2">Food Menu</div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/bar-menu-management"
                        className=" text-sm flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                      >
                        <svg
                          className="w-[24px] h-[24px] text-gray-800 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M11 4a1 1 0 0 0-1 1v10h10.459l.522-3H16a1 1 0 1 1 0-2h5.33l.174-1H16a1 1 0 1 1 0-2h5.852l.117-.67v-.003A1.983 1.983 0 0 0 20.06 4H11ZM9 18c0-.35.06-.687.17-1h11.66c.11.313.17.65.17 1v1a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-1Zm-6.991-7a17.8 17.8 0 0 0 .953 6.1c.198.54 1.61.9 2.237.9h1.34c.17 0 .339-.032.495-.095a1.24 1.24 0 0 0 .41-.27c.114-.114.2-.25.254-.396a1.01 1.01 0 0 0 .055-.456l-.242-2.185a1.073 1.073 0 0 0-.395-.71 1.292 1.292 0 0 0-.819-.286H5.291c-.12-.863-.17-1.732-.145-2.602-.024-.87.024-1.74.145-2.602H6.54c.302 0 .594-.102.818-.286a1.07 1.07 0 0 0 .396-.71l.24-2.185a1.01 1.01 0 0 0-.054-.456 1.088 1.088 0 0 0-.254-.397 1.223 1.223 0 0 0-.41-.269A1.328 1.328 0 0 0 6.78 4H4.307c-.3-.001-.592.082-.838.238a1.335 1.335 0 0 0-.531.634A17.127 17.127 0 0 0 2.008 11Z"
                            clip-rule="evenodd"
                          />
                        </svg>

                        <div className="ml-2">Bar Menu</div>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <div className="w-full flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M20 10H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8ZM9 13v-1h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1Z"
                      clip-rule="evenodd"
                    />
                    <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 1 1 0 4H4a2 2 0 0 1-2-2Z" />
                  </svg>
                  <Link
                    href="/inventory-management"
                    className="flex-1 ml-2 whitespace-nowrap"
                  >
                    Inventory
                  </Link>
                  <button
                    type="button"
                    aria-controls="dropdown-example"
                    data-collapse-toggle="dropdown-example"
                    onClick={() => {
                      inventorySubCatsVisibility
                        ? setInventorySubCatsVisibility(false)
                        : setInventorySubCatsVisibility(true);
                    }}
                  >
                    {inventorySubCatsVisibility ? (
                      <svg
                        className="w-[18px] h-[18px] text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          d="m5 15 7-7 7 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {inventorySubCatsVisibility && (
                  <ul id="dropdown-example" className=" py-2 space-y-2">
                    <li>
                      <Link
                        href="/uom-management"
                        className=" text-sm flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                      >
                        <svg
                          className="w-6 h-6 text-gray-800 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h11.613a2 2 0 0 0 1.346-.52l4.4-4a2 2 0 0 0 0-2.96l-4.4-4A2 2 0 0 0 15.613 6H4Z" />
                        </svg>
                        <div className="ml-2">Units of Measurement</div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/stock-in-records"
                        className=" text-sm flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                      >
                        <svg
                          className="w-[24px] h-[24px] text-gray-800 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M8 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1h2a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2Zm6 1h-4v2H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-1V4Zm-3 8a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm-2-1a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H9Zm2 5a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm-2-1a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H9Z"
                            clip-rule="evenodd"
                          />
                        </svg>

                        <div className="ml-2">Stock In Records</div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/stock-out-records"
                        className=" text-sm flex items-center w-full p-2 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                      >
                        <svg
                          className="w-[24px] h-[24px] text-gray-800 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm14 18a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4ZM5 11a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5Zm14 2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4Z" />
                        </svg>

                        <div className="ml-2">Stock Out Records</div>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              {designation !== "Staff" && (
                <li>
                  <Link
                    href="/employee-management"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 18"
                    >
                      <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                    </svg>
                    <span className="flex-1 ms-3 whitespace-nowrap">
                      Employees
                    </span>
                  </Link>
                </li>
              )}
            </ul>
            <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
                    />
                  </svg>

                  <span className="flex-1 ms-3 whitespace-nowrap">Log Out</span>
                </button>
              </li>
              <li>
                <div className="flex-1 ms-3 whitespace-nowrap text-xs">
                  Logged in as:{" "}
                  <span className="font-semibold">{loggedInEmployeeName}</span>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
      {successMessage && (
        <Notification
          message={successMessage}
          onClose={() => setSuccessMessage(null)} // Clear success message on close
        />
      )}
    </>
  );
};

export default React.memo(FlowBiteSideBar);
