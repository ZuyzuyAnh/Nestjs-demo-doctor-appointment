import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Specialization } from '../../specializations/entities/specialization.entity';
import { Clinic } from '../../clinics/entities/clinic.entity';
import { Rating } from '../../ratings/entities/rating.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  workingHours: string;

  @Column('text', { nullable: true })
  biography: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => Rating, (rating) => rating.doctor)
  ratings: Rating[];

  @ManyToOne(() => Specialization)
  specialization: Specialization;

  @ManyToOne(() => Clinic)
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  getStartTime(): number {
    return +this.workingHours.split('-')[0];
  }

  getEndTime(): number {
    return +this.workingHours.split('-')[1];
  }
}
