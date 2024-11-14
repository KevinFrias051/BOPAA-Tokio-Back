import { Injectable } from '@nestjs/common';
import { IndiceCotizacion } from './entities/indiceCotizacion.entity';
import { Iindice } from './model/iIndice';
import { IindiceCotizacion } from './model/iIndice';
import clienteAxios, { AxiosResponse } from 'axios';
import { baseURL } from 'src/services/axios/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository, Between, MoreThan } from 'typeorm';
import { IFecha } from 'src/model/fecha.model';
import DateMomentUtils from 'src/utils/dateMomentsUtils';
import { Cotizacion } from 'src/cotizacion/entities/cotizacion.entity';
import { Indice } from 'src/indice/entities/indice.entity';

@Injectable()
export class IndiceCotizacionService {
  constructor(
    @InjectRepository(IndiceCotizacion)
    private readonly indiceRepository: Repository<IndiceCotizacion>,
    @InjectRepository(Cotizacion)
    private readonly cotizacionRepository: Repository<Cotizacion>,
    @InjectRepository(Indice)
    private readonly indiceRepositoryBase: Repository<Indice>,
  ) { }


  async calcularIndicesFaltantes(codigosDeEmpresa: string[]): Promise<void> {
    try {
      // Obtener el último índice guardado en la base de datos
      let ultimoIndice: IndiceCotizacion = await this.indiceRepository.findOne({
        where: { codeIndice: Equal('TSE') },
        order: { fecha: 'DESC', hora: 'DESC' },
      });
      
      // Si no hay índices, crear uno inicial con los datos especificos
      if (!ultimoIndice) {
        const indiceBase = await this.indiceRepositoryBase.findOne({ where: { codeIndice: 'TSE' } });
        if (!indiceBase) throw new Error("No se encontró el índice base con codeIndice 'TSE' en la base de datos.");
  
        ultimoIndice = new IndiceCotizacion('2024-01-01', '09:00', 1, indiceBase);
        await this.indiceRepository.save(ultimoIndice);
        console.log(`Índice inicial creado con fecha: ${ultimoIndice.fecha} y hora: ${ultimoIndice.hora}`);
      }
  
      // Calcular rango de fechas y horas
      const fechaDesde = `${ultimoIndice.fecha} ${ultimoIndice.hora}`;
      const fechaHasta = new Date().toISOString().split('T')[0] + ' 23:59:59';
  
      // Filtrar cotizaciones usando Between para rango de fechas y horas
      const nuevasCotizaciones = await this.cotizacionRepository.find({
        where: {
          fecha: Between(fechaDesde, fechaHasta),
        },
        order: { fecha: 'ASC', hora: 'ASC' },
      });
  
      if (nuevasCotizaciones.length === 0) {
        console.log("No se encontraron nuevas cotizaciones para calcular.");
        return;
      }
  
      // Agrupar cotizaciones por hora
      let cotizacionesPorHora: { [key: string]: Cotizacion[] } = {};
      nuevasCotizaciones.forEach((cotizacion) => {
        const fechaHora = `${cotizacion.fecha} ${cotizacion.hora}`;
        if (!cotizacionesPorHora[fechaHora]) cotizacionesPorHora[fechaHora] = [];
        cotizacionesPorHora[fechaHora].push(cotizacion);
      });
      console.log('cotizacionesPorHora:',cotizacionesPorHora)
  
      for (const fechaHora in cotizacionesPorHora) {
        const cotizacionesDeLaHora = cotizacionesPorHora[fechaHora];
        console.log('cotizaciones De LaHora:',cotizacionesDeLaHora)
        const valorIndiceAnterior = ultimoIndice.indiceCotizacion;
        console.log('valor Indice Anterior:',valorIndiceAnterior)
        const cambioPromedioIndice = await this.calcularCambioPromedioIndice();
        console.log('cambio Promedio Indice:',cambioPromedioIndice)
        const valorIndice = parseFloat((valorIndiceAnterior * (1 + (cambioPromedioIndice / 100))).toFixed(2));
  
        const fechaCotizacion = cotizacionesDeLaHora[0].fecha;
        const horaCotizacion = cotizacionesDeLaHora[0].hora;
        const indiceBase = await this.indiceRepositoryBase.findOne({ where: { codeIndice: 'TSE' } });
  
        const nuevoIndice = new IndiceCotizacion(fechaCotizacion, horaCotizacion, valorIndice, indiceBase);
        await this.indiceRepository.save(nuevoIndice);
        console.log(`Índice consolidado guardado para fecha: ${nuevoIndice.fecha} y hora: ${nuevoIndice.hora}`);

        ultimoIndice = nuevoIndice;
      }
    } catch (error) {
      console.error("Error al calcular los índices faltantes:", error);
    }
  }



