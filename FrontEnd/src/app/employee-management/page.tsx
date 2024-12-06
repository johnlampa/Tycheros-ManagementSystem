"use client";
import React, { useEffect, useState } from "react";
import { Employee } from "../../../lib/types/EmployeeDataTypes";
import ValidationDialog from "@/components/ValidationDialog";
import Header from "@/components/Header";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import { GiHamburgerMenu } from "react-icons/gi";
import FlowBiteSideBar from "@/components/FlowBiteSideBar";
import Notification from "@/components/Notification";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [newEmployee, setNewEmployee] = useState<Employee>({
    employeeID: undefined,
    firstName: "",
    lastName: "",
    designation: "",
    status: "Active",
    contactInformation: "",
    password: "",
  });
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [selectedEmployeeID, setSelectedEmployeeID] = useState<number | null>(
    null
  );
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [sideBarVisibility, setSideBarVisibility] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
  const router = useRouter();
  // Check if the user is logged inz`
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      const loggedInEmployeeIDDesignation =localStorage.getItem("designation");
      console.log("local storage designation: ", loggedInEmployeeIDDesignation)
      if (loggedInEmployeeID) {
        if (loggedInEmployeeIDDesignation === "Staff") {
          router.push("/order-management"); // Redirect to order-management if designation is Staff
        } else {
          setIsAuthenticated(true); // Mark as authenticated for non-staff
        }
      } else {
        router.push("/login"); // Redirect to login if not logged in
      }
      
    }
  }, [router]);

  // Fetch data only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/employeeManagement/getEmployee"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: Employee[] = await response.json();
        setEmployees(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }
}, [isAuthenticated]);

