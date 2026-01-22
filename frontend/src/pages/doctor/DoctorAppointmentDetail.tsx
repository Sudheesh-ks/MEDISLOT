import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getDoctorAppointmentByIdAPI } from '../../services/appointmentServices';
import { showErrorToast } from '../../utils/errorHandler';
import type { AppointmentTypes } from '../../types/appointment.d';

const DoctorAppointmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState<AppointmentTypes | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                if (!id) return;
                const data = await getDoctorAppointmentByIdAPI(id);
                setAppointment(data);
            } catch (error) {
                showErrorToast(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointment();
    }, [id]);

    if (loading) {
        return <div className="p-8 text-center text-white">Loading...</div>;
    }

    if (!appointment) {
        return <div className="p-8 text-center text-red-500">Appointment not found</div>;
    }

    const { patientDetails, slotDate, slotStartTime, slotEndTime, cancelled, payment, amount, userData } = appointment;

    return (
        <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
            >
                &larr; Back
            </button>

            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-white/10">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-5">
                    <h2 className="text-2xl font-bold text-white">Appointment Details</h2>
                    <p className="text-cyan-100 text-sm mt-1 opacity-80">Ref: {appointment._id}</p>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Patient Details Section */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-cyan-500/10 rounded-lg">👤</span>
                                Patient Information
                            </h3>
                            <div className="space-y-3 bg-white/5 p-5 rounded-xl border border-white/5">
                                <p><span className="text-slate-400 text-sm block">Name</span> <span className="font-medium text-lg">{patientDetails?.name}</span></p>
                                <div className="grid grid-cols-2 gap-4">
                                    <p><span className="text-slate-400 text-sm block">Age</span> <span className="font-medium">{patientDetails?.age} years</span></p>
                                    <p><span className="text-slate-400 text-sm block">Gender</span> <span className="font-medium">{patientDetails?.gender}</span></p>
                                </div>
                                <p><span className="text-slate-400 text-sm block">Problem Description</span> <span className="text-slate-200">{patientDetails?.problemDescription}</span></p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Vitals</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-slate-500 uppercase block">Blood Pressure</span>
                                    <span className="text-cyan-300 font-mono">{patientDetails?.vitals?.bloodPressure || '--/--'}</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-slate-500 uppercase block">Temperature</span>
                                    <span className="text-orange-300 font-mono">{patientDetails?.vitals?.temperature || '--'} °F</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-slate-500 uppercase block">Heart Rate</span>
                                    <span className="text-rose-300 font-mono">{patientDetails?.vitals?.heartRate || '--'} BPM</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-[10px] text-slate-500 uppercase block">Weight</span>
                                    <span className="text-emerald-300 font-mono">{patientDetails?.weight || '--'} kg</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Info Section */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-blue-500/10 rounded-lg">📅</span>
                                Booking Information
                            </h3>
                            <div className="space-y-4 bg-white/5 p-5 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-slate-400">Date</span>
                                    <span className="font-medium">{dayjs(slotDate).format('MMMM D, YYYY')}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-slate-400">Time Window</span>
                                    <span className="font-medium text-blue-300">{slotStartTime} - {slotEndTime}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-slate-400">Status</span>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${cancelled ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                        appointment.isCompleted || dayjs().isAfter(dayjs(`${slotDate} ${slotEndTime}`, 'YYYY-MM-DD HH:mm')) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                                            'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'
                                        }`}>
                                        {cancelled ? 'Cancelled' : (appointment.isCompleted || dayjs().isAfter(dayjs(`${slotDate} ${slotEndTime}`, 'YYYY-MM-DD HH:mm'))) ? 'Session Ended' : 'Upcoming'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-400">Payment</span>
                                    <div className="text-right">
                                        <span className="font-bold text-lg">₹{amount}</span>
                                        <span className={`block text-[10px] ${payment ? 'text-emerald-400' : 'text-orange-400'}`}>
                                            {payment ? '✓ Paid via Razorpay' : '⚠ Payment Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Booked By</h3>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                {userData?.image ? (
                                    <img src={userData.image} alt={userData.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                                        {userData?.name?.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-slate-100">{userData?.name}</p>
                                    <p className="text-sm text-slate-400">{userData?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorAppointmentDetail;
