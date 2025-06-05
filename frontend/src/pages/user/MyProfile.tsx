import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/user/assets";
import { toast } from "react-toastify";
import { updateUserProfileAPI } from "../../services/userProfileServices";
import { useNavigate } from "react-router-dom";
import { isValidDateOfBirth, isValidPhone } from "../../utils/validator";
import { showErrorToast } from "../../utils/errorHandler";

const MyProfile = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("TopDoctors must be used within an AppContextProvider");
  }

  const { userData, setUserData, token, loadUserProfileData } = context;

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  if (!userData) return null;

  const updateUserProfileData = async () => {
    try {
      if (!token) {
        toast.error("Please login to continue...");
        return;
      }

      if (!isValidPhone(userData.phone)) {
        toast.error("Phone number must be exactly 10 digits.");
        return;
      }

      if (!isValidDateOfBirth(userData.dob)) {
        toast.error("Please enter a valid birth date.");
        return;
      }

      const data = await updateUserProfileAPI(
        token,
        {
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          gender: userData.gender,
          dob: userData.dob,
        },
        image
      );

      toast.success(data.message);
      await loadUserProfileData();
      setIsEdit(false);
      setImage(null);
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    userData && (
      <div className="max-w-lg flex flex-col gap-2 text-sm">
        {isEdit ? (
          <label htmlFor="image">
            <div className="inline-block relative cursor-pointer">
              {/* Displaying profile image or new selected image  */}
              <img
                className="w-36 rounded opacity-75"
                src={image ? URL.createObjectURL(image) : userData.image}
                alt="Profile"
              />

              {/* Displaying upload icon if no new image is selected */}
              {!image && (
                <img
                  className="w-10 absolute bottom-12 right-12"
                  src={assets.upload_icon}
                  alt="Upload icon"
                />
              )}
            </div>
            <input
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              type="file"
              id="image"
              hidden
            />
          </label>
        ) : (
          <img className="w-36 rounded" src={userData.image} alt="" />
        )}

        {isEdit ? (
          <input
            className="bg-gray-50 text-3xl font-medium max-w-60 mt-4"
            type="text"
            value={userData.name}
            onChange={(e) =>
              setUserData((prev) =>
                prev ? { ...prev, name: e.target.value } : prev
              )
            }
          />
        ) : (
          <p className="font-medium text-3xl text-neutral-800 mt-4">
            {userData.name}
          </p>
        )}

        <hr className="bg-zinc-400 h-[1px] border-none" />

        <div>
          <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Email id:</p>
            <p className="text-blue-500">{userData.email}</p>
            <p className="font-medium">Phone:</p>
            {isEdit ? (
              <input
                className="bg-gray-100 max-w-52"
                type="text"
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) =>
                    prev ? { ...prev, phone: e.target.value } : prev
                  )
                }
              />
            ) : (
              <p className="text-blue-400">{userData.phone}</p>
            )}
            <p>Address:</p>
            {isEdit ? (
              <p>
                <input
                  className="bg-gray-50"
                  value={userData.address.line1}
                  onChange={(e) =>
                    setUserData((prev) =>
                      prev
                        ? {
                            ...prev,
                            address: { ...prev.address, line1: e.target.value },
                          }
                        : prev
                    )
                  }
                  type="text"
                />
                <br />
                <input
                  className="bg-gray-50"
                  value={userData.address.line2}
                  onChange={(e) =>
                    setUserData((prev) =>
                      prev
                        ? {
                            ...prev,
                            address: { ...prev.address, line2: e.target.value },
                          }
                        : prev
                    )
                  }
                  type="text"
                />
              </p>
            ) : (
              <p className="text-gray-500">
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Gender:</p>
            {isEdit ? (
              <select
                className="max-w-20 bg-gray-100"
                value={userData.gender}
                onChange={(e) =>
                  setUserData((prev) =>
                    prev ? { ...prev, gender: e.target.value } : prev
                  )
                }
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <p className="text-gray-400">{userData.gender}</p>
            )}

            <p className="font-medium">Birthday:</p>
            {isEdit ? (
              <input
                className="max-w-28 bg-gray-100"
                onChange={(e) =>
                  setUserData((prev) =>
                    prev ? { ...prev, dob: e.target.value } : prev
                  )
                }
                type="date"
              />
            ) : (
              <p className="text-gray-400">{userData.dob}</p>
            )}
          </div>
        </div>

        <div className="mt-10">
          {isEdit ? (
            <button
              className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={updateUserProfileData}
            >
              Save information
            </button>
          ) : (
            <button
              className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={() => setIsEdit(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    )
  );
};

export default MyProfile;
