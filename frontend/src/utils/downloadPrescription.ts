import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PrescriptionData } from '../types/prescription';
import { generateShortAppointmentId } from './generateApptId.utils';

export const downloadPrescriptionPDF = (data: PrescriptionData) => {
  const doc = new jsPDF();

  // Colors
  const primaryColor: [number, number, number] = [41, 128, 185];
  const gray: [number, number, number] = [100, 100, 100];

  // Altering appointmentId
  const shortAppointmentId = generateShortAppointmentId(data.appointmentId);

  // ----- HEADER -----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text('Medislot Prescription', 105, 20, { align: 'center' });

  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);

  // ----- GENERAL INFO -----
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Appointment ID: ${shortAppointmentId}`, 20, 40);
  doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString()}`, 20, 48);

  // Doctor Info
  doc.setFont('helvetica', 'bold');
  doc.text('Doctor:', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.doctor.name}`, 40, 65);
  doc.text(`${data.doctor.email}`, 40, 72);

  // ----- PRESCRIPTION TABLE -----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Prescription Details', 20, 95);

  autoTable(doc, {
    startY: 100,
    head: [['#', 'Medication', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
    body: data.prescription.map((item, index) => [
      index + 1,
      item.medication,
      item.dosage,
      item.frequency,
      item.duration,
      item.instructions,
    ]),
    styles: { font: 'helvetica', fontSize: 11 },
    headStyles: { fillColor: primaryColor, textColor: 255, halign: 'center' },
    bodyStyles: { halign: 'center' },
    columnStyles: {
      1: { halign: 'left' },
      5: { halign: 'left' },
    },
  });

  // ----- FOOTER -----
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(gray[0], gray[1], gray[2]);
  doc.line(20, pageHeight - 30, 190, pageHeight - 30);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.text(
    'This is a digitally generated prescription. For any concerns, contact your doctor.',
    105,
    pageHeight - 20,
    { align: 'center' }
  );

  // ----- SAVE PDF -----
  doc.save(`Prescription_${data.appointmentId}.pdf`);
};
