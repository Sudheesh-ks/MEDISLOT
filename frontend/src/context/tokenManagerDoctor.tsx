const DOCTOR_ACCESS_TOKEN_KEY = 'doctorAccessToken';

export const getDoctorAccessToken = () => {
  return localStorage.getItem(DOCTOR_ACCESS_TOKEN_KEY);
};

export const updateDoctorAccessToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(DOCTOR_ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(DOCTOR_ACCESS_TOKEN_KEY);
  }
};

export const clearDoctorAccessToken = () => {
  localStorage.removeItem(DOCTOR_ACCESS_TOKEN_KEY);
};
