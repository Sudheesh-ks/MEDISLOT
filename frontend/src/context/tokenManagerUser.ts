const USER_ACCESS_TOKEN_KEY = 'userAccessToken';

export const getUserAccessToken = () => {
  return localStorage.getItem(USER_ACCESS_TOKEN_KEY);
};

export const updateUserAccessToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(USER_ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(USER_ACCESS_TOKEN_KEY);
  }
};

export const clearUserAccessToken = () => {
  localStorage.removeItem(USER_ACCESS_TOKEN_KEY);
};
