import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { District } from './district.entity';
import { Clinic } from '../../clinics/entities/clinic.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  streetAddress: string;

  @ManyToOne(() => District, (district) => district.addresses)
  @JoinColumn({ name: 'district_id' })
  district: District;

  @OneToOne(() => Clinic, (clinic) => clinic.address, { onDelete: 'SET NULL' })
  clinic: Clinic;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<Address>) {
    Object.assign(this, partial);
  }
}
