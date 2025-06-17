let userAccessToken: string | null = null;

export const getUserAccessToken = () => userAccessToken;

export const updateUserAccessToken = (token: string | null) => {
  userAccessToken = token;
};

export const clearUserAccessToken = () => {
  userAccessToken = null;
};
