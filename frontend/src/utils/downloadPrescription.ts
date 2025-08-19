import jsPDF from 'jspdf';

interface PrescriptionData {
  appointmentId: string;
  doctor: { name: string; email: string };
  patient: { name: string; email: string };
  prescription: string;
  createdAt: string;
}

export const downloadPrescriptionPDF = (data: PrescriptionData) => {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Medislot Prescription', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Appointment ID: ${data.appointmentId}`, 20, 40);
  doc.text(`Date: ${new Date(data.createdAt).toLocaleString()}`, 20, 50);

  doc.text(`Doctor: ${data.doctor.name} , email: (${data.doctor.email})`, 20, 70);
  doc.text(`Patient: ${data.patient.name} , email: (${data.patient.email})`, 20, 80);

  doc.setFont('helvetica', 'bold');
  doc.text('Prescription Notes:', 20, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(data.prescription, 20, 110, { maxWidth: 170 });

  doc.save(`Prescription_${data.appointmentId}.pdf`);
};
