import * as momentTZ from 'moment-timezone';
import { IFecha } from 'src/model/fecha.model';


class DateMomentUtils {
  static TIMEZONE: string = 'Asia/Tokyo';

  //Transforma Utc en Gmt+9
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
    const fechaDate = new Date(DateMomentUtils.setHoraFechaString(fecha));
    const fechaStr = fechaDate.toISOString().substring(0, 16);
    return fechaStr
  }

  //Le asigna a una fecha las 08:00hrs
  //solo para buscar en gempresa las cotizaciones de un dia
  static setHoraFechaString(fecha: string): Date {
    const horaTz = momentTZ.tz(
      `${fecha}T08:00`,
      DateMomentUtils.TIMEZONE,
    );
    return horaTz.toDate();
  }

  //Suma x cantidad de horas a una fecha
  static sumaHoras(fecha: string, horas: number): string {
    const fechaDate = new Date(DateMomentUtils.setHoraFechaString(fecha));
    fechaDate.setTime(fechaDate.getTime() + (horas * 60 * 60 * 1000));    
    const fechaStr = fechaDate.toISOString().substring(0, 16);
    return fechaStr
  }

  //TRANSFORMA UNA FECHA UCT EN GMT+9
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
