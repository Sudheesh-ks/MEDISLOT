let adminAccessToken: string | null = null;

export const getAdminAccessToken = () => adminAccessToken;

export const updateAdminAccessToken = (token: string | null) => {
  adminAccessToken = token;
};

export const clearAdminAccessToken = () => {
  adminAccessToken = null;
};