  // Método para calcular el cambio promedio de los índices basados en las cotizaciones
  async calcularCambioPromedioIndice(): Promise<number> {
    const cambiosPorcentuales = await this.calcularCambiosPorcentuales();
    if (cambiosPorcentuales.length === 0) {
      return 0;
    }
    const sumaCambios = cambiosPorcentuales.reduce((sum, item) => sum + item.cambioPorcentual, 0);
    const promedioCambioIndice = sumaCambios / cambiosPorcentuales.length;
    return promedioCambioIndice;
  }

  // Método para calcular los cambios porcentuales entre cotizaciones consecutivas
  async calcularCambiosPorcentuales(): Promise<{ fecha: string, hora: string, cambioPorcentual: number }[]> {
    const cotizaciones = await this.cotizacionRepository.find({
      order: { fecha: 'ASC', hora: 'ASC' }
    });
    const cambiosPorcentuales: { fecha: string, hora: string, cambioPorcentual: number }[] = [];
    let cotizacionAnterior: Cotizacion | null = null;

    for (const cotizacion of cotizaciones) {
      if (cotizacionAnterior && cotizacion.fecha === cotizacionAnterior.fecha) {
        const cambioPorcentual = ((cotizacion.cotizacion - cotizacionAnterior.cotizacion) / cotizacionAnterior.cotizacion);
        cambiosPorcentuales.push({ fecha: cotizacion.fecha, hora: cotizacion.hora, cambioPorcentual });
      }

      cotizacionAnterior = cotizacion;
    }

    return cambiosPorcentuales;
  }








  /* async guardarIndiceCotizacionDataBase(indice: Indice): Promise<null> {
      //NO HACER, LO QUE HAGO ES PEDIRLO Y GUARDARLO CUANDO GUARDE TODOS
    return
  } */

  //traer los valores indices entre 2 fechas y los guarda
  async buscarIndiceCotizacionGenpresaEntreFechas(codIndice: string, grFecha: string, lrFecha: string): Promise<null> {
    const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/indices/${codIndice}
      /cotizaciones?fechaDesde=${grFecha}&fechaHasta=${lrFecha}`);
    respuesta.data.forEach(indice => {
      /*  const newIndice = new IndiceCotizacion(
        respuesta.data.fecha,
        respuesta.data.hora,
        respuesta.data.codigoIndice,
        respuesta.data.valorIndice,
       ) */
      //this.indiceRepository.save(newIndice)
    }
    )
    return
  }



  //PARA GRAFICAR EN FRONT
  async buscarIndicesDb(): Promise<IndiceCotizacion[]> {
    //buscar por fecha  y hora o entre fechas
    const respuesta = this.indiceRepository.find()

    return respuesta
  }

  //TRAER TODOS LOS INDICES GEMPRESA
  async getAllIndices(): Promise<string[]> {
    let indices: string[]
    try {
      const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/indices`)
      respuesta.data.forEach(indice => {
        indices.push(indice.code)
      })
      console.log(indices)
      return indices
    }
    catch (error) {
      console.error("Error buscando indices:", error);
      throw error;
    }
  }





}
