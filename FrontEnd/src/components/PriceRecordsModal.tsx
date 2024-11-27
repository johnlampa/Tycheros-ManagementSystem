import Modal from "@/components/ui/Modal";
import { useEffect, useState } from "react";
import { Employee } from "../../lib/types/EmployeeDataTypes";

interface PriceRecordsModal {
  productID: number | undefined;
  priceRecordsModalIsVisible: boolean;
  setPriceRecordsModalIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

type PriceRecords = {
  sellingPrice: number;
  priceDateTime: string;
  employeeID: number;
};

const PriceRecordsModal: React.FC<PriceRecordsModal> = ({
  productID,
  priceRecordsModalIsVisible,
  setPriceRecordsModalIsVisible,
}) => {
  const [priceRecordsForProduct, setPriceRecordsForProduct] = useState<
    PriceRecords[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPriceRecords = async () => {
      if (!productID) return;
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8081/menuManagement/getPriceHistory/${productID}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch price records");
        }
        let data = await response.json();

        console.log("Fetched price records:", data);

        // Ensure data is an array
        if (!Array.isArray(data)) {
          data = [data]; // Wrap single object in an array
        }

        setPriceRecordsForProduct(data);
      } catch (error) {
        console.error("Error fetching price records:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceRecords();
  }, [productID]);

  const [employees, setEmployees] = useState<Employee[]>([]);

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
    <Modal
      modalIsVisible={priceRecordsModalIsVisible}
      setModalVisibility={setPriceRecordsModalIsVisible}
    >
      <div className="w-[340px] p-6 mx-auto rounded">
        <div className="text-center text-xl font-bold text-black mb-4 ">
          Price Records
        </div>
        <div className="grid grid-cols-[1fr_1fr_1fr] font-semibold text-sm gap-x-1">
          <div className="flex justify-center items-center text-black">Price</div>
          <div className="flex justify-center items-center text-center text-black">
            Date Changed
          </div>
          <div className="flex justify-center items-center text-black">Employee</div>
        </div>
        {priceRecordsForProduct.map((priceRecord, priceRecordIndex) => {
          const employee = employees.find(
            (emp) => emp.employeeID === priceRecord.employeeID
          );
          return (
            <div
              key={priceRecordIndex}
              className="grid grid-cols-[1fr_1fr_1fr] mt-2 text-sm gap-y-1 gap-x-1 text-black"
            >
              <div className="flex justify-center items-center">
                &#8369; {priceRecord.sellingPrice}
              </div>
              <div className="flex justify-center items-center text-center">
                {priceRecord.priceDateTime.substring(0, 10)}
              </div>
              <div className="flex justify-center items-center text-xs text-center">
                {employee
                  ? `${employee.lastName}, ${employee.firstName}`
                  : "Unknown"}
              </div>
            </div>
          );
        })}
        <div className="mt-8 text-center flex justify-end">
          <button
            className="w-min bg-white hover:bg-gray hover:text-white text-gray border-2 border-gray font-semibold py-2 px-4 rounded"
            onClick={(e) => {
              e.preventDefault();
              setPriceRecordsModalIsVisible(false);
            }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PriceRecordsModal;
