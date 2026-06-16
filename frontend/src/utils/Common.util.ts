export const calculateAge = (dob: string): number => {
  const today = new Date();
  const birthDate = new Date(dob);
  return today.getFullYear() - birthDate.getFullYear();
};

const months = [
  '',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const slotDateFormat = (slotDate: string): string => {
  if (!slotDate) return 'N/A';
  const [day, month, year] = slotDate.split('-');
  const monthIndex = Number(month);
  return `${day} ${months[monthIndex] ?? 'N/A'} ${year}`;
};

export const currencySymbol = '₹';
