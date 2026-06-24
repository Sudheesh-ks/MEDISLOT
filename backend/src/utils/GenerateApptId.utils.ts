export const generateShortAppointmentId = (fullId: string) => {
  const last4 = fullId.slice(-4);
  return `#APT$${last4}`;
};
