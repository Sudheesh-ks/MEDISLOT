import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/admin/assets";
import { motion } from "framer-motion";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import DataTable from "../../components/common/DataTable";

const AdminAppointments = () => {
  const navigate = useNavigate();
  const context = useContext(AdminContext);
  const appContext = useContext(AppContext);

  if (!context || !appContext) {
    throw new Error("Contexts must be used within their providers");
  }

  const { aToken, getAppointmentsPaginated, cancelAppointment } = context;
  const { calculateAge, slotDateFormat, currencySymbol } = appContext;

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    if (aToken) {
      fetchAppointments();
    }
  }, [aToken, currentPage]);

  useEffect(() => {
    if (!aToken) {
      navigate("/admin/login");
    }
  }, [aToken, navigate]);

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

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      // Refresh current page after cancellation
      fetchAppointments();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  const filteredAppointments = appointments.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.userData?.name?.toLowerCase().includes(q) ||
      item.docData?.name?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: "index",
      header: "#",
      width: "0.5fr",
      hideOnMobile: true,
      render: (_: any, index: number) => (
        <p>{(currentPage - 1) * itemsPerPage + index + 1}</p>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      width: "3fr",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <img
            className="w-10 h-10 rounded-full object-cover border"
            src={item.userData?.image || "/default-avatar.png"}
            alt="Patient"
          />
          <p className="font-medium text-gray-800 truncate">
            {item.userData?.name}
          </p>
        </div>
      ),
    },
    {
      key: "age",
      header: "Age",
      width: "1fr",
      hideOnMobile: true,
      render: (item: any) => (
        <p>{calculateAge(item.userData?.dob)}</p>
      ),
    },
    {
      key: "datetime",
      header: "Date & Time",
      width: "3fr",
      render: (item: any) => (
        <p className="truncate text-sm">
          {slotDateFormat(item.slotDate)}, {item.slotTime}
        </p>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      width: "3fr",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <img
            className="w-9 h-9 rounded-full object-cover border"
            src={item.docData?.image || "/default-avatar.png"}
            alt="Doctor"
          />
          <p className="text-gray-800 truncate">{item.docData?.name}</p>
        </div>
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
      header: "Actions",
      width: "1fr",
      render: (item: any) => (
        <>
          {item.cancelled ? (
            <p className="text-xs font-semibold text-red-400">Cancelled</p>
          ) : (
            <motion.img
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCancelAppointment(item._id!);
              }}
              className="w-8 h-8 cursor-pointer hover:opacity-80 transition"
              src={assets.cancel_icon}
              alt="Cancel"
            />
          )}
        </>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-semibold">📅 All Appointments</p>

      <div className="mb-4">
        <SearchBar
          placeholder="Search by name or email"
          onSearch={(query) => {
            setSearchQuery(query);
          }}
        />
      </div>

      <DataTable
        data={filteredAppointments}
        columns={columns}
        loading={loading}
        emptyMessage="No matching appointments found."
        gridCols="grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr]"
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};

export default AdminAppointments;
