import { Column, PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Indice } from "src/indice/entities/indice.entity";

@Entity('indiceCotizaciones')
export class IndiceCotizacion {
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
    precision: 10,
  })
  public hora: string;

  @Column({
    name: 'indiceCotizacion',
    type: 'decimal',
    precision: 20,
    scale: 4,
  })
  public indiceCotizacion: number;


  @ManyToOne(() => Indice, (indice) => indice.cotizaciones)
  @JoinColumn({
    name: 'codeIndice',
    referencedColumnName: 'codeIndice',
  })
  public codeIndice: Indice;

  constructor(
    fecha: string,
    hora: string,
    indiceCotizacion: number,
    codeIndice: Indice
  ) {
    this.fecha = fecha;
    this.hora = hora;
    this.indiceCotizacion = indiceCotizacion;
    this.codeIndice = codeIndice;
  }
}
