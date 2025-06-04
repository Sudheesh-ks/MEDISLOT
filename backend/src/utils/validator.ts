export const isValidName = (name: string): boolean => {
  const nameRegex = /^[A-Za-z\s]{4,}$/;
  return nameRegex.test(name);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

export const isValidDateOfBirth = (dob: string): boolean => {
  const selectedDate = new Date(dob);
  const today = new Date();
  return (
    selectedDate instanceof Date &&
    !isNaN(selectedDate.getTime()) &&
    selectedDate <= today
  );
};
