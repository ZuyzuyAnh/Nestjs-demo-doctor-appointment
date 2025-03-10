import AppointmentStatus from '../entities/apoointment-status.enum';

export class CreateAppointmentDto {
  doctorId: number;
  appointmentDate: Date;
  status: AppointmentStatus = AppointmentStatus.SCHEDULED;
  note: string;
}
