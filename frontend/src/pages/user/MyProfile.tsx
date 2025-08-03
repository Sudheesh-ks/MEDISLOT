// import { useContext, useEffect, useState } from 'react';
// import { UserContext } from '../../context/UserContext';
// import { assets } from '../../assets/user/assets';
// import { toast } from 'react-toastify';
// import { updateUserProfileAPI } from '../../services/userProfileServices';
// import { useNavigate } from 'react-router-dom';
// import { isValidDateOfBirth, isValidPhone } from '../../utils/validator';
// import { showErrorToast } from '../../utils/errorHandler';

// const MyProfile = () => {
//   const nav = useNavigate();
//   const context = useContext(UserContext);
//   if (!context) throw new Error('MyProfile must be within UserContext');
//   const { userData, setUserData, token, loadUserProfileData } = context;

//   const [isEdit, setEdit] = useState(false);
//   const [image, setImage] = useState<File | null>(null);

//   useEffect(() => {
//     if (!token) nav('/');
//   }, [token, nav]);

//   if (!userData) return null;

//   const save = async () => {
//     try {
//       if (!token) return toast.error('Login to continue');
//       if (!isValidPhone(userData.phone)) return toast.error('Phone must be 10 digits');
//       if (!isValidDateOfBirth(userData.dob)) return toast.error('Enter a valid birth date');

//       const { message } = await updateUserProfileAPI(
//         token,
//         {
//           name: userData.name,
//           phone: userData.phone,
//           address: userData.address,
//           gender: userData.gender,
//           dob: userData.dob,
//         },
//         image
//       );
//       toast.success(message);
//       await loadUserProfileData();
//       setEdit(false);
//       setImage(null);
//     } catch (err) {
//       showErrorToast(err);
//     }
//   };

//   const input =
//     'bg-transparent ring-1 ring-white/10 rounded px-2 py-1 mt-1 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500';

//   return (
//     <div className="max-w-lg mx-auto py-24 px-4 text-slate-200">
//       {isEdit ? (
//         <label htmlFor="avatar" className="inline-block cursor-pointer relative">
//           <img
//             src={image ? URL.createObjectURL(image) : userData.image}
//             className="w-36 h-36 object-cover rounded-xl ring-1 ring-white/10 opacity-80"
//           />
//           {!image && <img src={assets.upload_icon} className="w-10 absolute bottom-2 right-2" />}
//           <input
//             id="avatar"
//             type="file"
//             accept="image/*"
//             hidden
//             onChange={(e) => setImage(e.target.files?.[0] || null)}
//           />
//         </label>
//       ) : (
//         <img
//           src={userData.image}
//           className="w-36 h-36 object-cover rounded-xl ring-1 ring-white/10"
//         />
//       )}

//       {isEdit ? (
//         <input
//           className={'mt-4 text-3xl font-semibold ' + input}
//           value={userData.name}
//           onChange={(e) => setUserData((p) => (p ? { ...p, name: e.target.value } : p))}
//         />
//       ) : (
//         <h2 className="mt-4 text-3xl font-semibold">{userData.name}</h2>
//       )}

//       <hr className="my-6 border-white/10" />

//       <section>
//         <p className="text-cyan-400 mb-4">CONTACT INFORMATION</p>
//         <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
//           <span className="font-medium">Email:</span>
//           <span className="text-cyan-300">{userData.email}</span>

//           <span className="font-medium">Phone:</span>
//           {isEdit ? (
//             <input
//               className={input}
//               value={userData.phone}
//               onChange={(e) => setUserData((p) => (p ? { ...p, phone: e.target.value } : p))}
//             />
//           ) : (
//             <span className="text-cyan-300">{userData.phone}</span>
//           )}

//           <span className="font-medium">Address:</span>
//           {isEdit ? (
//             <div className="space-y-1">
//               <input
//                 className={input}
//                 value={userData.address.line1}
//                 onChange={(e) =>
//                   setUserData((p) =>
//                     p
//                       ? {
//                           ...p,
//                           address: { ...p.address, line1: e.target.value },
//                         }
//                       : p
//                   )
//                 }
//               />
//               <input
//                 className={input}
//                 value={userData.address.line2}
//                 onChange={(e) =>
//                   setUserData((p) =>
//                     p
//                       ? {
//                           ...p,
//                           address: { ...p.address, line2: e.target.value },
//                         }
//                       : p
//                   )
//                 }
//               />
//             </div>
//           ) : (
//             <span className="text-slate-400">
//               {userData.address.line1}
//               <br />
//               {userData.address.line2}
//             </span>
//           )}
//         </div>
//       </section>

//       <section className="mt-8">
//         <p className="text-cyan-400 mb-4">BASIC INFORMATION</p>
//         <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
//           <span className="font-medium">Gender:</span>
//           {isEdit ? (
//             <select
//               className={input}
//               value={userData.gender}
//               onChange={(e) => setUserData((p) => (p ? { ...p, gender: e.target.value } : p))}
//             >
//               <option>Male</option>
//               <option>Female</option>
//             </select>
//           ) : (
//             <span className="text-slate-400">{userData.gender}</span>
//           )}

