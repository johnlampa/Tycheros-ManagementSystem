import Modal from "@/components/ui/Modal";
import { useEffect, useState } from "react";
import { Employee } from "../../lib/types/EmployeeDataTypes";

interface StatusRecordsModal {
  orderID: number | undefined;
  statusRecordsModalIsVisible: boolean;
  setStatusRecordsModalIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

type StatusRecords = {
  status: string;
  statusDateTime: string;
  employeeID: number;
};

const StatusRecordsModal: React.FC<StatusRecordsModal> = ({
  orderID,
  statusRecordsModalIsVisible,
  setStatusRecordsModalIsVisible,
}) => {
  const [statusRecordsForProduct, setStatusRecordsForProduct] = useState<
    StatusRecords[]
  >([]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!orderID) return;

    const fetchOrderStatuses = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8081/ordering/getOrderStatuses/${orderID}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch order statuses");
        }
        const data: StatusRecords[] = await response.json();
        setStatusRecordsForProduct(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatuses();
  }, [orderID]);

  useEffect(() => {
    if (!orderID) return;

    const fetchOrderStatuses = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8081/ordering/getOrderStatuses/${orderID}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch order statuses");
        }
        const data: StatusRecords[] = await response.json();
        setStatusRecordsForProduct(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatuses();
  }, [orderID]);

  useEffect(() => {
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
  }, []);

  return (
    <>
      <Modal
        modalIsVisible={statusRecordsModalIsVisible}
        setModalVisibility={setStatusRecordsModalIsVisible}
      >
        <div className="w-[340px] p-6 mx-auto rounded">
          <div className="text-center text-xl font-bold text-black mb-4 ">
            Status Records
          </div>
<<<<<<< HEAD
          <div className="grid grid-cols-[1fr_1fr_1fr] font-semibold text-sm text-black">
=======
          <div className="grid grid-cols-[1fr_1fr_1fr] font-semibold text-sm gap-x-1">
>>>>>>> 2f57af4 (layout changes and employee name instead of employee id)
            <div className="flex justify-center items-center">Status</div>
            <div className="flex justify-center items-center text-center">
              Date
            </div>
            <div className="flex justify-center items-center">Employee</div>
          </div>
<<<<<<< HEAD
          {statusRecordsForProduct.map((statusRecord, statusRecordIndex) => (
            <div
              key={statusRecordIndex}
              className="grid grid-cols-[1fr_1fr_1fr] mt-2 text-sm gap-y-1 text-black"
            >
              <div className="flex justify-center items-center">
                {statusRecord.status}
              </div>
              <div className="flex justify-center items-center">
                {statusRecord.statusDateTime.substring(0, 10)}
              </div>
              <div className="flex justify-center items-center">
                {statusRecord.employeeID}
              </div>
            </div>
          ))}
=======
          {statusRecordsForProduct.map((statusRecord, statusRecordIndex) => {
            const employee = employees.find(
              (emp) => emp.employeeID === statusRecord.employeeID
            );
            return (
              <div
                key={statusRecordIndex}
                className="grid grid-cols-[1fr_1fr_1fr] mt-2 text-sm gap-y-1 gap-x-1"
              >
                <div className="flex justify-center items-center">
                  {statusRecord.status}
                </div>
                <div className="flex justify-center items-center text-center">
                  {statusRecord.statusDateTime}
                </div>
                <div className="flex justify-center items-center text-xs text-center">
                  {employee
                    ? `${employee.lastName}, ${employee.firstName}`
                    : "Unknown"}
                </div>
              </div>
            );
          })}
>>>>>>> 2f57af4 (layout changes and employee name instead of employee id)
          <div className="mt-8 text-center flex justify-end">
            <button
              className="w-min bg-white hover:bg-gray hover:text-white text-gray border-2 border-gray font-semibold py-2 px-4 rounded"
              onClick={(e) => {
                e.preventDefault();
                setStatusRecordsModalIsVisible(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StatusRecordsModal;