// Render nothing while checking authentication
if (!isAuthenticated) {
  return null; // Prevent rendering until authentication is confirmed
}

    const handleAddEmployee = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/employeeManagement/postEmployee",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newEmployee),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add employee");
        }

        setNewEmployee({
          firstName: "",
          lastName: "",
          designation: "",
          status: "",
          contactInformation: "",
          password: "",
        });

        const updatedEmployees = await fetch(
          "http://localhost:8081/employeeManagement/getEmployee"
        ).then((res) => res.json());
        setEmployees(updatedEmployees);
        
        setSuccessMessage(`Employee added successfully`);
      } catch (error) {
        console.error("Error adding employee:", error);
      }
    };

  // Input Validation shenanigans :3
  // Phone number validation
  const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const phoneRegex = /^09\d{9}$/; // Regex for 11 digits starting with '09'
    return phoneRegex.test(phoneNumber);
  };
  // Add employee validation
  const getEmptyAddEmployeeFields = (): string[] => {
    const emptyFields = [];
    if (newEmployee.firstName.trim() === "") emptyFields.push("First Name");
    if (newEmployee.lastName.trim() === "") emptyFields.push("Last Name");
    if (newEmployee.designation.trim() === "") emptyFields.push("Designation");
    if (newEmployee.contactInformation.trim() === "") {
      emptyFields.push("Contact Number");
    } else if (!isValidPhoneNumber(newEmployee.contactInformation)) {
      emptyFields.push("Invalid Contact Number"); // Special message for invalid phone numbers
    }
    if (newEmployee.password.trim() === "") {
      emptyFields.push("Password"); // Validate if password is empty
    }

    return emptyFields;
  };

  const handleConfirmClick = () => {
    const emptyFields = getEmptyAddEmployeeFields();
    if (emptyFields.length === 0) {
      handleAddEmployee();
      setShowAddOverlay(false);
    } else {
      setValidationMessage(
        `Please fill out the following fields: ${emptyFields.join(", ")}`
      );
      setShowValidationDialog(true); // Show the validation dialog
    }
  };

  // Edit employee validation
  const getEmptyEditEmployeeFields = (): string[] => {
    const emptyFields = [];
    if (employeeToEdit?.firstName.trim() === "") emptyFields.push("First Name");
    if (employeeToEdit?.lastName.trim() === "") emptyFields.push("Last Name");
    if (employeeToEdit?.designation.trim() === "")
      emptyFields.push("Designation");
    if (employeeToEdit?.status.trim() === "") emptyFields.push("Status");
    if (employeeToEdit?.contactInformation.trim() === "") {
      emptyFields.push("Contact Number");
    } else if (!isValidPhoneNumber(employeeToEdit?.contactInformation || "")) {
      emptyFields.push("Invalid Contact Number"); // Special message for invalid phone numbers
    }
    if (employeeToEdit?.password.trim() === "") {
      emptyFields.push("Password"); // Validate if password is empty
    }

    return emptyFields;
  };

  const handleEditEmployee = (selectedEmployeeID?: number) => {
    const employee = employees.find(
      (emp) => emp.employeeID === selectedEmployeeID
    );
    if (employee) {
      setEmployeeToEdit(employee);
      setShowEditOverlay(true);
    } else {
      alert("Employee not found");
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(
        `http://localhost:8081/employeeManagement/putEmployee/${employeeToEdit?.employeeID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employeeToEdit),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update employee");
      }

      const updatedEmployees = await fetch(
        "http://localhost:8081/employeeManagement/getEmployee"
      ).then((res) => res.json());
      setEmployees(updatedEmployees);

      setSuccessMessage(`Employee updated successfully`);
      setShowEditOverlay(false);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="w-full flex flex-col items-center bg-white min-h-screen shadow-md pb-7">
        {successMessage && (
          <Notification
            message={successMessage}
            onClose={() => setSuccessMessage(null)} // Clear success message on close
          />
        )}
        <Header text="Employees" color={"tealGreen"} type={"orders"}>
          <button
            className="mr-3 flex items-center justify-center"
            onClick={() => {
              setSideBarVisibility(true);
            }}
          >
            <GiHamburgerMenu style={{ fontSize: "5vh", color: "white" }} />
          </button>
        </Header>
        {sideBarVisibility && (
          <FlowBiteSideBar
            setSideBarVisibility={setSideBarVisibility}
          ></FlowBiteSideBar>
        )}
  
        <div className="flex flex-col space-y-2 my-4 w-[310px]">
          <button
            onClick={() => setShowAddOverlay(true)}
            className="bg-tealGreen text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors duration-300"
          >
            Add Employee
          </button>
        </div>
  
        {/* No Employees Case */}
        {employees.length === 0 ? (
          <p className="text-center text-black">No employees found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-5">
            {employees.map((employee) => (
              <div
                key={employee.employeeID}
                className="relative flex flex-col justify-between border border-gray-300 p-4 rounded-md bg-[#F6F5E9] shadow-sm w-[310px]"
              >
                {/* Status and Designation Section */}
                <div className="flex gap-x-1 mb-2">
                    {/* Designation */}
                    <div className="py-1 px-2 rounded-md bg-black w-min text-xs text-white">
                    {employee.designation}
                  </div>
                  {employee.status === "Active" ? (
                    <div className="py-1 px-2 rounded-md bg-tealGreen w-min text-xs text-white">
                      Active
                    </div>
                  ) : (
                    <div className="py-1 px-2 rounded-md bg-gray w-min text-xs text-white">
                      Inactive
                    </div>
                  )}
                </div>
  
                {/* Header Section */}
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-black">
                    {employee.firstName} {employee.lastName}
                  </h2>
                </div>
  
                {/* Employee Details */}
                <div className="text-sm text-black space-y-2 mb-4">
                  <p>
                    <strong>Employee ID:</strong> {employee.employeeID}
                  </p>
                  <p>
                    <strong>Contact Number:</strong> {employee.contactInformation}
                  </p>
                </div>
  
                {/* Edit Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setEmployeeToEdit(employee); // Set selected employee data
                      setShowEditOverlay(true); // Open edit overlay
                    }}
                    className="bg-tealGreen text-white px-4 py-2 rounded hover:bg-[#70482E] transition-colors duration-300 w-full"
                  >
                    Edit Employee
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
  

  {showAddOverlay && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-5 rounded-lg w-72">
      <h2 className="text-black mb-4">Add Employee</h2>
      <div>
        <input
          type="text"
          placeholder="First Name"
          value={newEmployee.firstName}
          onChange={(e) =>
            setNewEmployee({
              ...newEmployee,
              firstName: e.target.value,
            })
          }
          className="mb-2.5 p-2 w-full text-black"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={newEmployee.lastName}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, lastName: e.target.value })
          }
          className="mb-2.5 p-2 w-full text-black"
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={newEmployee.contactInformation}
          onChange={(e) =>
            setNewEmployee({
              ...newEmployee,
              contactInformation: e.target.value,
            })
          }
          className="mb-2.5 p-2 w-full text-black"
        />
        <select
          value={newEmployee.designation}
          onChange={(e) =>
            setNewEmployee({
              ...newEmployee,
              designation: e.target.value,
            })
          }
          className="mb-2.5 p-2 w-full text-black"
        >
          <option value="" disabled>
            Select Designation
          </option>
          <option value="Owner">Owner</option>
          <option value="Manager">Manager</option>
          <option value="Staff">Staff</option>
        </select>

       {/* Status Toggle */}
        <div className="flex items-center mb-2.5">
          <label className="mr-2 text-black">Status:</label>
          <div
            className={`relative w-12 h-6 rounded-full cursor-pointer flex items-center`}
            onClick={() =>
              setNewEmployee({
                ...newEmployee,
                status: newEmployee.status === "Active" ? "Inactive" : "Active",
              })
            }
            style={{
              backgroundColor: newEmployee.status === 'Active' ? '#48bb78' : '#a0aec0', // green-500 for active, gray-400 for inactive
              transition: 'background-color 0.3s ease-in-out'
            }}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                newEmployee.status === "Active" ? "translate-x-6" : ""
              }`}
            />
          </div>
        </div>
        {/* Password field with toggle visibility */}
        <div className="relative mb-2.5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={newEmployee.password}
            onChange={(e) =>
              setNewEmployee({
                ...newEmployee,
                password: e.target.value,
              })
            }
            className="p-2 w-full text-black"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 py-2 text-black"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Confirm Password Field */}
        <div className="relative mb-2.5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-2 w-full text-black"
          />
        </div>

        {/* Error message for mismatched passwords */}
        {passwordError && (
          <p className="text-red text-sm mb-2.5">
            Passwords do not match. Please try again.
          </p>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => {
              const emptyFields = getEmptyAddEmployeeFields();
              if (emptyFields.length === 0) {
                if (newEmployee.password !== confirmPassword) {
                  setPasswordError(true); // Set the error message
                } else {
                  setPasswordError(false);
                  handleAddEmployee(); // Handle adding the employee to the system
                  setShowAddOverlay(false); // Close the overlay
                }
              } else {
                setValidationMessage(
                  `Please fill out the following fields: ${emptyFields.join(", ")}`
                );
                setShowValidationDialog(true); // Trigger ValidationDialog
              }
            }}
            className="bg-tealGreen text-white py-2 px-4 rounded cursor-pointer"
          >
            Confirm
          </button>

          <button
            onClick={() => {
              setNewEmployee({
                employeeID: undefined,
                firstName: "",
                lastName: "",
                designation: "",
                status: "",
                contactInformation: "",
                password: "",
              });
              setConfirmPassword(""); // Reset confirm password field
              setPasswordError(false); // Reset password error state
              setShowAddOverlay(false); // Close the overlay
            }}
            className="bg-tealGreen text-white py-2 px-4 rounded cursor-pointer"
          >
            Cancel
          </button>
        </div>
        {showValidationDialog && (
          <ValidationDialog
            message={validationMessage}
            onClose={() => setShowValidationDialog(false)}
          />
        )}
      </div>
    </div>
  </div>
)}

{showEditOverlay && employeeToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg w-72">
            <h2 className="text-black">Edit Employee</h2>
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={employeeToEdit.firstName}
                onChange={(e) =>
                  setEmployeeToEdit({
                    ...employeeToEdit,
                    firstName: e.target.value,
                  })
                }
                className="mb-2.5 p-2 w-full text-black"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={employeeToEdit.lastName}
                onChange={(e) =>
                  setEmployeeToEdit({
                    ...employeeToEdit,
                    lastName: e.target.value,
                  })
                }
                className="mb-2.5 p-2 w-full text-black"
              />
              <select
                value={employeeToEdit.designation}
                onChange={(e) =>
                  setEmployeeToEdit({
                    ...employeeToEdit,
                    designation: e.target.value,
                  })
                }
                className="mb-2.5 p-2 w-full text-black"
              >
                <option value="" disabled>
                  Select Designation
                </option>
                <option value="Owner">Owner</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
              <input
                type="text"
                placeholder="Contact Number"
                value={employeeToEdit.contactInformation}
                onChange={(e) =>
                  setEmployeeToEdit({
                    ...employeeToEdit,
                    contactInformation: e.target.value,
                  })
                }
                className="mb-2.5 p-2 w-full text-black"
              />

              {/* Status Toggle */}
              <div className="flex items-center mb-2.5">
                <label className="mr-2 text-black">Status:</label>
                <div
                  className={`relative w-12 h-6 rounded-full cursor-pointer flex items-center`}
                  onClick={() =>
                    setEmployeeToEdit({
                      ...employeeToEdit,
                      status: employeeToEdit.status === "Active" ? "Inactive" : "Active",
                    })
                  }
                  style={{
                    backgroundColor:
                      employeeToEdit.status === "Active" ? "#48bb78" : "#a0aec0", // green-500 for active, gray-400 for inactive
                    transition: "background-color 0.3s ease-in-out",
                  }}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                      employeeToEdit.status === "Active" ? "translate-x-6" : ""
                    }`}
                  />
                </div>
              </div>
              {/* Password input with toggle visibility */}
              <div className="relative mb-2.5">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={employeeToEdit.password}
                  onChange={(e) =>
                    setEmployeeToEdit({
                      ...employeeToEdit,
                      password: e.target.value,
                    })
                  }
                  className="p-2 w-full text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 py-2 text-black"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="relative mb-2.5">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="p-2 w-full text-black"
                />
              </div>

              {/* Error message for mismatched passwords */}
              {passwordError && (
                <p className="text-red-500 text-sm mb-2.5">
                  Passwords do not match. Please try again.
                </p>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    if (employeeToEdit.password !== confirmPassword) {
                      setPasswordError(true); // Display password mismatch error
                    } else {
                      setPasswordError(false); // Clear any previous error
                      handleSaveChanges(); // Save changes logic
                      setShowEditOverlay(false); // Close the overlay
                    }
                  }}
                  className="bg-tealGreen text-white py-2 px-4 rounded cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEmployeeToEdit(null); // Reset the employee data
                    setConfirmPassword(""); // Clear confirm password field
                    setPasswordError(false); // Clear password error state
                    setShowEditOverlay(false); // Close the modal
                  }}
                  className="bg-tealGreen text-white py-2 px-4 rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}