//           <span className="font-medium">Birthday:</span>
//           {isEdit ? (
//             <input
//               type="date"
//               className={input}
//               value={userData.dob}
//               onChange={(e) => setUserData((p) => (p ? { ...p, dob: e.target.value } : p))}
//             />
//           ) : (
//             <span className="text-slate-400">{userData.dob}</span>
//           )}
//         </div>
//       </section>

//       <div className="mt-10 flex gap-4">
//         {isEdit ? (
//           <button
//             onClick={save}
//             className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white px-8 py-2 rounded-full hover:-translate-y-0.5 transition-transform"
//           >
//             Save information
//           </button>
//         ) : (
//           <button
//             onClick={() => setEdit(true)}
//             className="border border-cyan-500 text-cyan-400 px-8 py-2 rounded-full hover:bg-cyan-500 hover:text-white transition-transform"
//           >
//             Edit
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };
// export default MyProfile;

import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { assets } from '../../assets/user/assets';
import { toast } from 'react-toastify';
import { updateUserProfileAPI } from '../../services/userProfileServices';
import { useNavigate } from 'react-router-dom';
import { isValidDateOfBirth, isValidPhone } from '../../utils/validator';
import { showErrorToast } from '../../utils/errorHandler';

const MyProfile = () => {
  const nav = useNavigate();
  const context = useContext(UserContext);
  if (!context) throw new Error('MyProfile must be within UserContext');
  const { userData, setUserData, token, loadUserProfileData } = context;

  const [isEdit, setEdit] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (!token) nav('/');
  }, [token, nav]);

  if (!userData) return null;

  const save = async () => {
    try {
      if (!token) return toast.error('Login to continue');
      if (!isValidPhone(userData.phone)) return toast.error('Phone must be 10 digits');
      if (!isValidDateOfBirth(userData.dob)) return toast.error('Enter a valid birth date');

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

  const input =
    'bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-700 transition-all duration-200';

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
        <p className="text-gray-400 text-sm">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg p-6">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 pb-6 border-b border-gray-700">
              {/* Avatar */}
              <div className="relative">
                {isEdit ? (
                  <label htmlFor="avatar" className="inline-block cursor-pointer relative group">
                    <img
                      src={image ? URL.createObjectURL(image) : userData.image}
                      className="w-24 h-24 object-cover rounded-lg border-2 border-blue-500 group-hover:border-blue-400 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <img src={assets.upload_icon} className="w-6 h-6" />
                    </div>
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
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-600"
                  />
                )}
              </div>

              {/* Name and Email */}
              <div className="flex-1 text-center sm:text-left">
                {isEdit ? (
                  <input
                    className={input + ' text-xl font-semibold mb-2'}
                    value={userData.name}
                    onChange={(e) => setUserData((p) => (p ? { ...p, name: e.target.value } : p))}
                    placeholder="Your name"
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-white mb-2">{userData.name}</h2>
                )}
                <p className="text-blue-400 text-sm mb-2">{userData.email}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                    Verified
                  </span>
                  {/* <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs">
                    Premium
                  </span> */}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                {isEdit ? (
                  <input
                    className={input}
                    value={userData.phone}
                    onChange={(e) => setUserData((p) => (p ? { ...p, phone: e.target.value } : p))}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">{userData.phone}</span>
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                {isEdit ? (
                  <select
                    className={input}
                    value={userData.gender}
                    onChange={(e) => setUserData((p) => (p ? { ...p, gender: e.target.value } : p))}
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                ) : (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">{userData.gender}</span>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date of Birth
                </label>
                {isEdit ? (
                  <input
                    type="date"
                    className={input}
                    value={userData.dob}
                    onChange={(e) => setUserData((p) => (p ? { ...p, dob: e.target.value } : p))}
                  />
                ) : (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">{userData.dob}</span>
                  </div>
                )}
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <span className="text-blue-300">{userData.email}</span>
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Address Line 1
                </label>
                {isEdit ? (
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
                    placeholder="Address Line 1"
                  />
                ) : (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">{userData.address.line1}</span>
                  </div>
                )}
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Address Line 2
                </label>
                {isEdit ? (
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
                    placeholder="Address Line 2"
                  />
                ) : (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">{userData.address.line2 || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              {isEdit ? (
                <>
                  <button
                    onClick={save}
                    className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEdit(false);
                      setImage(null);
                    }}
                    className="flex-1 border border-gray-600 text-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEdit(true)}
                  className="flex-1 border border-blue-600 text-blue-400 px-6 py-2 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors duration-200"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="lg:col-span-1">
          <div
            onClick={() => nav('/wallet')}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-4 cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300 h-fit"
          >
            <div className="text-center">
              <p className="text-white/80 text-xs font-medium mb-1">My Wallet</p>
              <p className="text-white text-xl font-bold mb-3">$2,847.50</p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/70">Available</span>
                  <span className="text-white font-medium">$2,847.50</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-white/70">Pending</span>
                  <span className="text-white font-medium">$125.00</span>
                </div> */}
              </div>

              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/70">**** 8547</span>
                  <span className="text-white font-medium">View →</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-gray-800 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-semibold text-white mb-3">Account Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Member Since</span>
                <span className="text-white"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
