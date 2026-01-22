import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getAdminAppointmentByIdAPI } from '../../services/appointmentServices';
import { showErrorToast } from '../../utils/errorHandler';
import type { AppointmentTypes } from '../../types/appointment.d';

const AdminAppointmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState<AppointmentTypes | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                if (!id) return;
                const data = await getAdminAppointmentByIdAPI(id);
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

    const { patientDetails, slotDate, slotStartTime, slotEndTime, cancelled, payment, amount, userData, docData } = appointment;

    return (
        <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
            >
                &larr; Back
            </button>

            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-white/10">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-5">
                    <h2 className="text-2xl font-bold text-white">Appointment Details (Admin View)</h2>
                    <p className="text-purple-100 text-sm mt-1 opacity-80">Ref: {appointment._id}</p>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left Column: Patient & Booking */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-purple-500/10 rounded-lg">👤</span>
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
                            <h3 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-indigo-500/10 rounded-lg">📅</span>
                                Booking Information
                            </h3>
                            <div className="space-y-3 bg-white/5 p-5 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-slate-400">Date</span>
                                    <span className="font-medium">{dayjs(slotDate).format('MMMM D, YYYY')}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-slate-400">Time Slot</span>
                                    <span className="font-medium text-indigo-300">{slotStartTime} - {slotEndTime}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-400">Payment Amount</span>
                                    <span className="font-bold text-lg">₹{amount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Doctor, User & Status */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-300 mb-4">Entity Details</h3>
                            <div className="space-y-4">
                                {/* Doctor */}
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                    {docData?.image ? (
                                        <img src={docData.image} alt={docData.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/20" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                                            D
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Assigned Doctor</p>
                                        <p className="font-semibold text-slate-100">Dr. {docData?.name}</p>
                                        <p className="text-xs text-slate-400">{docData?.speciality}</p>
                                    </div>
                                </div>

                                {/* Booked By */}
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                    {userData?.image ? (
                                        <img src={userData.image} alt={userData.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                                            U
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Booked By (User)</p>
                                        <p className="font-semibold text-slate-100">{userData?.name}</p>
                                        <p className="text-xs text-slate-400">{userData?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Status Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${cancelled ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                    appointment.isCompleted || dayjs().isAfter(dayjs(`${slotDate} ${slotEndTime}`, 'YYYY-MM-DD HH:mm')) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                    }`}>
                                    <span className="text-[10px] uppercase font-bold mb-1 opacity-60">Appointment</span>
                                    <span className="font-bold">{cancelled ? 'Cancelled' : (appointment.isCompleted || dayjs().isAfter(dayjs(`${slotDate} ${slotEndTime}`, 'YYYY-MM-DD HH:mm'))) ? 'Session Ended' : 'Upcoming'}</span>
                                </div>
                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${payment ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                    }`}>
                                    <span className="text-[10px] uppercase font-bold mb-1 opacity-60">Payment</span>
                                    <span className="font-bold">{payment ? 'Paid' : 'Pending'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAppointmentDetail;
