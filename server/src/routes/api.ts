import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as patientController from '../controllers/patient.controller';
import * as doctorController from '../controllers/doctor.controller';
import * as appointmentController from '../controllers/appointment.controller';
import * as billingController from '../controllers/billing.controller';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Auth
router.post('/login', authController.login);

// Dashboard
router.get('/dashboard/stats', authenticate, dashboardController.getDashboardStats);

// Patients
router.get('/patients', authenticate, patientController.getPatients);
router.get('/patients/:id', authenticate, patientController.getPatientById);
router.post('/patients', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), patientController.createPatient);
router.put('/patients/:id', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), patientController.updatePatient);
router.delete('/patients/:id', authenticate, authorize(['ADMIN']), patientController.deletePatient);

// Doctors
router.get('/doctors', authenticate, doctorController.getDoctors);
router.post('/doctors', authenticate, authorize(['ADMIN']), doctorController.createDoctor);

// Appointments
router.get('/appointments', authenticate, appointmentController.getAppointments);
router.post('/appointments', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), appointmentController.bookAppointment);
router.patch('/appointments/:id/status', authenticate, appointmentController.updateAppointmentStatus);

// Billing
router.get('/bills', authenticate, billingController.getBills);
router.post('/bills', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), billingController.generateBill);
router.patch('/bills/:id/payment', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), billingController.updatePaymentStatus);

export default router;
