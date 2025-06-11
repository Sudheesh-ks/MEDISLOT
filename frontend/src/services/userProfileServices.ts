import { api } from "../axios/axiosInstance";
import { showErrorToast } from "../utils/errorHandler";

// To get user profile
export const getUserProfileAPI = async (token: string) => {
  return api.get("/api/user/profile", {           
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Update profile
export const updateUserProfileAPI = async (
  token: string,
  data: any,
  image: File | null
) => {
  try {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("phone", data.phone);
    formData.append("gender", data.gender);
    formData.append("dob", data.dob);
    formData.append("address[line1]", data.address.line1);
    formData.append("address[line2]", data.address.line2);
    if (image) formData.append("image", image);

    const res = await api.put("/api/user/profile", formData, { 
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};
