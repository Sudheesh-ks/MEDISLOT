import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/admin/assets";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/common/SearchBar";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";

const DoctorAppointments = () => {
  const ctx = useContext(DoctorContext);
  const app = useContext(AppContext);
  const navigate = useNavigate();

  /* ------------ local state ------------ */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);
  const [pages, setPages] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const perPage = 6;

  /* ------------ guards ------------ */
  if (!ctx) throw new Error("DoctorContext missing");
  if (!app) throw new Error("AppContext missing");
  const {
    dToken,
    getAppointmentsPaginated,
    confirmAppointment,
    cancelAppointment,
    profileData,
  } = ctx;
  const { calculateAge, slotDateFormat, currencySymbol } = app;

  /* ------------ effects ------------ */
  useEffect(() => {
    if (dToken) fetchRows();
  }, [dToken, page]);

  useEffect(() => {
    if (!dToken) navigate("/doctor/login");
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const r = await getAppointmentsPaginated(page, perPage);
      setRows(r.data);
      setPages(r.totalPages);
      setCount(r.totalCount);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  /* ------------ handlers ------------ */
  const doConfirm = async (id: string) => {
    await confirmAppointment(id);
    fetchRows();
  };
  const doCancel = async (id: string) => {
    await cancelAppointment(id);
    fetchRows();
  };

  /* ------------ filtered data ------------ */
  const filtered = rows.filter((r) =>
    r.userData.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ------------ columns ------------ */
  const cols = [
    { key: "#", header: "#", width: "0.5fr", hideOnMobile: true, render: (_: any, i: number) => i + 1 },
    {
      key: "patient",
      header: "Patient",
      width: "2fr",
      render: (it: any) => (
        <div className="flex items-center gap-2">
          <img className="w-12 h-12 rounded-full object-cover" src={it.userData.image} />
          <p>{it.userData.name}</p>
        </div>
      ),
    },
    {
      key: "pay",
      header: "Payment",
      width: "1fr",
      render: (it: any) => (
        <span className={`text-xs px-2 py-0.5 rounded-full ring-1 ${it.payment ? "ring-emerald-500 text-emerald-400" : "ring-yellow-500 text-yellow-400"}`}>
          {it.payment ? "Paid" : "Pending"}
        </span>
      ),
    },
    { key: "age", header: "Age", width: "1fr", hideOnMobile: true, render: (it: any) => calculateAge(it.userData.dob) },
    {
      key: "dt",
      header: "Date & Time",
      width: "3fr",
      render: (it: any) => `${slotDateFormat(it.slotDate)}, ${it.slotTime}`,
    },
    {
      key: "fees",
      header: "Fees",
      width: "1fr",
      render: (it: any) => (
        <span>
          {currencySymbol}
          {it.amount}
        </span>
      ),
    },
    {
      key: "act",
      header: "Action",
      width: "1fr",
      render: (it: any) => (
        it.cancelled ? (
          <span className="text-red-500">Cancelled</span>
        ) : it.isConfirmed ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/doctor/consultation/${it.userData._id}`);
            }}
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 px-4 py-1.5 text-sm rounded-lg text-white shadow"
          >
            Consultation
          </button>
        ) : (
          <div className="flex gap-3">
            <img
              onClick={(e) => {
                e.stopPropagation();
                doCancel(it._id!);
              }}
              src={assets.cancel_icon}
              className="w-7 cursor-pointer opacity-80 hover:opacity-100"
            />
            <img
              onClick={(e) => {
                e.stopPropagation();
                doConfirm(it._id!);
              }}
              src={assets.tick_icon}
              className="w-7 cursor-pointer opacity-80 hover:opacity-100"
            />
          </div>
        )
      ),
    },
  ];

  /* ------------ status gates ------------ */
  if (profileData?.status === "pending")
    return (
      <div className="m-5 text-center bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 text-yellow-200 shadow-md">
        <h2 className="text-xl font-semibold mb-2">⏳ Awaiting Approval</h2>
        <p>Your registration is under review. The admin has not approved your account yet.</p>
      </div>
    );
  if (profileData?.status === "rejected")
    return (
      <div className="m-5 text-center bg-red-900/30 border border-red-600 rounded-xl p-6 text-red-300 shadow-md">
        <h2 className="text-xl font-semibold mb-2">❌ Registration Rejected</h2>
        <p>Your registration has been rejected by the admin.</p>
        <p className="mt-2 text-sm">Please contact support or try registering again with updated details.</p>
      </div>
    );
  if (profileData?.status !== "approved") return null;

  /* ------------ main render ------------ */
  return (
    <div className="w-full max-w-6xl m-5 text-slate-100">
      <p className="mb-5 text-lg font-medium">All Appointments</p>

      <div className="mb-6 max-w-sm bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-xl p-3">
        <SearchBar placeholder="Search by patient name" onSearch={setSearch} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : filtered.length ? (
        <>
          <DataTable
            data={filtered}
            columns={cols}
            emptyMessage="No matching appointments found."
            gridCols="grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr]"
            containerClassName="max-h-[80vh] min-h-[50vh]"
          />
          {pages > 1 && <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />}
        </>
      ) : (
        <div className="text-slate-400 mt-10 text-center w-full">No appointments found.</div>
      )}
    </div>
  );
};
export default DoctorAppointments;