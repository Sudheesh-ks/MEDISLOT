import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  cancelAppointmentAPI,
  getAppointmentByIdAPI,
  getPrescriptionAPI,
} from '../../services/appointmentServices';
import { UserContext } from '../../context/UserContext';
import { toast } from 'react-toastify';
import { downloadPrescriptionPDF } from '../../utils/downloadPrescription';
import { showErrorToast } from '../../utils/errorHandler';
import dayjs from 'dayjs';
import { slotDateFormat } from '../../utils/commonUtils';

const AppointmentDetail = () => {
  const { appointmentId } = useParams();
  const nav = useNavigate();
  const context = useContext(UserContext);
  if (!context) throw new Error('Must be within UserContext');
  const { token } = context;

  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      toast.error('Please login to continue…');
      nav('/login');
      return;
    }
    fetchAppointment();
  }, [appointmentId, token]);

  const fetchAppointment = async () => {
    try {
      console.log(appointmentId);
      const appointment = await getAppointmentByIdAPI(appointmentId!);

      if (appointment) {
        setAppointment(appointment);
      } else {
        toast.error('Failed to fetch appointment details');
      }
    } catch (err) {
      showErrorToast(err);
    }
  };

  const fetchPrescription = async () => {
    try {
      const { data } = await getPrescriptionAPI(appointmentId!, token!);
      if (data.success && data.data) {
        downloadPrescriptionPDF(data.data);
      } else {
        toast.info('No prescription added yet.');
      }
    } catch (err) {
      showErrorToast(err);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const { data } = await cancelAppointmentAPI(id, token!);
      if (data.success) {
        toast.success(data.message);
        setAppointment((prev: any) => ({
          ...prev,
          cancelled: true,
        }));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      showErrorToast(err);
    }
  };

  const hasAppointmentStarted = (slotDate: string, slotStartTime: string) => {
    const now = dayjs();
    const appointmentStart = dayjs(`${slotDate} ${slotStartTime}`, 'YYYY-MM-DD HH:mm');
    return now.isAfter(appointmentStart);
  };

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 md:px-12 py-24">
      <h1 className="text-3xl font-bold mb-10 text-center">Appointment Details</h1>

      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 shadow-xl space-y-6 max-w-3xl mx-auto">
        {/* Doctor Info */}
        <div className="flex items-center gap-6 pb-6 border-b border-slate-700">
          <img
            src={appointment.docData.image}
            alt={appointment.docData.name}
            className="w-28 h-28 object-cover rounded-xl ring-1 ring-white/10"
          />
          <div>
            <p className="text-2xl font-semibold">{appointment.docData.name}</p>
            <p className="text-slate-400">{appointment.docData.speciality}</p>
            <p className="text-sm mt-1">{appointment.docData.degree}</p>
            <p className="text-xs mt-2">
              {appointment.docData.address.line1}, {appointment.docData.address.line2}
            </p>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <p>
            <span className="font-medium">Date:</span> {slotDateFormat(appointment.slotDate)}
          </p>
          <p>
            <span className="font-medium">Time:</span>{' '}
            {dayjs(appointment.slotStartTime, 'HH:mm').format('hh:mm A')} -{' '}
            {dayjs(appointment.slotEndTime, 'HH:mm').format('hh:mm A')}
          </p>
          <p>
            <span className="font-medium">Status:</span>{' '}
            {appointment.cancelled
              ? 'Cancelled'
              : appointment.isCompleted
                ? 'Completed'
                : appointment.isConfirmed
                  ? 'Confirmed'
                  : 'Pending'}
          </p>
          <p>
            <span className="font-medium">Payment Status:</span>{' '}
            {appointment.payment ? 'Paid' : 'Unpaid'}
          </p>
          <p>
            <span className="font-medium">Amount:</span> ₹{appointment.amount}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-slate-700">
          <button
            onClick={() => nav(-1)}
            className="px-4 py-2 border rounded-lg border-slate-500 hover:bg-slate-700"
          >
            Back
          </button>

          {!appointment.cancelled && (
            <>
              {!hasAppointmentStarted(appointment.slotDate, appointment.slotStartTime) ? (
                <button
                  onClick={() => cancelAppointment(appointment._id)}
                  className="px-4 py-2 border rounded-lg border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  Cancel Appointment
                </button>
              ) : (
                <button
                  onClick={fetchPrescription}
                  className="px-4 py-2 border rounded-lg border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                >
                  Download Prescription
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
