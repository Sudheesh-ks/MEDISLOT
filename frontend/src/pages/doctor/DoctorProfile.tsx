import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { assets } from "../../assets/user/assets";
import { showErrorToast } from "../../utils/errorHandler";
import { updateDoctorProfileAPI } from "../../services/doctorServices";

const DoctorProfile = () => {
  const context = useContext(DoctorContext);
  const appContext = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) throw new Error("DoctorProfile must be used within DoctorContextProvider");
  if (!appContext) throw new Error("DoctorProfile must be used within AppContextProvider");

  const { dToken, profileData, getProfileData } = context;
  const { currencySymbol } = appContext;

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [image, setImage] = useState<File | null>(null);
  const [available, setAvailable] = useState(profileData?.available ?? false);


  useEffect(() => {
    if (dToken) getProfileData();
  }, [dToken]);

  useEffect(() => {
    if (!dToken) navigate("/doctor/login");
  }, [dToken]);

  useEffect(() => {
    setFormData(profileData);
  }, [profileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => prev ? { ...prev, [name]: value } : prev);
  };

  const handleAddressChange = (field: "line1" | "line2", value: string) => {
    setFormData((prev) =>
      prev ? { ...prev, address: { ...prev.address, [field]: value } } : prev
    );
  };

  const updateDoctorProfileData = async () => {
    try {
      if (!dToken) {
        toast.error("Please login to continue...");
        return;
      }

      const response = await updateDoctorProfileAPI({ ...formData, available }, image);
      toast.success(response.data.message);
      await getProfileData();
      setIsEdit(false);
      setImage(null);
    } catch (error) {
      showErrorToast(error);
    }
  };

  // 🔒 Handle pending status
  if (profileData?.status === "pending") {
    return (
      <div className="m-5 text-center bg-yellow-100 border border-yellow-300 rounded-xl p-6 text-yellow-800 shadow-md">
        <h2 className="text-xl font-semibold mb-2">⏳ Awaiting Approval</h2>
        <p>Your registration is under review. The admin has not approved your account yet.</p>
      </div>
    );
  }

  // 🔒 Handle rejected status
  if (profileData?.status === "rejected") {
    return (
      <div className="m-5 text-center bg-red-100 border border-red-300 rounded-xl p-6 text-red-700 shadow-md">
        <h2 className="text-xl font-semibold mb-2">❌ Registration Rejected</h2>
        <p>Your registration has been rejected by the admin.</p>
        <p className="mt-2 text-sm">Please contact support or try registering again with updated details.</p>
      </div>
    );
  }

  // ✅ Show full dashboard only if approved
  if (profileData?.status !== "approved") return null;

  return profileData && formData ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="m-5 grid grid-cols-1 sm:grid-cols-3 gap-6"
    >
      {/* Profile Image */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="bg-primary rounded-xl shadow-md p-5 flex justify-center items-center"
      >
        {isEdit ? (
          <label htmlFor="doctor-image">
            <div className="relative cursor-pointer">
              <img
                className="w-36 rounded opacity-80"
                src={image ? URL.createObjectURL(image) : profileData.image}
                alt="Profile"
              />
              {!image && (
                <img
                  className="w-10 absolute bottom-2 right-2"
                  src={assets.upload_icon}
                  alt="Upload icon"
                />
              )}
            </div>
            <input
              type="file"
              id="doctor-image"
              hidden
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>
        ) : (
          <img src={profileData.image} alt="Profile" className="w-full rounded-xl object-cover" />
        )}
      </motion.div>

      {/* Profile Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="sm:col-span-2 bg-white rounded-xl shadow-md p-6 space-y-4"
      >
        {/* Name */}
        <div>
          {isEdit ? (
            <input
              className="text-3xl font-bold text-gray-800 bg-gray-50"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          ) : (
            <h2 className="text-3xl font-bold text-gray-800">{profileData.name}</h2>
          )}

          {isEdit ? (
            <div className="text-gray-500">
              <input
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="bg-gray-50 mr-2"
                placeholder="Degree"
              />
              -
              <input
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                className="bg-gray-50 ml-2"
                placeholder="Speciality"
              />
            </div>
          ) : (
            <p className="text-gray-500">{profileData.degree} - {profileData.speciality}</p>
          )}

          {isEdit ? (
            <input
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="bg-gray-50 text-sm text-gray-600"
              placeholder="Experience in years"
            />
          ) : (
            <p className="text-sm text-gray-600">Experience: {profileData.experience} years</p>
          )}
        </div>

        {/* About */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700">About</h3>
          {isEdit ? (
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              className="bg-gray-50 mt-1 w-full"
            />
          ) : (
            <p className="text-sm text-gray-600 mt-1">{profileData.about}</p>
          )}
        </div>

        {/* Fees */}
        <div className="flex items-center gap-4">
          <p className="text-gray-600 font-medium">
            Fee:{" "}
            {isEdit ? (
              <input
                name="fees"
                value={formData.fees}
                onChange={handleChange}
                className="bg-gray-50 max-w-[80px]"
              />
            ) : (
              <span className="text-gray-800">{currencySymbol}{profileData.fees}</span>
            )}
          </p>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Address</h3>
          {isEdit ? (
            <>
              <input
                className="bg-gray-50 mt-1 w-full"
                value={formData.address.line1}
                onChange={(e) => handleAddressChange("line1", e.target.value)}
                placeholder="Address line 1"
              />
              <input
                className="bg-gray-50 mt-1 w-full"
                value={formData.address.line2}
                onChange={(e) => handleAddressChange("line2", e.target.value)}
                placeholder="Address line 2"
              />
            </>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              {profileData.address.line1}<br />
              {profileData.address.line2}
            </p>
          )}
        </div>

       {/* Availability */}
<div className="flex items-center gap-4">
  <span className="text-sm font-medium text-gray-700">Available for Consultation</span>
  {isEdit ? (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={available}
        onChange={(e) => setAvailable(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-green-500 transition-all"></div>
      <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform peer-checked:translate-x-full"></div>
    </label>
  ) : (
    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
      {available ? 'Available' : 'Not Available'}
    </span>
  )}
</div>


        {/* Edit / Save Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-6 py-2 border border-primary text-primary rounded-full hover:bg-primary hover:text-white transition"
          onClick={isEdit ? updateDoctorProfileData : () => { setIsEdit(true); setFormData(profileData); }}
        >
          {isEdit ? "Save Changes" : "Edit Profile"}
        </motion.button>
      </motion.div>
    </motion.div>
  ) : null;
};

export default DoctorProfile;
