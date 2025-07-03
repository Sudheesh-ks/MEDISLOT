// src/pages/doctor/DoctorRegister.tsx
import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/admin/assets";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerDoctorAPI } from "../../services/doctorServices";
import { showErrorToast } from "../../utils/errorHandler";
import { isValidEmail, isValidName, isValidPassword } from "../../utils/validator";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorRegister = () => {
  /* ------------ form state ------------ */
  const [docImg,      setDocImg]      = useState<File | null>(null);
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [experience,  setExperience]  = useState("1 Year");
  const [fees,        setFees]        = useState("");
  const [about,       setAbout]       = useState("");
  const [speciality,  setSpeciality]  = useState("General physician");
  const [degree,      setDegree]      = useState("");
  const [address1,    setAddress1]    = useState("");
  const [address2,    setAddress2]    = useState("");

  /* ------------ nav / context ------------ */
  const nav  = useNavigate();
  const ctx  = useContext(DoctorContext);
  if (!ctx) throw new Error("DoctorContext required");
  const { dToken } = ctx;

  useEffect(() => { if (dToken) nav("/doctor/dashboard"); }, [dToken]);

  /* ------------ submit ------------ */
  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    /* validations – same logic, different colours now handled by toast */
    if (!docImg)          return toast.error("Please upload a profile image");
    if (!docImg.type.startsWith("image/"))
  return toast.error("Uploaded file must be an image (jpg, png, …)");
    if (!name || !email || !password || !fees || !about || !degree || !address1)
      return toast.error("Please fill in all required fields");
    if (!isValidName(name))        return toast.error("Name must be ≥ 4 chars");
    if (!isValidEmail(email))      return toast.error("Enter a valid email");
    if (!isValidPassword(password))
      return toast.error("Password must be ≥ 8 chars, incl. number & symbol");

    try {
      const fd = new FormData();
      fd.append("image", docImg);
      fd.append("name", name);
      fd.append("email", email);
      fd.append("password", password);
      fd.append("experience", experience);
      fd.append("fees", fees);
      fd.append("about", about);
      fd.append("speciality", speciality);
      fd.append("degree", degree);
      fd.append("address", JSON.stringify({ line1: address1, line2: address2 }));

      const { data } = await registerDoctorAPI(fd);
      if (data.success) {
        toast.success(data.message);
        nav("/doctor/login");
      } else toast.error(data.message);
    } catch (err) { showErrorToast(err); }
  };

  /* ------------ UI helpers ------------ */
  const glass = "bg-white/5 backdrop-blur ring-1 ring-white/10";
  const input =
    "w-full bg-transparent ring-1 ring-white/10 rounded px-3 py-1.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500";
  const label = "block mb-1 font-medium text-slate-300";

  /* ============================================================ */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      {/* back‑home pill */}
      <div
        onClick={() => nav("/")}
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 shadow hover:-translate-y-0.5 transition cursor-pointer"
      >
        🏠 <span className="hidden sm:inline">Back to Home</span>
      </div>

      {/* form card */}
      <div className={`w-full max-w-5xl ${glass} rounded-3xl p-6 shadow-xl`}>
        <h2 className="text-2xl font-semibold text-center mb-6">
          Doctor Registration
        </h2>

        <form onSubmit={onSubmitHandler} className="space-y-6">
          {/* photo upload */}
          <div className="flex items-center gap-4">
            <label htmlFor="doc-img" className="cursor-pointer">
              <img
                className="w-16 h-16 rounded-full object-cover ring-1 ring-white/10"
                src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              />
              <input
                id="doc-img"
                type="file"
                accept="image/*"  
                hidden
                onChange={e => e.target.files && setDocImg(e.target.files[0])}
              />
            </label>
            <div className="text-xs text-slate-400">
              Click image to upload profile photo
            </div>
          </div>

          {/* inputs grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" value={name}    setValue={setName} />
            <InputField label="Email"     value={email}   setValue={setEmail} type="email" />
            <InputField label="Password"  value={password} setValue={setPassword} type="password" />
            <SelectField
              label="Experience"
              value={experience}
              setValue={setExperience}
              options={Array.from({ length: 15 }, (_, i) => `${i + 1} Year${i ? "s" : ""}`)}
            />
            <SelectField
              label="Speciality"
              value={speciality}
              setValue={setSpeciality}
              options={[
                "General physician",
                "Gynecologist",
                "Dermatologist",
                "Pediatrician",
                "Neurologist",
                "Gastroenterologist",
              ]}
            />
            <InputField label="Degree"   value={degree} setValue={setDegree} />
            <InputField label="Fees (₹)" value={fees}   setValue={setFees} type="number" />
            <InputField label="Address Line 1" value={address1} setValue={setAddress1} />
            <InputField label="Address Line 2" value={address2} setValue={setAddress2} />
          </div>

          {/* about */}
          <div>
            <label className={label}>About You</label>
            <textarea
              className={`${input} h-24`}
              value={about}
              onChange={e => setAbout(e.target.value)}
              placeholder="Write about your experience, certifications..."
            />
          </div>

          {/* buttons */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 px-10 py-2 rounded-full hover:-translate-y-0.5 transition-transform shadow-lg"
            >
              Register
            </button>
          </div>

          <p className="text-center text-sm">
            Already registered?{" "}
            <span
              onClick={() => nav("/doctor/login")}
              className="text-cyan-400 underline cursor-pointer hover:text-cyan-300"
            >
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );

  /* ---------- helpers ---------- */
  function InputField({
    label,
    value,
    setValue,
    type = "text",
  }: {
    label: string;
    value: string;
    setValue: (v: string) => void;
    type?: string;
  }) {
    return (
      <div>
        <label className={label}>{label}</label>
        <input
          type={type}
          value={value}
          onChange={e => setValue(e.target.value)}
          className={input}
          placeholder={label}
        />
      </div>
    );
  }

  function SelectField({
    label,
    value,
    setValue,
    options,
  }: {
    label: string;
    value: string;
    setValue: (v: string) => void;
    options: string[];
  }) {
    return (
      <div>
        <label className={label}>{label}</label>
        <select value={value} onChange={e => setValue(e.target.value)} className={input}>
          {options.map((o, i) => (
            <option key={i}>{o}</option>
          ))}
        </select>
      </div>
    );
  }
};

export default DoctorRegister;
