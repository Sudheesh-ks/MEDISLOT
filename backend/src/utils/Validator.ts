export const isValidName = (name: string): boolean => {
  const nameRegex = /^(?=(?:.*[A-Za-z]){4,})[A-Za-z\s]+$/;
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

  if (!(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
    return false;
  }

  const onlyDateToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (selectedDate >= onlyDateToday) {
    return false;
  }

  let age = today.getFullYear() - selectedDate.getFullYear();
  const m = today.getMonth() - selectedDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) {
    age--;
  }

  return age >= 18;
};

export const isValidAddress = (address: string): boolean => {
  const addressRegex = /^[\p{L}\p{M}\d\s.'\-(),]{4,50}$/u;
  return addressRegex.test(address.trim());
};
