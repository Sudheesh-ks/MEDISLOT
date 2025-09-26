import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';

const AdminDoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const adminContext = useContext(AdminContext);
  if (!adminContext) throw new Error('AdminContext missing');

  const { aToken, getDoctorById, approveDoctor, rejectDoctor } = adminContext;

  const [doctor, setDoctor] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (id) fetchDoctor();
  }, [id]);

  useEffect(() => {
    if (!aToken) navigate('/admin/login');
  }, [aToken]);

  const fetchDoctor = async () => {
    try {
      const doctor = await getDoctorById(id!);
      setDoctor(doctor);
    } catch (err) {
      console.error('Failed to fetch doctor', err);
    }
  };

  const doctorApprove = async () => {
    await approveDoctor(id!);
    navigate('/admin/doctor-requests');
  };

  const doctorReject = async () => {
    if (!reason.trim()) return;
    await rejectDoctor(id!, reason);
    setShowModal(false);
    navigate('/admin/doctor-requests');
  };

  if (!doctor) return <div className="p-6 text-slate-400">Loading…</div>;

  const pill =
    'text-xs font-medium px-4 py-1.5 rounded-md shadow-lg hover:-translate-y-0.5 hover:scale-105 transition-all duration-300';

  return (
    <div className="p-6 text-slate-100 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{doctor.name}</h1>
      <img src={doctor.image} className="w-48 h-48 rounded-lg object-cover mb-6" />

      <div className="space-y-2 text-sm">
        <p>
          <b>Email:</b> {doctor.email}
        </p>
        <p>
          <b>Speciality:</b> {doctor.speciality}
        </p>
        <p>
          <b>Experience:</b> {doctor.experience}
        </p>
        <p>
          <b>Degree:</b> {doctor.degree}
        </p>
        <p>
          <b>Fees:</b> ₹{doctor.fees}
        </p>
        <p>
          <b>About:</b> {doctor.about}
        </p>
        <p>
          <b>Address:</b> {doctor.address?.line1}, {doctor.address?.line2}
        </p>
      </div>

      {/* Certificate download */}
      <div className="mt-4">
        <a
          href={doctor.certificate}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
        >
          View Certificate
        </a>
      </div>

      {/* Approve/Reject actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={doctorApprove}
          className={`${pill} bg-gradient-to-r from-emerald-500 to-emerald-600 text-white`}
        >
          Approve
        </button>
        <button
          onClick={() => setShowModal(true)}
          className={`${pill} bg-gradient-to-r from-red-500 to-red-600 text-white`}
        >
          Reject
        </button>
      </div>

      {/* Rejection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-slate-800 w-full max-w-md rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Reject Doctor</h3>

            <label className="block text-sm text-slate-300 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-slate-700 p-3 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="E.g. Invalid documents, incomplete profile…"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className={`${pill} bg-slate-600 text-slate-100`}
              >
                Cancel
              </button>
              <button
                onClick={doctorReject}
                disabled={!reason.trim()}
                className={`${pill} ${
                  reason.trim()
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    : 'bg-slate-500 opacity-60 cursor-not-allowed'
                }`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorDetail;
