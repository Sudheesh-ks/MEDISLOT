import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/user/assets";
import { toast } from "react-toastify";
import { updateUserProfileAPI } from "../../services/userProfileServices";
import { useNavigate } from "react-router-dom";
import { isValidDateOfBirth, isValidPhone } from "../../utils/validator";
import { showErrorToast } from "../../utils/errorHandler";

const MyProfile = () => {
  const nav = useNavigate();
  const context = useContext(AppContext);
  if (!context) throw new Error("MyProfile must be within AppContext");
  const { userData, setUserData, token, loadUserProfileData } = context;

  const [isEdit, setEdit] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  if (!userData) return null;

  const save = async () => {
    try {
      if (!token) return toast.error("Login to continue");
      if (!isValidPhone(userData.phone))
        return toast.error("Phone must be 10 digits");
      if (!isValidDateOfBirth(userData.dob))
        return toast.error("Enter a valid birth date");

      const { message } = await updateUserProfileAPI(
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
      toast.success(message);
      await loadUserProfileData();
      setEdit(false);
      setImage(null);
    } catch (err) {
      showErrorToast(err);
    }
  };

  useEffect(() => {
    if (!token) nav("/");
  }, [token, nav]);

  const input =
    "bg-transparent ring-1 ring-white/10 rounded px-2 py-1 mt-1 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500";

  return (
    <div className="max-w-lg mx-auto py-24 px-4 text-slate-200">
      {isEdit ? (
        <label
          htmlFor="avatar"
          className="inline-block cursor-pointer relative"
        >
          <img
            src={image ? URL.createObjectURL(image) : userData.image}
            className="w-36 h-36 object-cover rounded-xl ring-1 ring-white/10 opacity-80"
          />
          {!image && (
            <img
              src={assets.upload_icon}
              className="w-10 absolute bottom-2 right-2"
            />
          )}
          <input
            id="avatar"
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>
      ) : (
        <img
          src={userData.image}
          className="w-36 h-36 object-cover rounded-xl ring-1 ring-white/10"
        />
      )}

      {isEdit ? (
        <input
          className={"mt-4 text-3xl font-semibold " + input}
          value={userData.name}
          onChange={(e) =>
            setUserData((p) => (p ? { ...p, name: e.target.value } : p))
          }
        />
      ) : (
        <h2 className="mt-4 text-3xl font-semibold">{userData.name}</h2>
      )}

      <hr className="my-6 border-white/10" />

      <section>
        <p className="text-cyan-400 mb-4">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
          <span className="font-medium">Email:</span>
          <span className="text-cyan-300">{userData.email}</span>

          <span className="font-medium">Phone:</span>
          {isEdit ? (
            <input
              className={input}
              value={userData.phone}
              onChange={(e) =>
                setUserData((p) => (p ? { ...p, phone: e.target.value } : p))
              }
            />
          ) : (
            <span className="text-cyan-300">{userData.phone}</span>
          )}

          <span className="font-medium">Address:</span>
          {isEdit ? (
            <div className="space-y-1">
              <input
                className={input}
                value={userData.address.line1}
                onChange={(e) =>
                  setUserData((p) =>
                    p
                      ? {
                          ...p,
                          address: { ...p.address, line1: e.target.value },
                        }
                      : p
                  )
                }
              />
              <input
                className={input}
                value={userData.address.line2}
                onChange={(e) =>
                  setUserData((p) =>
                    p
                      ? {
                          ...p,
                          address: { ...p.address, line2: e.target.value },
                        }
                      : p
                  )
                }
              />
            </div>
          ) : (
            <span className="text-slate-400">
              {userData.address.line1}
              <br />
              {userData.address.line2}
            </span>
          )}
        </div>
      </section>

      <section className="mt-8">
        <p className="text-cyan-400 mb-4">BASIC INFORMATION</p>
        <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
          <span className="font-medium">Gender:</span>
          {isEdit ? (
            <select
              className={input}
              value={userData.gender}
              onChange={(e) =>
                setUserData((p) => (p ? { ...p, gender: e.target.value } : p))
              }
            >
              <option>Male</option>
              <option>Female</option>
            </select>
          ) : (
            <span className="text-slate-400">{userData.gender}</span>
          )}

          <span className="font-medium">Birthday:</span>
          {isEdit ? (
            <input
              type="date"
              className={input}
              value={userData.dob}
              onChange={(e) =>
                setUserData((p) => (p ? { ...p, dob: e.target.value } : p))
              }
            />
          ) : (
            <span className="text-slate-400">{userData.dob}</span>
          )}
        </div>
      </section>

      <div className="mt-10 flex gap-4">
        {isEdit ? (
          <button
            onClick={save}
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white px-8 py-2 rounded-full hover:-translate-y-0.5 transition-transform"
          >
            Save information
          </button>
        ) : (
          <button
            onClick={() => setEdit(true)}
            className="border border-cyan-500 text-cyan-400 px-8 py-2 rounded-full hover:bg-cyan-500 hover:text-white transition-transform"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};
export default MyProfile;
