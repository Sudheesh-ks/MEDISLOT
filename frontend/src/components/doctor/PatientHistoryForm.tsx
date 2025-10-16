import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';
import { createPatientHistoryAPI } from '../../services/doctorServices';
import type { PatientHistoryTypes } from '../../types/patientHistoryTypes';
import {
  isValidChiefComplaint,
  isValidDate,
  isValidDiagnosis,
  isValidDoctorNotes,
  isValidPrescriptionField,
  isValidSymptom,
  isValidTime,
  isValidVitalField,
} from '../../utils/validator';

interface PatientHistoryFormProps {
  patientId: string;
  appointmentId: string;
  onClose?: () => void;
  onAdded?: (newHistory: any) => void;
}

const PatientHistoryForm: React.FC<PatientHistoryFormProps> = ({
  patientId,
  appointmentId,
  onClose,
  onAdded,
}) => {
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
    prescription: [],
  });

  const validatePatientHistory = (data: any): boolean => {
    if (!isValidDate(data.date)) {
      toast.error('Please provide a valid session date.');
      return false;
    }
    if (!isValidTime(data.time)) {
      toast.error('Please provide a valid session time.');
      return false;
    }
    if (!isValidChiefComplaint(data.chiefComplaint)) {
      toast.error('Chief complaint must be between 5–200 characters.');
      return false;
    }
    if (!isValidDiagnosis(data.diagnosis)) {
      toast.error('Diagnosis must be between 5–500 characters.');
      return false;
    }
    if (!isValidDoctorNotes(data.doctorNotes)) {
      toast.error('Doctor notes must be between 5–800 characters.');
      return false;
    }
    if (data.symptoms?.some((s: string) => !isValidSymptom(s))) {
      toast.error('Each symptom must be under 50 characters.');
      return false;
    }
    for (const med of data.prescription || []) {
      if (!isValidPrescriptionField(med.medication)) {
        toast.error('Medication name is too long (max 100 characters).');
        return false;
      }
      if (med.instructions && med.instructions.length > 200) {
        toast.error('Instructions are too long (max 200 characters).');
        return false;
      }
    }
    for (const [key, value] of Object.entries(data.vitals || {})) {
      if (value && !isValidVitalField(String(value))) {
        toast.error(`${key} value is too long (max 20 characters).`);
        return false;
      }
    }
    return true;
  };

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
        { medication: '', dosage: '', frequency: '', duration: '', instructions: '' },
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
    if (!validatePatientHistory(historyData)) return;
    try {
      const res = await createPatientHistoryAPI(patientId, appointmentId, historyData);
      toast.success('Patient history added successfully');
      onAdded?.(res.data);
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
      onClose?.();
    } catch (err) {
      showErrorToast(err);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 overflow-y-auto h-full text-slate-200">
      <h3 className="text-2xl font-bold mb-4 text-cyan-400">🩺 Add New Session</h3>

      {/* Date / Time / Type */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          name="date"
          value={historyData.date}
          onChange={handleChange}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500"
        />
        <input
          type="time"
          name="time"
          value={historyData.time}
          onChange={handleChange}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500"
        />
        <select
          name="type"
          value={historyData.type}
          onChange={handleChange}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 col-span-2 focus:ring-2 focus:ring-cyan-500"
        >
          <option>Regular Checkup</option>
          <option>Follow-up</option>
          <option>Emergency</option>
        </select>
      </div>

      {/* Complaints / Diagnosis / Notes */}
      <textarea
        name="chiefComplaint"
        placeholder="Chief Complaint"
        value={historyData.chiefComplaint}
        onChange={handleChange}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500"
      />
      <input
        type="text"
        placeholder="Symptoms (comma separated)"
        value={historyData.symptoms.join(', ')}
        onChange={handleSymptomsChange}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500"
      />
      <textarea
        name="diagnosis"
        placeholder="Diagnosis"
        value={historyData.diagnosis}
        onChange={handleChange}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500"
      />
      <textarea
        name="doctorNotes"
        placeholder="Doctor Notes"
        value={historyData.doctorNotes}
        onChange={handleChange}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500"
      />

      {/* Vitals */}
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
              <label className="text-xs text-slate-400 mb-1">{label}</label>
              <input
                type="text"
                name={name}
                value={(historyData.vitals as any)[name]}
                onChange={handleChange}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500"
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
            {(['medication', 'dosage', 'frequency', 'duration', 'instructions'] as const).map(
              (field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field}
                  value={p[field]}
                  onChange={(e) => handlePrescriptionChange(idx, field, e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500"
                />
              )
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addPrescription}
          className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-3 py-1 transition"
        >
          + Add Medicine
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-500 text-white transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl transition"
        >
          Save Session
        </button>
      </div>
    </div>
  );
};

export default PatientHistoryForm;
