import { Injectable, Logger } from '@nestjs/common';
import { IndiceCotizacion } from './entities/indiceCotizacion.entity';
import clienteAxios, { AxiosResponse } from 'axios';
import { baseURL } from 'src/services/axios/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository, Between, MoreThan } from 'typeorm';
import { IFecha } from 'src/model/fecha.model';
import DateMomentUtils from 'src/utils/dateMomentsUtils';
import { Cotizacion } from 'src/cotizacion/entities/cotizacion.entity';
import { Indice } from 'src/indice/entities/indice.entity';
import { IndiceService } from 'src/indice/indice.service';

@Injectable()
export class IndiceCotizacionService {
  constructor(
    @InjectRepository(IndiceCotizacion)
    private readonly indiceCotizacionRepository: Repository<IndiceCotizacion>,
    @InjectRepository(Cotizacion)
    private readonly cotizacionRepository: Repository<Cotizacion>,
    @InjectRepository(Indice)
    private readonly indiceRepository: Repository<Indice>,
    private readonly indiceService: IndiceService,
  ) { }
  private readonly logger = new Logger(IndiceCotizacionService.name);


  //Calcula mis indices faltantes y los postea en gempresa
  async calcularIndicesFaltantes(): Promise<void> {
    try {
      let ultimoIndice: IndiceCotizacion = await this.indiceCotizacionRepository.findOne({
        where: { codeIndice: Equal('TSE') },
        order: { fecha: 'DESC', hora: 'DESC' },
      });

      if (!ultimoIndice) {
        const indiceBase = await this.indiceRepository.findOne({ where: { codeIndice: 'TSE' } });
        if (!indiceBase) throw new Error("No se encontró el índice base con codeIndice 'TSE' en la base de datos.");
        ultimoIndice = new IndiceCotizacion('2024-01-01', '09:00', 1, indiceBase);
        await this.indiceCotizacionRepository.save(ultimoIndice);
        /* console.log(`Índice inicial creado con fecha: ${ultimoIndice.fecha} y hora: ${ultimoIndice.hora}`); */
      }

      const fechaDesde = `${ultimoIndice.fecha} ${ultimoIndice.hora}`;
      const fechaHasta = new Date().toISOString().split('T')[0] + ' 23:59:59';
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

      const cotizacionesPorHora: { [key: string]: Cotizacion[] } = {};
      nuevasCotizaciones.forEach((cotizacion) => {
        const fechaHora = `${cotizacion.fecha} ${cotizacion.hora}`;
        if (!cotizacionesPorHora[fechaHora]) cotizacionesPorHora[fechaHora] = [];
        cotizacionesPorHora[fechaHora].push(cotizacion);
      });

      for (const fechaHora in cotizacionesPorHora) {
        const cotizacionesDeLaHora = cotizacionesPorHora[fechaHora];
        const valorIndiceAnterior = ultimoIndice.indiceCotizacion;
        const cambioPromedioIndice = await this.calcularCambioPromedioIndice();
        const valorIndice = parseFloat((valorIndiceAnterior * (1 + cambioPromedioIndice / 1234)).toFixed(4));

        const fechaCotizacion = cotizacionesDeLaHora[0].fecha;
        const horaCotizacion = cotizacionesDeLaHora[0].hora;
        const indiceBase = await this.indiceRepository.findOne({ where: { codeIndice: 'TSE' } });

        const nuevoIndice = new IndiceCotizacion(fechaCotizacion, horaCotizacion, valorIndice, indiceBase);
        //ACA GUARDA EN MI DB (solo para pruebas)
        //await this.indiceCotizacionRepository.save(nuevoIndice);

        /* console.log(`Índice consolidado guardado para fecha: ${nuevoIndice.fecha} y hora: ${nuevoIndice.hora}`); */
        ultimoIndice = nuevoIndice;

        const body = {
          fecha: nuevoIndice.fecha,
          hora: nuevoIndice.hora,
          codigoIndice: 'TSE',
          valorIndice: nuevoIndice.indiceCotizacion,
        };
        //ACA POSTEA A GEMPRESA
        await this.postIndiceCotizacion(body);
      }
      this.logger.log('POSTEADAS TODAS LAS COTIZACIONES DE INDICES A GEMPRESA')
    } catch (error) {
      console.error("Error al calcular los índices faltantes:", error);
    }
  }

