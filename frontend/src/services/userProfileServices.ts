import { api } from "../axios/axiosInstance";

// To get user profile
export const getUserProfileAPI = async (token: string) => {
  return await api.get("/api/user/get-profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// To update user profile
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

    const res = await api.put("/api/user/update-profile", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    let errorMessage = "Something went wrong";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};
