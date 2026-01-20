import { useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { useContext } from 'react';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (patientDetails: any) => void;
    isLoading: boolean;
}

const BookingModal = ({ isOpen, onClose, onConfirm, isLoading }: BookingModalProps) => {
    const context = useContext(UserContext);
    if (!context) throw new Error('UserContext missing');
    const { userData } = context;

    const [useProfileDetails, setUseProfileDetails] = useState(false);
    const [details, setDetails] = useState({
        name: '',
        age: '',
        gender: 'Male',
        height: '',
        weight: '',
        problemDescription: '',
        vitals: {
            temperature: '',
            bloodPressure: '',
            heartRate: '',
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name in details.vitals) {
            setDetails((prev) => ({
                ...prev,
                vitals: { ...prev.vitals, [name]: value },
            }));
        } else {
            setDetails((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUseProfileDetails(e.target.checked);
        if (e.target.checked && userData) {
            // Calculate age from dob
            const age = new Date().getFullYear() - new Date(userData.dob).getFullYear();

            setDetails((prev) => ({
                ...prev,
                name: userData.name,
                age: age.toString(),
                gender: userData.gender,
            }));
        } else {
            // Reset or keep previous? Let's keep previous for now to avoid accidental data loss, or reset?
            // Let's not auto-reset, just stop auto-updating.
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ ...details, age: Number(details.age) });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Patient Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                        <input
                            type="checkbox"
                            id="useProfile"
                            checked={useProfileDetails}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-blue-600 rounded bg-gray-700 border-gray-600 focus:ring-blue-500"
                        />
                        <label htmlFor="useProfile" className="text-sm text-blue-200 cursor-pointer">
                            Book for myself (Use my profile details)
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={details.name}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Patient Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Age *</label>
                            <input
                                type="number"
                                name="age"
                                required
                                min="0"
                                max="120"
                                value={details.age}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Age"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Gender *</label>
                            <select
                                name="gender"
                                value={details.gender}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                            <input
                                type="text"
                                value={userData?.phone || ''}
                                disabled
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                            />
                            <p className='text-xs text-gray-500 mt-1'>Contact details are taken from your account.</p>
                        </div>
                    </div>

                    {/* Physical Stats - Optional */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Height (cm)</label>
                            <input
                                type="number"
                                name="height"
                                value={details.height}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Optional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                value={details.weight}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    {/* Problem Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Problem Description / Reason for Visit *</label>
                        <textarea
                            name="problemDescription"
                            required
                            rows={3}
                            value={details.problemDescription}
                            onChange={handleChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            placeholder="Describe the symptoms or reason for appointment..."
                        ></textarea>
                    </div>

                    {/* Vitals - Optional */}
                    <div className='border-t border-gray-700 pt-4'>
                        <h3 className='text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide'>Current Vitals (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Temperature (°F)</label>
                                <input
                                    type="text"
                                    name="temperature"
                                    value={details.vitals.temperature}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. 98.6"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Blood Pressure</label>
                                <input
                                    type="text"
                                    name="bloodPressure"
                                    value={details.vitals.bloodPressure}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. 120/80"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Heart Rate (bpm)</label>
                                <input
                                    type="text"
                                    name="heartRate"
                                    value={details.vitals.heartRate}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. 72"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait text-white rounded-lg transition-colors font-semibold shadow-lg shadow-blue-900/30"
                        >
                            {isLoading ? 'Processing...' : 'Proceed to Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
