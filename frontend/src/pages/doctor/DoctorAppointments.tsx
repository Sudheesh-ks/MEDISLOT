import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/admin/assets";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SearchBar from "../../components/common/SearchBar";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";

const DoctorAppointments = () => {
  const context = useContext(DoctorContext);
  const appContext = useContext(AppContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 6;

  if (!appContext) {
    throw new Error("AppContext must be used within AppContextProvider");
  }

  const { calculateAge, slotDateFormat, currencySymbol } = appContext;

  if (!context) {
    throw new Error("DoctorContext must be used within DoctorContextProvider");
  }

  const {
    dToken,
    getAppointmentsPaginated,
    confirmAppointment,
    cancelAppointment,
  } = context;

  useEffect(() => {
    if (dToken) {
      fetchAppointments();
    }
  }, [dToken, currentPage]);

  useEffect(() => {
    if (!dToken) {
      navigate("/doctor/login");
    }
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const result = await getAppointmentsPaginated(currentPage, itemsPerPage);
      setAppointments(result.data);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await confirmAppointment(appointmentId);
      // Refresh current page after confirmation
      fetchAppointments();
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      // Refresh current page after cancellation
      fetchAppointments();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  const filteredAppointments = appointments.filter((item) =>
    item.userData.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: "index",
      header: "#",
      width: "0.5fr",
      hideOnMobile: true,
      render: (_: any, index: number) => <p>{index + 1}</p>,
    },
    {
      key: "patient",
      header: "Patient",
      width: "2fr",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={item.userData.image}
            alt="user"
          />
          <p>{item.userData.name}</p>
        </div>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      width: "1fr",
      render: (item: any) => (
        <div>
          <p className="text-xs inline border border-primary px-2 rounded-full">
            {item.payment ? "Paid" : "Pending"}
          </p>
        </div>
      ),
    },
    {
      key: "age",
      header: "Age",
      width: "1fr",
      hideOnMobile: true,
      render: (item: any) => <p>{calculateAge(item.userData.dob)}</p>,
    },
    {
      key: "datetime",
      header: "Date & Time",
      width: "3fr",
      render: (item: any) => (
        <p>
          {slotDateFormat(item.slotDate)}, {item.slotTime}
        </p>
      ),
    },
    {
      key: "fees",
      header: "Fees",
      width: "1fr",
      render: (item: any) => (
        <p>
          {currencySymbol}
          {item.amount}
        </p>
      ),
    },
    {
      key: "actions",
      header: "Action",
      width: "1fr",
      render: (item: any) => (
        <>
          {item.cancelled ? (
            <p className="text-red-500">Cancelled</p>
          ) : item.isConfirmed ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/doctor/consultation");
              }}
              className="bg-primary px-4 py-1.5 text-sm rounded-lg font-medium text-white shadow transition duration-200"
            >
              Consultation
            </button>
          ) : (
            <div className="flex gap-2">
              <img
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelAppointment(item._id!);
                }}
                className="w-8 cursor-pointer"
                src={assets.cancel_icon}
                alt="Cancel"
              />
              <img
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmAppointment(item._id!);
                }}
                className="w-8 cursor-pointer"
                src={assets.tick_icon}
                alt="Confirm"
              />
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      {/* 🔍 Left-aligned Search Bar */}
      <div className="mb-5 max-w-sm">
        <SearchBar
          placeholder="Search by patient name"
          onSearch={(query) => setSearchQuery(query)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <>
          <DataTable
            data={filteredAppointments}
            columns={columns}
            emptyMessage="No matching appointments found."
            gridCols="grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr]"
            containerClassName="max-h-[80vh] min-h-[50vh]"
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      ) : (
        <div className="text-gray-500 mt-6 text-center w-full">
          No appointments found.
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
