import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { assets } from '../../assets/admin/assets';
import type { AppointmentTypes } from '../../types/appointment';
import { motion } from 'framer-motion';
import { updateItemInList } from '../../utils/stateHelper.util';
import { slotDateFormat } from '../../utils/commonUtils';

const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
const cardBase = 'cursor-pointer text-white p-6 rounded-xl shadow-md flex items-center gap-4';

const AdminDashboard = () => {
  const nav = useNavigate();
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('Missing contexts');

  const { aToken, dashData, getDashData, cancelAppointment } = ctx;
  const [latest, setLatest] = useState<any[]>([]);

  useEffect(() => {
    if (aToken) getDashData();
  }, [aToken]);

  useEffect(() => {
    if (!aToken) nav('/admin/login');
  });

  useEffect(() => {
    if (dashData?.latestAppointments) {
      setLatest(dashData.latestAppointments);
    }
  }, [dashData]);

  if (!dashData) return null;

  const stats = [
    {
      count: dashData.doctors,
      label: 'Doctors',
      icon: assets.doctor_icon,
      grad: 'from-cyan-500 to-fuchsia-600',
      path: '/admin/all-doctors',
    },
    {
      count: dashData.appointments,
      label: 'Appointments',
      icon: assets.appointments_icon,
      grad: 'from-emerald-500 to-teal-500',
      path: '/admin/appointments',
    },
    {
      count: dashData.patients,
      label: 'Patients',
      icon: assets.patients_icon,
      grad: 'from-indigo-500 to-violet-600',
      path: '/admin/user-management',
    },
  ];

  return (
    <div className="m-5 space-y-10 text-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => nav(c.path)}
            className={`${cardBase} bg-gradient-to-r ${c.grad}`}
          >
            <img src={c.icon} className="w-12 h-12" />
            <div>
              <p className="text-2xl font-bold">{c.count}</p>
              <p className="text-sm opacity-80">{c.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className={`${glass} rounded-xl overflow-hidden`}>
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/10">
          <img src={assets.list_icon} className="w-6" />
          <p className="font-semibold text-lg">Latest Bookings</p>
        </div>

        <div className="divide-y divide-white/10">
          {latest.map((it: AppointmentTypes, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-white/5"
            >
              <img
                src={it.docData.image}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
              />
              <div className="flex-1 text-sm">
                <p className="font-semibold">{it.docData.name}</p>
                <p className="text-slate-400 text-xs">{slotDateFormat(it.slotDate)}</p>
              </div>

              {it.cancelled ? (
                <span className="text-sm font-semibold text-red-400">Cancelled</span>
              ) : (
                <motion.img
                  whileTap={{ scale: 0.9 }}
                  src={assets.cancel_icon}
                  className="w-6 cursor-pointer hover:opacity-80"
                  onClick={async () => {
                    await cancelAppointment(it._id!);
                    setLatest((prev) => updateItemInList(prev, it._id!, { cancelled: true }));
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