  async postIndiceCotizacion(body: { fecha: string; hora: string; codigoIndice: string; valorIndice: number }): Promise<void> {
    try {
      await clienteAxios.post(`${baseURL}/indices/cotizaciones`, body);
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      throw new Error('No se pudo completar la solicitud al API externo.');
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

  // TRAE TODAS LAS COTIZACIONES FALTANTES DE GEMPRESA Y LAS GUARDA EN DB
  async saveAllIndicesCotizacion(): Promise<null> {
    const arrCodigos = await this.indiceService.getAllcodsindices()
    await Promise.all(arrCodigos.map(async (codigo) => {
      const fechaUltimaDb = await this.findLastCotizacionDb(codigo);
      const strUltimaDb = DateMomentUtils.formatFechaHora(fechaUltimaDb)
      const fechaUltimaGnpresa = await DateMomentUtils.getLastDateCotizacion()
      const strUltimaGnpresa = DateMomentUtils.formatFechaHora(fechaUltimaGnpresa)
      await this.buscarIndiceCotizacionGenpresaEntreFechas(codigo, strUltimaDb, strUltimaGnpresa);
    }));
    return
  }

  async findLastCotizacionDb(codIndice: string): Promise<IFecha> {
    try {
      const indice = this.buscarIndicesDb(codIndice)
      if (!indice) {
        console.log(`No se encontró un indice con:: ${codIndice}`);
        return null;
      }
      const lastCotizacion: IndiceCotizacion[] = await this.indiceCotizacionRepository.find(
        {
          where: { codeIndice: Equal(codIndice) },
          order: { id: "DESC" },
          take: 1,
        })
      const dateCotizacion = lastCotizacion[0];
      if (!dateCotizacion || !dateCotizacion.fecha) {
        const fecha: IFecha = { fecha: '2024-01-01', hora: '00:00' }
        console.log(`NO SE ENCONTRO FECHA PARA ${codIndice}, ASIGNADA FECHA:'2024-01-01' HORA:'00:00'`)
        return fecha;
      } else {
        const fecha: IFecha = DateMomentUtils.transformGMTFechaHora(dateCotizacion.fecha, dateCotizacion.hora);
        return fecha;
      }
    } catch (error) {
      console.error("Error al encontrar la última cotización:", error);
      return null;
    }
  }

  async buscarIndiceCotizacionGenpresaEntreFechas(codIndice: string, grFecha: string, lrFecha: string): Promise<null> {
    try {
      const respuesta: AxiosResponse<any, any> = await clienteAxios.get(
        `${baseURL}/indices/${codIndice}/cotizaciones?fechaDesde=${grFecha}&fechaHasta=${lrFecha}`
      );
      if (!respuesta.data || !Array.isArray(respuesta.data)) {
        console.error('La respuesta no contiene un array de cotizaciones');
        return null;
      }
      respuesta.data.forEach(async (item: any) => {
        const { fecha, hora, valor, code } = item;
        const newIndice = new IndiceCotizacion(fecha, hora, valor, code);
        console.log(newIndice);
        await this.indiceCotizacionRepository.save(newIndice);
      });

      return null;
    } catch (error) {
      console.error('Error al buscar cotizaciones:', error);
      return null;
    }
  }


  async getallCotizacions(codIndice: string): Promise<IndiceCotizacion[]> {
    try {
      const indice = await this.indiceRepository.findOne({
        where: { codeIndice: Equal(codIndice) },
      });
      if (!indice) {
        console.log(`No se encontró un índice con codIndice: ${codIndice}`);
        return [];
      }
      const allCotizacions: IndiceCotizacion[] = await this.indiceCotizacionRepository.find({
        where: { codeIndice: Equal(indice.codeIndice) },
        order: { fecha: 'ASC', hora: 'ASC' },
      });
      const validCotizacions = allCotizacions.filter(item => {
        const isValidDate = !isNaN(new Date(item.fecha).getTime());
        return isValidDate;
      });

      return validCotizacions;
    } catch (error) {
      console.error("Error getallCotizacions:", error);
      return [];
    }
  }


  async buscarIndicesDb(indice: string): Promise<IndiceCotizacion> {
    const respuesta = this.indiceCotizacionRepository.findOne({
      where: { codeIndice: Equal(indice) }
    }
    )
    return respuesta
  }

  async getAllIndices(): Promise<string[]> {
    let indices: string[]
    try {
      const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/indices`)
      respuesta.data.forEach(indice => {
        indices.push(indice.code)
      })
      /* console.log(indices) */
      return indices
    }
    catch (error) {
      console.error("Error buscando indices:", error);
      throw error;
    }
  }





}
