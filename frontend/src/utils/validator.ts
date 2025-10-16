// User Validators
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[\p{L}\p{M}\s.'\-(),]{4,50}$/u;
  return nameRegex.test(name.trim());
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^_-])[A-Za-z\d@$!%*#?&^_-]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

export const isValidDateOfBirth = (dob: string): boolean => {
  const selectedDate = new Date(dob);
  const today = new Date();
  return selectedDate instanceof Date && !isNaN(selectedDate.getTime()) && selectedDate <= today;
};

export const isValidAddress = (address: string): boolean => {
  const addressRegex = /^[\p{L}\p{M}\d\s.'\-(),]{4,50}$/u;
  return addressRegex.test(address.trim());
};

// Doctor Validators
export const isValidDoctorName = (name: string): boolean => {
  const nameRegex = /^[A-Za-z\s.'\-(),]{4,50}$/u;
  return nameRegex.test(name.trim());
};

export const isValidShortText = (text: string): boolean => {
  const shortTextRegex = /^[\p{L}\p{M}\s.'\-(),]{2,50}$/u;
  return shortTextRegex.test(text.trim());
};

export const isValidExperience = (exp: string): boolean => {
  const expRegex = /^\d{1,2}(\s*(years?|yrs?)\.?)?$/i;
  return expRegex.test(exp.trim());
};

export const isValidFees = (fees: string | number): boolean => {
  const num = Number(fees);
  return !isNaN(num) && num > 0 && num <= 10000;
};

export const isValidAbout = (about: string): boolean => {
  return about.trim().length >= 10 && about.trim().length <= 500;
};

// Blog Validations
export const isValidBlogTitle = (title: string): boolean => {
  const titleRegex = /^[\p{L}\p{M}\d\s.,'"\-:;!?()]{5,100}$/u;
  return titleRegex.test(title.trim());
};

export const isValidBlogSummary = (summary: string): boolean => {
  const summaryRegex = /^[\p{L}\p{M}\d\s.,'"\-:;!?()]{20,300}$/u;
  return summaryRegex.test(summary.trim());
};

export const isValidCategory = (category: string): boolean => {
  return typeof category === 'string' && category.trim().length > 0;
};

export const isValidReadTime = (readTime: string): boolean => {
  const num = Number(readTime);
  return !isNaN(num) && num >= 1 && num <= 60;
};

export const isValidTags = (tags: string[]): boolean => {
  if (!Array.isArray(tags) || tags.length === 0) return false;
  return tags.every((tag) => /^[\p{L}\p{M}\d\s-]{2,20}$/u.test(tag.trim()));
};

export const isValidBlogContent = (htmlContent: string): boolean => {
  const textContent = htmlContent.replace(/<[^>]+>/g, '').trim();
  return textContent.length >= 50;
};

// Patient History validations
export const isValidChiefComplaint = (text: string): boolean => {
  return text.trim().length >= 5 && text.trim().length <= 200;
};

export const isValidDiagnosis = (text: string): boolean => {
  return text.trim().length >= 5 && text.trim().length <= 500;
};

export const isValidDoctorNotes = (text: string): boolean => {
  return text.trim().length >= 5 && text.trim().length <= 800;
};

export const isValidSymptom = (symptom: string): boolean => {
  return symptom.trim().length > 0 && symptom.trim().length <= 50;
};

export const isValidPrescriptionField = (text: string): boolean => {
  return text.trim().length > 0 && text.trim().length <= 100;
};

export const isValidVitalField = (text: string): boolean => {
  return text.trim().length > 0 && text.trim().length <= 20;
};

export const isValidDate = (date: string): boolean => {
  const selectedDate = new Date(date);
  const today = new Date();
  return selectedDate instanceof Date && !isNaN(selectedDate.getTime()) && selectedDate <= today;
};

export const isValidTime = (time: string): boolean => {
  return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time.trim());
};
