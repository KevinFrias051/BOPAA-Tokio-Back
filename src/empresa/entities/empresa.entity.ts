import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  public idEmpresa: number;

  @Column({
    name: 'codEmpresa',
    length: 100,
  })
  public codEmpresa: string;

  @Column({
    name: 'nombreEmpresa',
    length: 100,
  })
  public nombreEmpresa: string;

  @Column({
    name: 'cotizationInicial',
    type: 'decimal',
    precision: 7,
    scale: 2,
  })
  public cotizationInicial: number;

  @Column({
    name: 'cantidadAcciones',
    type: 'bigint',
  })
  public cantidadAcciones: number;

  constructor(codEmpresa: string, nombreEmpresa: string , cotizationInicial: number, cantidadAcciones: number) {
    this.codEmpresa = codEmpresa;
    this.nombreEmpresa = nombreEmpresa;
    this.cotizationInicial=cotizationInicial;
    this.cantidadAcciones=cantidadAcciones;
  }

  public getId(): number {
    return this.idEmpresa;
  }

  public getcodEmpresa(): string {
    return this.codEmpresa;
  }

  public setcodEmpresa(codEmpresa: string) {
    this.codEmpresa = codEmpresa;
  }

  public getnombreEmpresa(): string {
    return this.nombreEmpresa;
  }

  public setnombreEmpresa(nombreEmpresa: string) {
    this.nombreEmpresa = nombreEmpresa;
  }

  public getCotizacionInicial(): number {
    return this.cotizationInicial;
  }

  public getCantidadAcciones(): number {
    return this.cantidadAcciones;
  }
}
