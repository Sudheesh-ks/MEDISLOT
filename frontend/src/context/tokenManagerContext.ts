export const TOKEN_KEYS = {
  ADMIN: 'adminAccessToken',
  DOCTOR: 'doctorAccessToken',
  USER: 'userAccessToken',
} as const;

type TokenType = keyof typeof TOKEN_KEYS;

export const getAccessToken = (type: TokenType): string | null => {
  return localStorage.getItem(TOKEN_KEYS[type]);
};

export const updateAccessToken = (type: TokenType, token: string | null): void => {
  if (token) {
    localStorage.setItem(TOKEN_KEYS[type], token);
  } else {
    localStorage.removeItem(TOKEN_KEYS[type]);
  }
};

export const clearAccessToken = (type: TokenType): void => {
  localStorage.removeItem(TOKEN_KEYS[type]);
};
