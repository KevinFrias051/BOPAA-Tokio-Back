import * as momentTZ from 'moment-timezone';
import { IFecha } from 'src/model/fecha.model';


class DateMomentUtils {
  static TIMEZONE: string = 'Asia/Tokyo';
  static horasHabiles = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
  ];

  //Transforma Utc en Gmt+9
  static getLastDateCotizacion(): IFecha {
    const date = new Date()
    date.setMinutes(0)
    const fecha = date.toISOString()
    const horaTz = momentTZ.tz(
      `${fecha}`,
      DateMomentUtils.TIMEZONE,
    );
    const fechaStr = horaTz.format()
    return {
      fecha: fechaStr.substring(0, 10),
      hora: fechaStr.substring(11, 16),
    };
  }

  static quitarDiasAfechaActual(dias: number): IFecha {
    const date = new Date();
    date.setDate(date.getDate() - dias); // Restar los días especificados
    date.setMinutes(0);
    
    const fecha = date.toISOString();
    const horaTz = momentTZ.tz(
      `${fecha}`,
      DateMomentUtils.TIMEZONE,
    );
    
    const fechaStr = horaTz.format();
    return {
      fecha: fechaStr.substring(0, 10),
      hora: fechaStr.substring(11, 16),
    };
}


  //FECHA YYYY-MM-DD T HH-MM
  static gmtMasNueve(fecha: string): string {
    console.log('fecha GMT:', fecha)
    const fechaDate = new Date(DateMomentUtils.getFechaFromString(fecha));
    const fechaStr = fechaDate.toISOString().substring(0, 16);
    console.log('fecha UTC:', fechaStr)
    return fechaStr
  }

  // Convierte una string fecha en un objeto Date en GMT+9
  static getFechaFromString(fecha: string): Date {
    const horaTz = momentTZ.tz(
      `${fecha}:00`,
      DateMomentUtils.TIMEZONE,
    );
    return horaTz.toDate();
  }

  //Convierte una fecha UTC a una fecha GMT+9 con hora 08:00
  static cotDia(fecha: string): string {
    //const horaTz = momentTZ.tz(`${fecha}T08:00`, DateMomentUtils.TIMEZONE);
    const fechaDate = new Date(DateMomentUtils.setHoraFechaString(fecha));
    const fechaStr = fechaDate.toISOString().substring(0, 16);
    return fechaStr
  }

  //Le asigna las 08:00 hrs a una fecha (solo para consultas de cotizaciones del día)
  static setHoraFechaString(fecha: string): Date {
    const horaTz = momentTZ.tz(
      `${fecha}T08:00`,
      DateMomentUtils.TIMEZONE,
    );
    return horaTz.toDate();
  }

  //Suma una cantidad de horas a una fecha
  static sumaHoras(fecha: string, horas: number): string {
    const fechaDate = new Date(DateMomentUtils.setHoraFechaString(fecha));
    fechaDate.setTime(fechaDate.getTime() + (horas * 60 * 60 * 1000));    
    const fechaStr = fechaDate.toISOString().substring(0, 16);
    return fechaStr
  }

  //transforma iFecha a string
  static formatFechaHora(ifFecha: IFecha): string {
    return `${ifFecha.fecha}T${ifFecha.hora}`;
  }

  //Transforma una fecha y hora UTC a GMT+9 y devuelve un objeto con fecha y hora
  static transformGMTFechaHora(fecha: string, hora: string): IFecha {
    const date = new Date(`${fecha}T${hora}:00.000Z`);
    const horaTz = momentTZ.tz(
      date,
      DateMomentUtils.TIMEZONE,);
    const fechaStr = horaTz.format()
    return {
      fecha: fechaStr.substring(0, 10),
      hora: fechaStr.substring(11, 16),
    };
  }

}

export default DateMomentUtils;
