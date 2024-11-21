import { Empresa } from "src/empresa/entities/empresa.entity";
import {  Column, PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from "typeorm";

@Entity('cotizaciones')
export class Cotizacion {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  public id: number;

  @Column({
    name: 'fecha',
    type: 'varchar',
    precision: 10,
  })
  public fecha: string;

  @Column({
    name: 'hora',
    type: 'varchar',
    precision: 5,
  })
  public hora: string;

  @Column({
    name: 'cotization',
    type: 'decimal',
    precision: 7,
    scale: 2,
  })
  public cotizacion: number;

  // Relación ManyToOne con Empresa
  @ManyToOne(() => Empresa, (empresa) => empresa.cotizaciones)
  @JoinColumn({
    name: 'codEmpresa',
    referencedColumnName: 'codEmpresa',
  })
  public empresa: Empresa;

  constructor(id: number, fecha: string, hora: string, cotizacion: number, empresa: Empresa) {
    this.id = id;
    this.fecha = fecha;
    this.hora = hora;
    this.cotizacion = cotizacion;
    this.empresa = empresa;
  }
}