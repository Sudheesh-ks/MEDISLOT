// context/tokenManager.ts

let accessToken: string | null = localStorage.getItem("token");

// ✅ Get token from memory
export const getAccessToken = () => accessToken;

// ✅ Set and persist token
export const updateAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

// ✅ Clear token from memory and storage
export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem("token");
};
