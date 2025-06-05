import { api } from "../axios/axiosInstance";

// To list all doctors
export const getDoctorsAPI = async () => {
  return await api.get("/api/doctor/list");
};
