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
dayjs.extend(customParseFormat);

const to12h = (t: string) => dayjs(t, 'HH:mm').format('hh:mm A').toLowerCase();

const MyAppointments = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('MyAppointments must be within UserContext');
  const { token, userData } = ctx;
  const notif = useContext(NotifContext);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const nav = useNavigate();

  if (!token) {
    toast.error('Please login to continue…');
    return null;
  }

  const fetchAppointments = async (pageToFetch = 1) => {
    try {
      const { data } = await getAppointmentsPaginatedAPI(token, pageToFetch);
      if (data.success) {
        setAppointments(data.data);
        setTotalPages(data.totalPages);
        setPage(data.currentPage);
      }
    } catch (err) {
      showErrorToast(err);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const { data } = await cancelAppointmentAPI(id, token);
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

      const { data } = await getPrescriptionAPI(appointmentId, token);
      if (data.success) {
        console.log(data);
        // setSelectedPrescription(data.data.prescription);
        // setShowPrescription(true);
        downloadPrescriptionPDF(data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAppointments(page);
  }, [token]);

  const handlePageChange = (newPage: number) => {
    fetchAppointments(newPage);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 md:px-10 py-24">
      <h1 className="pb-4 mb-8 text-2xl font-bold border-b border-white/10">My Appointments</h1>

      {appointments.map((a) => (
        <div
          key={a._id}
          className={'grid grid-cols-[auto_1fr_auto] gap-4 md:gap-6 py-6 border-b border-white/5'}
        >
          <img
            src={a.docData.image}
            className="w-28 h-28 object-cover ring-1 ring-white/10 rounded-xl"
          />

          <div className="text-sm text-slate-300 space-y-1">
            <p className="text-slate-100 font-semibold">{a.docData.name}</p>
            <p>{a.docData.speciality}</p>

            <p className="text-xs">
              <span className="font-medium">Address:</span> {a.docData.address.line1},{' '}
              {a.docData.address.line2}
            </p>

            <p className="text-xs">
              <span className="font-medium">Date & Time:</span> {slotDateFormat(a.slotDate)} |{' '}
              {to12h(a.slotStartTime)}
            </p>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {!a.cancelled &&
              a.payment &&
              a.isConfirmed &&
              (isSessionEnded(a.slotDate, a.slotEndTime) ? (
                <button disabled className={`${btn} bg-gray-600 text-white cursor-not-allowed`}>
                  Session Ended
                </button>
              ) : (
                <button
                  onClick={() =>
                    nav(`/consultation/${a.docData._id}/${a._id}`, {
                      state: {
                        slotDate: a.slotDate,
                        slotEndTime: a.slotEndTime,
                      },
                    })
                  }
                  className={`${btn} bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white relative`}
                >
                  Go to Consultation
                  {notif?.unread?.[`${userData!._id}_${a.docData._id}`] > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 bg-red-500 text-xs rounded-full flex items-center justify-center">
                      {notif.unread[`${userData!._id}_${a.docData._id}`]}
                    </span>
                  )}
                </button>
              ))}

            {!a.cancelled && a.payment && !a.isConfirmed && (
              <div className="bg-yellow-400/10 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-400/40 animate-pulse text-center">
                ⏳ Payment received – awaiting doctor
              </div>
            )}

            {!a.cancelled ? (
              hasAppointmentStarted(a.slotDate, a.slotStartTime) ? (
                <button
                  onClick={() => {
                    fetchPrescription(a._id);
                  }}
                  className={`${btn} border-green-500 text-green-400 hover:bg-green-500 hover:text-white`}
                >
                  Download Prescription
                </button>
              ) : (
                <button
                  onClick={() => cancelAppointment(a._id)}
                  className={`${btn} border-red-500 text-red-400 hover:bg-red-500 hover:text-white`}
                >
                  Cancel appointment
                </button>
              )
            ) : (
              <span className="border border-red-500 text-red-400 text-xs py-1 px-3 rounded">
                Appointment Cancelled
              </span>
            )}
          </div>
        </div>
      ))}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}

      {/* {showPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto mx-4 border border-white/10 bg-slate-900">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/10 px-3 py-1 rounded-full">
                <span className="text-slate-100 text-xs font-medium flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  PRESCRIPTION
                </span>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-slate-200 leading-relaxed">
                {selectedPrescription || 'No prescription available.'}
              </p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setSelectedPrescription('');
                  setShowPrescription(false);
                }}
                className="px-3 py-1 rounded-full bg-white/10 text-slate-100 hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default MyAppointments;
