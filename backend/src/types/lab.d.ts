import { Types } from 'mongoose';

export interface LabAddress {
  fullAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface GeoLocation {
  type: 'Point';
  coordinates: number[]; // [longitude, latitude]
}

export interface LabTypes {
  _id?: string | Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password?: string;
  licenseNumber: string;
  gstNumber?: string;
  experience: number;
  description: string;
  accreditation: 'NABL' | 'ISO' | 'Other' | string;
  address: LabAddress;
  location: GeoLocation;
  licenseCertificate: string;
  images: string[];
  ownerIdProof: string;
  accreditationCertificate: string;
  workingDays: string[]; // e.g. ['Monday', 'Tuesday', ...]
  openingTime: string; // e.g. '08:00'
  closingTime: string; // e.g. '20:00'
  emergency: boolean;
  homeCollection: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'blocked';
  averageRating?: number;
  ratingCount?: number;
  date?: Date;
}

export interface LabVerificationTypes {
  _id?: string | Types.ObjectId;
  labId: string | Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  verifiedBy?: string | Types.ObjectId;
  verifiedAt?: Date;
}

export interface LabServiceTypes {
  _id?: string | Types.ObjectId;
  labId: string | Types.ObjectId;
  testName: string;
  category: 'Blood Test' | 'Thyroid' | 'Diabetes' | 'MRI' | 'CT Scan' | 'X-Ray' | 'Urine Test' | 'Full Body Checkup' | 'ECG' | 'Covid Tests' | string;
  description: string;
  preparation: string;
  price: number;
  discountPrice?: number;
  reportTime: string; // e.g. "12 Hours", "24 Hours"
  homeCollection: boolean;
  image?: string;
  isActive: boolean;
}

export interface BookingAddress {
  fullAddress: string;
  city: string;
  pincode: string;
  phone: string;
}

export interface LabBookingTypes {
  _id?: string | Types.ObjectId;
  bookingId: string; // Short code e.g. LAB-123456
  userId: string | Types.ObjectId;
  labId: string | Types.ObjectId;
  services: string[] | Types.ObjectId[] | any[]; // ref LabService
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // e.g. "10:00"
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  homeCollection: boolean;
  address?: BookingAddress;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'online' | 'wallet' | 'cod';
  status: 'pending' | 'accepted' | 'sample_collected' | 'processing' | 'report_ready' | 'completed' | 'cancelled';
  technicianId?: string | Types.ObjectId | any;
  cancellationReason?: string;
  razorpayOrderId?: string;
  prescriptionTestId?: string | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LabReportTypes {
  _id?: string | Types.ObjectId;
  bookingId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  labId: string | Types.ObjectId;
  reportFile: string; // Cloudinary URL (PDF)
  comments?: string;
  uploadedAt?: Date;
  digitallySigned?: boolean;
}

export interface PrescriptionTestTypes {
  _id?: string | Types.ObjectId;
  doctorId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  appointmentId: string | Types.ObjectId;
  testName: string;
  preferredLabId?: string | Types.ObjectId;
  priority: 'routine' | 'urgent' | 'critical';
  status: 'pending' | 'booked' | 'completed';
  bookingId?: string | Types.ObjectId;
  createdAt?: Date;
}

export interface TechnicianTypes {
  _id?: string | Types.ObjectId;
  labId: string | Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  status: 'available' | 'busy' | 'inactive';
}

export interface ReviewTypes {
  _id?: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  labId: string | Types.ObjectId;
  bookingId: string | Types.ObjectId;
  rating: number;
  review: string;
  createdAt?: Date;
}
