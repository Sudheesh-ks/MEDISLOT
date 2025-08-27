import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';
import {
  createPatientHistoryAPI,
  getPatientDetailsAPI,
  getPatientHistoriesByPatientAPI,
  getPatientHistoryByIdAPI,
  updatePatientHistoryAPI,
} from '../../services/doctorServices';
import type { PatientHistoryTypes } from '../../types/patientHistoryTypes';

const PatientHistoryPage = () => {
  const { userId, appointmentId } = useParams();

  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'add' | 'edit'>('overview');

  const [patientData, setPatientData] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const [historyData, setHistoryData] = useState<PatientHistoryTypes>({
    date: '',
    time: '',
    type: 'Regular Checkup',
    chiefComplaint: '',
    symptoms: [] as string[],
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      oxygenSaturation: '',
    },
    diagnosis: '',
    doctorNotes: '',
    prescription: [] as {
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }[],
  });

  // 🔹 Fetch histories (and optionally patient details if available later)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyRes = await getPatientHistoriesByPatientAPI(userId!);
        setSessions(historyRes.data.histories || []);
        // If you have getPatientDetailsAPI, set patientData here
        const patientRes = await getPatientDetailsAPI(userId!);
        setPatientData(patientRes.data.patient);
      } catch (err) {
        showErrorToast(err);
      }
    };
    fetchData();
  }, [userId]);

  // Form handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name in historyData.vitals) {
      setHistoryData((prev) => ({
        ...prev,
        vitals: { ...prev.vitals, [name]: value },
      }));
    } else {
      setHistoryData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSymptomsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.split(',').map((s) => s.trim());
    setHistoryData((prev) => ({ ...prev, symptoms: value }));
  };

  const addPrescription = () => {
    setHistoryData((prev) => ({
      ...prev,
      prescription: [
        ...prev.prescription,
        {
          medication: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ],
    }));
  };

  const handlePrescriptionChange = (
    index: number,
    field: keyof (typeof historyData)['prescription'][0],
    value: string
  ) => {
    const newPrescriptions = [...historyData.prescription];
    newPrescriptions[index][field] = value;
    setHistoryData((prev) => ({ ...prev, prescription: newPrescriptions }));
  };

  const handleSubmit = async () => {
    try {
      const res = await createPatientHistoryAPI(userId!, appointmentId!, historyData);
      toast.success('Patient history added successfully');

      // Add new session immediately to list
      setSessions((prev) => [res.data, ...prev]);

      // Reset form + switch tab
      setHistoryData({
        date: '',
        time: '',
        type: 'Regular Checkup',
        chiefComplaint: '',
        symptoms: [],
        vitals: {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          weight: '',
          height: '',
          oxygenSaturation: '',
        },
        diagnosis: '',
        doctorNotes: '',
        prescription: [],
      });

      setActiveTab('sessions');
    } catch (err) {
      showErrorToast(err);
    }
  };


  const handleUpdate = async () => {
    try {
      if (!historyData._id) {
        toast.error("No session selected to update");
        return;
      }

      const res = await updatePatientHistoryAPI(historyData._id, historyData);
      toast.success("Session updated successfully");

      // update session list
      setSessions((prev) =>
        prev.map((s) => (s._id === historyData._id ? res.data.history : s))
      );

      setActiveTab("sessions");
    } catch (err) {
      showErrorToast(err);
    }
  };


  useEffect(() => {
    const fetchSessionDetail = async () => {
      if (!selectedSession?._id) return;
      try {
        const res = await getPatientHistoryByIdAPI(selectedSession._id);
        setSelectedSession((prev: any) => ({
          ...prev, // keep the original session with _id
          ...res.data.history, // merge in the detailed data
        }));
      } catch (error) {
        showErrorToast(error);
      }
    };
    fetchSessionDetail();
  }, [selectedSession?._id]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl">
                👨‍⚕️
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Patient History</h1>
                <p className="text-slate-400">Comprehensive medical record management</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('add')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              + New Session
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar */}
          {patientData && (
            <div className="xl:col-span-1 space-y-6">
              {/* Patient card */}
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                    <img
                      src={patientData.image}
                      alt={patientData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-semibold">{patientData.name}</h3>
                  {/* <p className="text-slate-400">ID: {patientData._id}</p> */}
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">DOB:</span>
                    <span>{patientData.dob}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gender:</span>
                    <span>{patientData.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Address:</span>
                    <span className="text-red-400 font-medium">
                      {patientData.address?.line1}, <br />
                      {patientData.address?.line2}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span>{patientData.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="xl:col-span-3">
            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-slate-900/30 p-1 rounded-xl border border-slate-800">
              {['overview', 'sessions', 'add'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  {tab === 'overview'
                    ? 'Session Overview'
                    : tab === 'sessions'
                      ? 'All Sessions'
                      : 'Add New Session'}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                <h3 className="text-xl font-semibold mb-6 text-blue-400">Recent Sessions</h3>
                {sessions.length === 0 ? (
                  <p className="text-slate-400">No sessions yet.</p>
                ) : (
                  sessions.slice(0, 2).map((s) => (
                    <div
                      key={s._id}
                      className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer mb-4"
                      onClick={() => setSelectedSession(s)}
                    >
                      <h4 className="font-semibold">Session on {formatDate(s.date)}</h4>
                      <p className="text-sm text-slate-400">{s.chiefComplaint}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sessions */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                {sessions.map((s) => (
                  <div
                    key={s._id}
                    className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800"
                    onClick={() => setSelectedSession(s)}
                  >
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">
                      {formatDate(s.date)} – {s.type}
                    </h3>
                    <p className="text-slate-300">{s.diagnosis}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add New */}
            {activeTab === 'add' && (
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 space-y-6">
                <h3 className="text-xl font-semibold mb-6 text-blue-400">
                  Add New Session – #{sessions.length + 1}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="date"
                    value={historyData.date}
                    onChange={handleChange}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  />
                  <input
                    type="time"
                    name="time"
                    value={historyData.time}
                    onChange={handleChange}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  />
                  <select
                    name="type"
                    value={historyData.type}
                    onChange={handleChange}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 col-span-2"
                  >
                    <option>Regular Checkup</option>
                    <option>Follow-up</option>
                    <option>Emergency</option>
                  </select>
                </div>

                <textarea
                  name="chiefComplaint"
                  placeholder="Chief Complaint"
                  value={historyData.chiefComplaint}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="Symptoms (comma separated)"
                  value={historyData.symptoms.join(', ')}
                  onChange={handleSymptomsChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />

                <textarea
                  name="diagnosis"
                  placeholder="Diagnosis"
                  value={historyData.diagnosis}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />

                <textarea
                  name="doctorNotes"
                  placeholder="Doctor Notes"
                  value={historyData.doctorNotes}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />

                {/* Vitals Section */}
                <div className="space-y-2">
                  <h4 className="text-cyan-400 font-semibold">Vitals</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { name: 'bloodPressure', label: 'Blood Pressure' },
                        { name: 'heartRate', label: 'Heart Rate' },
                        { name: 'temperature', label: 'Temperature' },
                        { name: 'weight', label: 'Weight' },
                        { name: 'height', label: 'Height' },
                        { name: 'oxygenSaturation', label: 'O₂ Saturation' },
                      ] as const
                    ).map(({ name, label }) => (
                      <div key={name} className="flex flex-col">
                        <label className="text-sm text-slate-400 mb-1">{label}</label>
                        <input
                          type="text"
                          name={name}
                          value={(historyData.vitals as any)[name]}
                          onChange={handleChange}
                          className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prescription */}
                <div className="space-y-2">
                  <h4 className="text-purple-400 font-semibold">Prescription</h4>
                  {historyData.prescription.map((p, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2">
                      {(
                        ['medication', 'dosage', 'frequency', 'duration', 'instructions'] as const
                      ).map((field) => (
                        <input
                          key={field}
                          type="text"
                          placeholder={field}
                          value={p[field]}
                          onChange={(e) => handlePrescriptionChange(idx, field, e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                        />
                      ))}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPrescription}
                    className="bg-green-600 text-white rounded px-3 py-1"
                  >
                    + Add Medicine
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg"
                >
                  Save Session
                </button>
              </div>
            )}


            {activeTab === "edit" && (
  <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 space-y-6">
    <h3 className="text-xl font-semibold mb-6 text-blue-400">
      Edit Session
    </h3>

    {/* 🔹 Reuse the same form inputs as in Add New */}
    {/* Just reusing all your input/textarea code here, but with historyData prefilled */}

    <div className="grid grid-cols-2 gap-4">
      <input
        type="date"
        name="date"
        value={historyData.date?.substring(0, 10) || ""}
        onChange={handleChange}
        className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
      />
      <input
        type="time"
        name="time"
        value={historyData.time}
        onChange={handleChange}
        className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
      />
      <select
        name="type"
        value={historyData.type}
        onChange={handleChange}
        className="bg-slate-800 border border-slate-700 rounded px-3 py-2 col-span-2"
      >
        <option>Regular Checkup</option>
        <option>Follow-up</option>
        <option>Emergency</option>
      </select>
    </div>

    <textarea
                  name="chiefComplaint"
                  placeholder="Chief Complaint"
                  value={historyData.chiefComplaint}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="Symptoms (comma separated)"
                  value={historyData.symptoms.join(', ')}
                  onChange={handleSymptomsChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />

                <textarea
                  name="diagnosis"
                  placeholder="Diagnosis"
                  value={historyData.diagnosis}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />

                <textarea
                  name="doctorNotes"
                  placeholder="Doctor Notes"
                  value={historyData.doctorNotes}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />

                {/* Vitals Section */}
                <div className="space-y-2">
                  <h4 className="text-cyan-400 font-semibold">Vitals</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { name: 'bloodPressure', label: 'Blood Pressure' },
                        { name: 'heartRate', label: 'Heart Rate' },
                        { name: 'temperature', label: 'Temperature' },
                        { name: 'weight', label: 'Weight' },
                        { name: 'height', label: 'Height' },
                        { name: 'oxygenSaturation', label: 'O₂ Saturation' },
                      ] as const
                    ).map(({ name, label }) => (
                      <div key={name} className="flex flex-col">
                        <label className="text-sm text-slate-400 mb-1">{label}</label>
                        <input
                          type="text"
                          name={name}
                          value={(historyData.vitals as any)[name]}
                          onChange={handleChange}
                          className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prescription */}
                <div className="space-y-2">
                  <h4 className="text-purple-400 font-semibold">Prescription</h4>
                  {historyData.prescription.map((p, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2">
                      {(
                        ['medication', 'dosage', 'frequency', 'duration', 'instructions'] as const
                      ).map((field) => (
                        <input
                          key={field}
                          type="text"
                          placeholder={field}
                          value={p[field]}
                          onChange={(e) => handlePrescriptionChange(idx, field, e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                        />
                      ))}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPrescription}
                    className="bg-green-600 text-white rounded px-3 py-1"
                  >
                    + Add Medicine
                  </button>
                </div>


    <button
      onClick={handleUpdate}
      className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg"
    >
      Save Changes
    </button>
  </div>
)}

          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-3xl w-full mx-4 p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              Session on {formatDate(selectedSession.date)} ({selectedSession.type})
            </h3>

            <p className="text-slate-300 mb-2">
              <strong>Chief Complaint:</strong> {selectedSession.chiefComplaint}
            </p>
            <p className="text-slate-300 mb-2">
              <strong>Symptoms:</strong> {selectedSession.symptoms?.join(', ') || 'N/A'}
            </p>
            <p className="text-slate-300 mb-2">
              <strong>Diagnosis:</strong> {selectedSession.diagnosis}
            </p>
            <p className="text-slate-300 mb-2">
              <strong>Doctor Notes:</strong> {selectedSession.doctorNotes || '—'}
            </p>

            {/* Prescription */}
            {selectedSession.prescription?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-purple-400 font-semibold mb-2">Prescription</h4>
                <ul className="list-disc pl-6 space-y-1 text-slate-300">
                  {selectedSession.prescription.map((p: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-medium">{p.medication}</span> – {p.dosage},{' '}
                      {p.frequency}, {p.duration} ({p.instructions})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vitals */}
            {selectedSession.vitals && (
              <div className="mt-4">
                <h4 className="text-cyan-400 font-semibold mb-2">Vitals</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  {Object.entries(selectedSession.vitals).map(([k, v]) => (
                    <div key={k}>
                      <strong>{k}:</strong> {v ? String(v) : '—'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
  onClick={() => {
    setHistoryData(selectedSession); // prefill form with existing data
    setActiveTab("edit"); // switch to edit mode
    setSelectedSession(null); // close modal
  }}
  className="absolute top-4 right-16 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
>
  ✎ Edit
</button>

          </div>
        </div>
      )}  
    </main>
  );
};

export default PatientHistoryPage;
