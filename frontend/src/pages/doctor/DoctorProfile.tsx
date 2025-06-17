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

      const response = await updateDoctorProfileAPI(formData, image);
      toast.success(response.data.message);
      await getProfileData();
      setIsEdit(false);
      setImage(null);
    } catch (error) {
      showErrorToast(error);
    }
  };

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

        {/* Availability (ReadOnly) */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="available" className="form-checkbox" checked readOnly />
          <label htmlFor="available" className="text-sm text-gray-600">Available</label>
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
