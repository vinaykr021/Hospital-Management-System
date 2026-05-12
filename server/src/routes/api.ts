import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as patientController from '../controllers/patient.controller';
import * as doctorController from '../controllers/doctor.controller';
import * as appointmentController from '../controllers/appointment.controller';
import * as billingController from '../controllers/billing.controller';
import * as dashboardController from '../controllers/dashboard.controller';
import * as departmentController from '../controllers/department.controller';
import * as specializationController from '../controllers/specialization.controller';
import * as bedController from '../controllers/bed.controller';
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
router.put('/doctors/:id', authenticate, authorize(['ADMIN']), doctorController.updateDoctor);
router.delete('/doctors/:id', authenticate, authorize(['ADMIN']), doctorController.deleteDoctor);

// Departments
router.get('/departments', authenticate, departmentController.getDepartments);
router.post('/departments', authenticate, authorize(['ADMIN']), departmentController.createDepartment);

// Specializations
router.get('/specializations', authenticate, specializationController.getSpecializations);
router.post('/specializations', authenticate, authorize(['ADMIN']), specializationController.createSpecialization);

// Appointments
router.get('/appointments', authenticate, appointmentController.getAppointments);
router.post('/appointments', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), appointmentController.bookAppointment);
router.patch('/appointments/:id/status', authenticate, appointmentController.updateAppointmentStatus);
router.delete('/appointments/:id', authenticate, authorize(['ADMIN']), appointmentController.deleteAppointment);

// Billing
router.get('/bills', authenticate, billingController.getBills);
router.post('/bills', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), billingController.generateBill);
router.patch('/bills/:id/payment', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), billingController.updatePaymentStatus);
router.delete('/bills/:id', authenticate, authorize(['ADMIN']), billingController.deleteBill);

// Beds
router.get('/beds', authenticate, bedController.getBeds);
router.post('/beds', authenticate, authorize(['ADMIN']), bedController.createBed);
router.put('/beds/:id', authenticate, authorize(['ADMIN']), bedController.updateBed);
router.delete('/beds/:id', authenticate, authorize(['ADMIN']), bedController.deleteBed);
router.post('/beds/:id/assign', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), bedController.assignPatient);
router.post('/beds/:id/release', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), bedController.releaseBed);

export default router;
