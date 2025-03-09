import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SystemFlag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;
}
