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
  date: string;
  employeeID: number;
};

const StatusRecordsModal: React.FC<StatusRecordsModal> = ({
  orderID,
  statusRecordsModalIsVisible,
  setStatusRecordsModalIsVisible,
}) => {
  //@adgramirez add useeffect to populate this array with price records of PRODUCTID
  const [statusRecordsForProduct, setStatusRecordsForProduct] = useState<
    StatusRecords[]
  >([
    {
      status: "Unpaid",
      date: "2024-11-02 16:39:28",
      employeeID: 1,
    },
  ]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
          <div className="text-center text-xl font-bold text-black mb-4">
            Status Records
          </div>
          <div className="grid grid-cols-[1fr_1fr_1fr] font-semibold text-sm">
            <div className="flex justify-center items-center">Status</div>
            <div className="flex justify-center items-center text-center ">
              Date Changed
            </div>
            <div className="flex justify-center items-center">Employee</div>
          </div>
          {statusRecordsForProduct.map((statusRecord, statusRecordIndex) => (
            <div
              key={statusRecordIndex}
              className="grid grid-cols-[1fr_1fr_1fr] mt-2 text-sm gap-y-1"
            >
              <div className="flex justify-center items-center">
                {statusRecord.status}
              </div>
              <div className="flex justify-center items-center">
                {statusRecord.date.substring(0, 10)}
              </div>
              <div className="flex justify-center items-center">
                {statusRecord.employeeID}
              </div>
            </div>
          ))}
          <div className="mt-8 text-center flex justify-end">
            <button
              className=" w-min bg-white hover:bg-gray hover:text-white text-gray border-2 border-gray font-semibold py-2 px-4 rounded"
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
