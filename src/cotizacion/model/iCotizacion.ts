export interface ICotizacion {
  id?: number;
  fecha: string;
  hora: string;
  cotizacion: number;
  idEmpresa: number;
}

export interface ICotizacionCard{
  codEmpresa:string;
  nombreEmpresa:string;
  valorActual:number;
  fluctuacion:number;
}