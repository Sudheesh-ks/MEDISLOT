import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/admin/assets";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerDoctorAPI } from "../../services/doctorServices";
import { showErrorToast } from "../../utils/errorHandler";
import { isValidEmail, isValidName, isValidPassword } from "../../utils/validator";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorRegister = () => {
  const [docImg, setDocImg] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const navigate = useNavigate();


    const context = useContext(DoctorContext);
  
    if (!context) {
      throw new Error("DoctorContext must be used within DoctorContextProvider");
    }
  
    const { dToken } = context;
  
    useEffect(() => {
      if (dToken) navigate("/doctor/dashboard");
    }, [dToken, navigate]);

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!docImg) return toast.error("Please upload a profile image.");
    if (!name || !email || !password || !fees || !about || !degree || !address1) {
      return toast.error("Please fill in all required fields.");
    }
    if (!isValidName(name)) return toast.error("Name must be at least 4 characters.");
    if (!isValidEmail(email)) return toast.error("Please enter a valid email address.");
    if (!isValidPassword(password)) {
      return toast.error(
        "Password must be at least 8 characters, include 1 number and 1 special character."
      );
    }

    try {
      // if (!docImg) return toast.error("Image Not Selected");

      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", fees);
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append("address", JSON.stringify({ line1: address1, line2: address2 }));

      const { data } = await registerDoctorAPI(formData);

      if (data.success) {
        toast.success(data.message);
        navigate("/doctor/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    
    <div className="flex items-center justify-center min-h-screen px-4">
      <div
  className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-medium shadow-md hover:bg-blue-200 transition duration-300 cursor-pointer"
  onClick={() => navigate("/")}
>
  <span className="text-lg">🏠</span>
  <span className="text-sm sm:text-base">Back to Home</span>
</div>
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-4">
        <h2 className="text-2xl font-semibold text-center text-primary mb-3">Doctor Registration</h2>

        <form onSubmit={onSubmitHandler} className="space-y-3">
          <div className="flex items-center gap-4">
            <label htmlFor="doc-img" className="cursor-pointer">
              <img
                className="w-14 h-14 rounded-full object-cover border border-gray-300"
                src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                alt="Upload"
              />
            </label>
            <input
              type="file"
              id="doc-img"
              hidden
              onChange={(e) => e.target.files && setDocImg(e.target.files[0])}
            />
            <div>
              <p className="text-sm font-medium">Upload Profile Image</p>
              <p className="text-xs text-gray-500">Click image to upload</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="Full Name" value={name} setValue={setName} />
            <InputField type="email" label="Email" value={email} setValue={setEmail} />
            <InputField type="password" label="Password" value={password} setValue={setPassword} />
            <SelectField
              label="Experience"
              value={experience}
              setValue={setExperience}
              options={Array.from({ length: 15 }, (_, i) => `${i + 1} Year${i > 0 ? "s" : ""}`)}
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
            <InputField label="Degree" value={degree} setValue={setDegree} />
            <InputField label="Fees (₹)" type="number" value={fees} setValue={setFees} />
            <InputField label="Address Line 1" value={address1} setValue={setAddress1} />
            <InputField label="Address Line 2" value={address2} setValue={setAddress2} />
          </div>

          <div>
            <label className="block mb-1 font-medium">About You</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={2}
              className="w-full border px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:border-primary"
              placeholder="Write about your experience, certifications..."
            />
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white px-8 py-2 rounded-md hover:bg-primary-dark transition"
            >
              Register
            </button>
          </div>
          <div className="text-center pt-3 text-sm">
  Already registered?{" "}
  <span
    onClick={() => navigate("/doctor/login")}
    className="text-primary font-medium underline cursor-pointer hover:text-primary-dark transition"
  >
    Login here
  </span>
</div>

        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, value, setValue, type = "text" }: any) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full border px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:border-primary"
      placeholder={label}
    />
  </div>
);

const SelectField = ({ label, value, setValue, options }: any) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full border px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:border-primary"
    >
      {options.map((option: string, idx: number) => (
        <option key={idx} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

export default DoctorRegister;