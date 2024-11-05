import { Empresa } from "src/empresa/entities/empresa.entity";
import {  Column, PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from "typeorm";

@Entity('cotizaciones')
export class Cotizacion {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  private id: number;

  @Column({
    name: 'fecha',
    type: 'varchar',
    precision: 10,
  })
  private fecha: string;

  @Column({
    name: 'hora',
    type: 'varchar',
    precision: 5,
  })
  private hora: string;

  @Column({
    type: 'date',
  })
  private dateUTC: Date;

  @Column({
    name: 'cotization',
    type: 'decimal',
    precision: 7,
    scale: 2,
  })
  public cotizacion: number;

  @ManyToOne(() => Empresa, (empresa) => empresa.codEmpresa)
  @JoinColumn({
    name: 'codEmpresa',
    referencedColumnName: 'codEmpresa',
  })
  public codEmpresa: Empresa;


  constructor() {}
}