import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from "typeorm";
import { IndiceCotizacion } from "src/indiceCotizaciones/entities/indiceCotizacion.entity";

@Entity('indices')
export class Indice {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  public id: number;

  @Column({
    name: 'codIndice',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  public codeIndice: string;

  @Column({
    name: 'nombreIndice',
    type: 'varchar',
    length: 50,
  })
  public nombreIndice: string;

  @Column({
    name: 'v',
    type: 'bigint',
    precision: 5,
  })
  public v: number;

  @OneToMany(() => IndiceCotizacion, (cotizacion) => cotizacion.codeIndice)
  public cotizaciones: IndiceCotizacion[];

  constructor(id: number, codeIndice: string, nombreIndice: string, v: number) {
    this.id = id;
    this.codeIndice = codeIndice;
    this.nombreIndice = nombreIndice;
    this.v = v;
  }
}
