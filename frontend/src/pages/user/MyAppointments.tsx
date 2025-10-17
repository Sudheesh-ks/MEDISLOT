import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { toast } from 'react-toastify';
import {
  cancelAppointmentAPI,
  getAppointmentsPaginatedAPI,
  getPrescriptionAPI,
} from '../../services/appointmentServices';
import { showErrorToast } from '../../utils/errorHandler';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { NotifContext } from '../../context/NotificationContext';
import { updateItemInList } from '../../utils/stateHelper.util';
import Pagination from '../../components/common/Pagination';
import { slotDateFormat } from '../../utils/commonUtils';
import { downloadPrescriptionPDF } from '../../utils/downloadPrescription';
import { to12h } from '../../utils/slotManagementHelper';
dayjs.extend(customParseFormat);

const MyAppointments = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('MyAppointments must be within UserContext');
  const { token, userData } = context;
  const notificationContext = useContext(NotifContext);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'ended'>('all');

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  const fetchAppointments = async (pageToFetch = 1, filter?: 'all' | 'upcoming' | 'ended') => {
    const currentFilter = filter || filterType;
    try {
      const { data } = await getAppointmentsPaginatedAPI(pageToFetch, 5, currentFilter);

      if (data.success) {
        let appts = data.data;
        const now = dayjs();

        const activeApptIndex = appts.findIndex((a: any) => {
          const startDateTime = dayjs(`${a.slotDate} ${a.slotStartTime}`, 'YYYY-MM-DD HH:mm');
          const endDateTime = dayjs(`${a.slotDate} ${a.slotEndTime}`, 'YYYY-MM-DD HH:mm');
          return now.isAfter(startDateTime) && now.isBefore(endDateTime);
        });
        if (activeApptIndex > -1) {
          const [active] = appts.splice(activeApptIndex, 1);
          appts = [active, ...appts];
        }

        setAppointments(appts);
        setTotalPages(data.totalPages);
        setPage(data.currentPage);
        setFilterType(currentFilter);
      }
    } catch (err) {
      showErrorToast(err);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const { data } = await cancelAppointmentAPI(id);
      if (data.success) {
        toast.success(data.message);
        setAppointments((prev) => updateItemInList(prev, id, { cancelled: true }));
      } else toast.error(data.message);
    } catch (err) {
      showErrorToast(err);
    }
  };

  const fetchPrescription = async (appointmentId: string) => {
    try {
      if (!token) throw new Error('Unauthorized');

      const { data } = await getPrescriptionAPI(appointmentId);

      if (data.success && data.data) {
        if (!data.data.appointmentId) {
          toast.error('Prescription data is incomplete.');
          return;
        }

        downloadPrescriptionPDF(data.data);
      } else {
        toast.info('No prescription added yet.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch prescription.');
    }
  };

  useEffect(() => {
    fetchAppointments(page);
  }, [token]);

  const handlePageChange = (newPage: number) => {
    fetchAppointments(newPage, filterType);
  };

  const hasAppointmentStarted = (slotDate: string, slotStartTime: string) => {
    const startDateTime = dayjs(`${slotDate} ${slotStartTime}`, 'YYYY-MM-DD HH:mm');
    return dayjs().isAfter(startDateTime);
  };

  const isSessionEnded = (slotDate: string, slotEndTime: string) => {
    const endDateTime = dayjs(`${slotDate} ${slotEndTime}`, 'YYYY-MM-DD HH:mm');
    return dayjs().isAfter(endDateTime.add(24, 'hour'));
  };

  const btn = 'text-sm sm:min-w-48 py-2 border rounded transition-transform hover:-translate-y-0.5';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 md:px-10 py-12 md:py-24">
      <h1 className="pb-4 mb-8 text-2xl md:text-3xl font-bold border-b border-white/10">
        My Appointments
      </h1>

      <div className="flex gap-2 mb-4">
        {['all', 'upcoming', 'ended'].map((type) => (
          <button
            key={type}
            onClick={() => fetchAppointments(1, type as 'all' | 'upcoming' | 'ended')}
            className={`px-3 py-1 rounded ${
              filterType === type ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* <div className="flex items-center justify-between mb-6">
        <DateFilter value={dateRange} onChange={setDateRange} />
      </div> */}

      {appointments.map((a) => (
        <div
          key={a._id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 sm:gap-4 py-6 border-b border-white/5"
        >
          {/* Doctor Image */}
          <img
            src={a.docData.image}
            className="w-28 h-28 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover ring-1 ring-white/10 rounded-xl mx-auto sm:mx-0"
          />

          {/* Doctor Details */}
          <div className="flex-1 text-center sm:text-left text-sm sm:text-base space-y-1">
            <p className="text-slate-100 font-semibold text-lg sm:text-base md:text-lg">
              {a.docData.name}
            </p>
            <p className="text-slate-300">{a.docData.speciality}</p>

            <p className="text-xs sm:text-sm">
              <span className="font-medium">Address:</span> {a.docData.address.line1},{' '}
              {a.docData.address.line2}
            </p>

            <p className="text-xs sm:text-sm">
              <span className="font-medium">Date & Time:</span> {slotDateFormat(a.slotDate)} |{' '}
              {to12h(a.slotStartTime)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            {!a.cancelled &&
              a.payment &&
              a.isConfirmed &&
              (isSessionEnded(a.slotDate, a.slotEndTime) ? (
                <button
                  disabled
                  className={`${btn} bg-gray-600 text-white cursor-not-allowed w-full sm:w-auto`}
                >
                  Session Ended
                </button>
              ) : (
                <button
                  onClick={() =>
                    navigate(`/consultation/${a.docData._id}/${a._id}`, {
                      state: { slotDate: a.slotDate, slotEndTime: a.slotEndTime },
                    })
                  }
                  className={`${btn} bg-gradient-to-r from-cyan-500 to-blue-600 text-white relative w-full sm:w-auto`}
                >
                  Go to Consultation
                  {notificationContext?.unread?.[`${userData!._id}_${a.docData._id}`] > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 bg-red-500 text-xs rounded-full flex items-center justify-center">
                      {notificationContext.unread[`${userData!._id}_${a.docData._id}`]}
                    </span>
                  )}
                </button>
              ))}

            {!a.cancelled && a.payment && !a.isConfirmed && (
              <div className="bg-yellow-400/10 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-400/40 animate-pulse text-center w-full sm:w-auto">
                ⏳ Payment received – awaiting doctor
              </div>
            )}

            {/* Cancel Appointment */}
            {!a.cancelled && !hasAppointmentStarted(a.slotDate, a.slotStartTime) && (
              <button
                onClick={() => cancelAppointment(a._id)}
                className={`${btn} border-red-500 text-red-400 hover:bg-red-500 hover:text-white w-full sm:w-auto`}
              >
                Cancel Appointment
              </button>
            )}

            {/* Download Prescription */}
            {!a.cancelled && isSessionEnded(a.slotDate, a.slotEndTime) && (
              <button
                onClick={() => fetchPrescription(a._id)}
                className={`${btn} border-green-500 text-green-400 hover:bg-green-500 hover:text-white w-full sm:w-auto`}
              >
                Download Prescription
              </button>
            )}

            {/* Appointment Cancelled */}
            {a.cancelled && (
              <span className="border border-red-500 text-red-400 text-xs py-1 px-3 rounded w-full sm:w-auto text-center sm:text-left">
                Appointment Cancelled
              </span>
            )}

            {/* View Details */}
            <button
              onClick={() => navigate(`/appointment-details/${a._id}`)}
              className={`${btn} border-blue-800 text-slate-300 hover:bg-slate-700 w-full sm:w-auto`}
            >
              View Details
            </button>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default MyAppointments;
