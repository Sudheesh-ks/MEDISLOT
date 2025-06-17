let doctorAccessToken: string | null = null;

export const getDoctorAccessToken = () => doctorAccessToken;

export const updateDoctorAccessToken = (token: string | null) => {
  doctorAccessToken = token;
};

export const clearDoctorAccessToken = () => {
  doctorAccessToken = null;
};
