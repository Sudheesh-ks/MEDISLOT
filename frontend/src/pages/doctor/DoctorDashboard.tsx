// import { useContext, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { DoctorContext } from '../../context/DoctorContext';
// import { AdminContext } from '../../context/AdminContext';
// import { assets } from '../../assets/admin/assets';
// import type { AppointmentTypes } from '../../types/appointment';
// import { motion } from 'framer-motion';
// import { slotDateFormat } from '../../utils/commonUtils';

const DoctorDashboard = () => {
  // const nav = useNavigate();
  // const ctx = useContext(DoctorContext);
  // const adm = useContext(AdminContext);

  // if (!ctx || !adm) throw new Error('context missing');

  // // const { dToken, cancelAppointment, profileData } = ctx;
  // // const { dashData, getDashData } = adm;

  // useEffect(() => {
  //   // if (dToken) getDashData();
  // }, [dToken]);
  // useEffect(() => {
  //   if (!dToken) nav('/doctor/login');
  // }, [dToken]);

  // if (profileData?.status === 'pending')
  //   return (
  //     <div className="m-5 text-center bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 text-yellow-200 shadow-md">
  //       <h2 className="text-xl font-semibold mb-2">⏳ Awaiting Approval</h2>
  //       <p>Your registration is under review. The admin has not approved your account yet.</p>
  //     </div>
  //   );

  // if (profileData?.status === 'rejected')
  //   return (
  //     <div className="m-5 text-center bg-red-900/30 border border-red-600 rounded-xl p-6 text-red-300 shadow-md">
  //       <h2 className="text-xl font-semibold mb-2">❌ Registration Rejected</h2>
  //       <p>Please contact support for clarification.</p>
  //     </div>
  //   );

  // if (profileData?.status !== 'approved') return null;

  // const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';

  return (
    <div>
      <h1>Doctor Dashboard</h1>
    </div>
    //   // dashData && (
    //   //   <div className="m-5 space-y-10 text-slate-100">
    //   //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    //   //       {[
    //   //         {
    //   //           count: `₹${dashData.totalEarnings}`,
    //   //           label: 'Total Earnings',
    //   //           icon: assets.earning_icon,
    //   //           grad: 'from-yellow-400 to-orange-500',
    //   //           path: '/doctor/earnings',
    //   //         },
    //   //         {
    //   //           count: dashData.appointments,
    //   //           label: 'Appointments',
    //   //           icon: assets.appointments_icon,
    //   //           grad: 'from-cyan-500 to-indigo-500',
    //   //           path: '/doctor/appointments',
    //   //         },
    //   //         {
    //   //           count: dashData.upcomingAppointments || 0,
    //   //           label: 'Patients',
    //   //           icon: assets.patients_icon,
    //   //           grad: 'from-emerald-400 to-teal-500',
    //   //           path: '/doctor/appointments',
    //   //         },
    //   //       ].map((card, i) => (
    //   //         <motion.div
    //   //           key={i}
    //   //           whileHover={{ scale: 1.05 }}
    //   //           transition={{ type: 'spring', stiffness: 300 }}
    //   //           onClick={() => nav(card.path)}
    //   //           className={`cursor-pointer bg-gradient-to-r ${card.grad} p-6 rounded-xl shadow-lg flex items-center gap-4`}
    //   //         >
    //   //           <img src={card.icon} className="w-12 h-12" />
    //   //           <div>
    //   //             <p className="text-2xl font-bold">{card.count}</p>
    //   //             <p className="text-sm opacity-80">{card.label}</p>
    //   //           </div>
    //   //         </motion.div>
    //   //       ))}
    //   //     </div>

    //   //     <div className={`${glass} rounded-xl overflow-hidden`}>
    //   //       <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/10">
    //   //         <img src={assets.list_icon} className="w-6" />
    //   //         <p className="font-semibold text-lg">Recent Appointments</p>
    //   //       </div>

    //   //       <div className="divide-y divide-white/10">
    //   //         {dashData.latestAppointments.map((a: AppointmentTypes, i: number) => (
    //   //           <motion.div
    //   //             key={i}
    //   //             initial={{ opacity: 0, y: 10 }}
    //   //             animate={{ opacity: 1, y: 0 }}
    //   //             transition={{ delay: i * 0.1 }}
    //   //             className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors"
    //   //           >
    //   //             <img src={a.userData.image} className="w-10 h-10 rounded-full" />
    //   //             <div className="flex-1 text-sm">
    //   //               <p className="font-semibold">{a.userData.name}</p>
    //   //               <p className="text-slate-400 text-xs">{slotDateFormat(a.slotDate)}</p>
    //   //             </div>
    //   //             {a.cancelled ? (
    //   //               <p className="text-red-400 text-sm font-semibold">Cancelled</p>
    //   //             ) : (
    //   //               <img
    //   //                 src={assets.cancel_icon}
    //   //                 onClick={() => cancelAppointment(a._id!)}
    //   //                 className="w-6 cursor-pointer hover:scale-110 transition-transform"
    //   //               />
    //   //             )}
    //   //           </motion.div>
    //   //         ))}
    //   //       </div>
    //   //     </div>
    //   //   </div>
    //   // )
  );
};

export default DoctorDashboard;
