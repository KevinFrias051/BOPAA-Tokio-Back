export interface ICotizacion {
  id?: number;
  fecha: string;
  hora: string;
  dateUTC: Date;
  cotizacion: number;
  idEmpresa: number;
}