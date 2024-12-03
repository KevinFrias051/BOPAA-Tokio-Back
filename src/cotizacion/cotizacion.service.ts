import { Injectable, Logger } from '@nestjs/common';
import { Cotizacion } from './entities/cotizacion.entity';
import { Between, Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import clienteAxios from 'axios';
import { baseURL } from 'src/Services/axios/config';
import DateMomentUtils from 'src/utils/dateMomentsUtils';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { IFecha } from 'src/model/fecha.model';
import { ICotizacionCard } from './model/iCotizacion';
import { EmpresaService } from 'src/empresa/empresa.service';


@Injectable()
export class CotizacionesService {
  private readonly logger = new Logger(CotizacionesService.name);
  constructor(
    @InjectRepository(Cotizacion)
    private readonly cotizacionRepository: Repository<Cotizacion>,

    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly empresaService: EmpresaService) { }



  //TRAE LA FECHA Y HORA DE LA ULTIMA COTIZACION DE GMPRESA
  public async lastDateCotizacionGmpresa(): Promise<IFecha> {
    const fecha = DateMomentUtils.getLastDateCotizacion()
    return fecha;
  }

  //RETORNA LA FECHA DE LA ULTIMA COTZACION GUARDADA EN DB DE UNA EMPRESA
  async findLastCotizacionDb(codEmp: string): Promise<IFecha> {
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { codEmpresa: codEmp },
      })
      if (!empresa) {
        console.log(`No se encontró una empresa con codEmpresa: ${codEmp}`);
        return null;
      }
      const lastCotizacion: Cotizacion[] = await this.cotizacionRepository.find(
        {
          where: { empresa: Equal(empresa.codEmpresa) },
          order: { id: "DESC" },
          take: 1,
        })
      const dateCotizacion = lastCotizacion[0];

      if (!dateCotizacion || !dateCotizacion.fecha) {
        //Al enviar la fecha en gmt+9 se le asigna una fecha anterior para que la primera sea correcta
        const fecha: IFecha = DateMomentUtils.transformGMTFechaHora('2023-12-31', '01:00');
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

  //GUARDA EN LA DB LA COTIZACION ENVIADA POR PARAMETRO
  public async saveCotizacionDb(cotizacion: Cotizacion) {
    try {

      if (await this.findCotizacionById(cotizacion.id) == null) {
        const savedCotizacion = await this.cotizacionRepository.save(cotizacion)
        return savedCotizacion;
      } else {
      }
    } catch (error) {
      console.error("Error al guardar la cotizacion:", error);
      throw error;
    }
  }

  //CONSULTA A LA DB SI EXISTE UNA COTIZACION CON ESE ID
  async findCotizacionById(idCotizacion: number): Promise<Cotizacion> {
    try {
      const cotizaciones: Cotizacion = await this.cotizacionRepository.findOne({
        where: { id: idCotizacion },
      })
      return cotizaciones
    } catch (error) {
      console.error("Error buscando cotizacion:", error);
      throw error;
    }
  }

  //TRAE LAS COTIZACIONES DEL DIA ENTRE DOS FECHAS, LAS MODIFICA PARA TENER HORARIO LOCAL. Y LAS GUARDA EN LA DB
  public async getCotizacionesEntreFechasByCodGMT(codEmpresa: string
    , grFecha: string, lrFecha: string): Promise<Cotizacion[]> {
    const empresa = await this.empresaRepository.findOne({ where: { codEmpresa } });
    const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}
      /cotizaciones?fechaDesde=${grFecha}&fechaHasta=${lrFecha}`);
    const promesasGuardado = respuesta.data.map(async (cotizacion) => {
      const fechaGmt = DateMomentUtils.transformGMTFechaHora(cotizacion.fecha, cotizacion.hora)
      if (DateMomentUtils.horasHabiles.includes(fechaGmt.hora)) {
        const newCotizacion = new Cotizacion(
          cotizacion.id,
          fechaGmt.fecha,
          fechaGmt.hora,
          cotizacion.cotization,
          empresa
        );
        await this.saveCotizacionDb(newCotizacion);
      }
    });

    await Promise.all(promesasGuardado);
    return respuesta.data;

  }

  /* GUARDA TODAS LAS COTIZACIONES FALTANTES DE UNA EMPRESA EN LA DB */
  public async saveAllCotizacionesDb(codEmp: string) {
    const fechaUltimaDb = await this.findLastCotizacionDb(codEmp);
    const strUltimaDb = DateMomentUtils.formatFechaHora(fechaUltimaDb)
    const fechaUltimaGnpresa = await this.lastDateCotizacionGmpresa();
    const strUltimaGnpresa = DateMomentUtils.formatFechaHora(fechaUltimaGnpresa)
    this.getCotizacionesEntreFechasByCodGMT(codEmp, strUltimaDb, strUltimaGnpresa)
  }


  //TRAE LAS COTIZACIONES DEL DIA Y LAS MODIFICA PARA TENER HORARIO LOCAL. Y LAS GUARDA EN DB
  public async getCotizacionesxDiaCodGMT(codEmpresa: string, fecha: string): Promise<Cotizacion[]> {
    const empresa = await this.empresaRepository.findOne({ where: { codEmpresa } });
    const grFecha = DateMomentUtils.cotDia(fecha);
    const lrFecha = DateMomentUtils.sumaHoras(fecha, 8);
    const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}
      /cotizaciones?fechaDesde=${grFecha}&fechaHasta=${lrFecha}`);
    respuesta.data.forEach(cotizacion => {
      const fechaGmt = DateMomentUtils.transformGMTFechaHora(cotizacion.fecha, cotizacion.hora)
      const newCotizacion = new Cotizacion(
        cotizacion.id,
        fechaGmt.fecha,
        fechaGmt.hora,
        cotizacion.cotization,
        empresa
      )
      this.saveCotizacionDb(newCotizacion)
    });

    return respuesta.data;
  }


  // CALCULO DE PARTICIPACION EMPRESAS
  //seleccion 'DIA' para la participacion diaria
  //seleccion 'MES' para la participacion de los ultimos 30 dias

  async calcularParticipaciones(seleccion: string): Promise<{ empresa: string, participacion: number }[]> {
    const arrCodigosEmpresas = await this.empresaService.getAllcodsEmpresa();
    const datosEmpresas = await Promise.all(arrCodigosEmpresas.map(async (codEmp) => {
      const promedio = seleccion === 'DIA'
        ? await this.calcularPromedioDia(codEmp)
        : await this.calcularPromedioMes(codEmp);
      const cantidadAcciones = await this.cantidadAcciones(codEmp);
      return { codEmp, promedio, cantidadAcciones };
    }));

    let totalMercado = 0;
    const capacitaciones = datosEmpresas.map(({ codEmp, promedio, cantidadAcciones }) => {
      const capitalizacion = promedio * (cantidadAcciones || 0);
      totalMercado += capitalizacion;
      return { codEmp, capitalizacion };
    });
    const participaciones = capacitaciones.map(({ codEmp, capitalizacion }) => ({
      empresa: codEmp,
      participacion: parseFloat((totalMercado > 0 ? (capitalizacion / totalMercado) * 100 : 0).toFixed(2)),
    }));
    return participaciones;
  }

  async calcularPromedioDia(codEmp: string): Promise<number | null> {
    const nowDate = DateMomentUtils.getLastDateCotizacion();
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { codEmpresa: codEmp },
      });
      if (!empresa) {
        console.log(`No se encontró una empresa con codEmpresa: ${codEmp}`);
        return null;
      }
      let lastCotizacions = await this.cotizacionRepository.find({
        where: {
          fecha: nowDate.fecha,
          empresa: Equal(codEmp),
        },
        order: { id: "ASC" },
      });

      if (lastCotizacions.length === 0) {
        const previousDate = DateMomentUtils.quitarDiasAfechaActual(1);
        lastCotizacions = await this.cotizacionRepository.find({
          where: {
            fecha: previousDate.fecha,
            empresa: Equal(codEmp),
          },
          order: { id: "ASC" },
        });
      }

      if (lastCotizacions.length === 0) {
        console.log(`No se encontraron cotizaciones para ${codEmp} en las fechas recientes.`);
        return null;
      }

      const total = lastCotizacions.reduce((acc, el) => acc + Number(el.cotizacion), 0);
      return parseFloat((total / lastCotizacions.length).toFixed(2));
    } catch (error) {
      console.error('Error al calcular el promedio del día:', error);
      return 0;
    }
  }

  async calcularPromedioMes(codEmp: string): Promise<number | null> {
    const nowDate = DateMomentUtils.getLastDateCotizacion();
    const last30Days = DateMomentUtils.quitarDiasAfechaActual(30);
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { codEmpresa: codEmp },
      });
      if (!empresa) {
        console.log(`No se encontró una empresa con codEmpresa: ${codEmp}`);
        return null;
      }

      const lastCotizacions = await this.cotizacionRepository.find({
        where: {
          fecha: Between(last30Days.fecha, nowDate.fecha),
          empresa: Equal(codEmp),
        },
        order: { id: "ASC" },
      });
      if (lastCotizacions.length === 0) {
        console.log(`No se encontraron cotizaciones para ${codEmp} en las fechas recientes.`);
        return null;
      }
      const total = lastCotizacions.reduce((acc, el) => acc + Number(el.cotizacion), 0);
      return parseFloat((total / lastCotizacions.length).toFixed(2));
    } catch (error) {
      console.error('Error al calcular el promedio del mes:', error);
      return 0;
    }
  }

  async cantidadAcciones(codEmp: string): Promise<number | null> {
    const empresa = await this.empresaRepository.findOne({
      where: { codEmpresa: codEmp },
    });
    return empresa ? empresa.cantidadAcciones : null;
  }



  async getlastCotizacionCard(codEmp: string): Promise<ICotizacionCard> {
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { codEmpresa: codEmp },
      })
      if (!empresa) {
        console.log(`No se encontró una empresa con codEmpresa: ${codEmp}`);
        return null;
      }
      const lastCotizacion: Cotizacion[] = await this.cotizacionRepository.find(
        {
          where: { empresa: Equal(empresa.codEmpresa) },
          order: { id: "DESC" },
          take: 2,
        })
      const cambioPorcentual = ((lastCotizacion[0].cotizacion - lastCotizacion[1].cotizacion) / lastCotizacion[1].cotizacion) * 100
      const card: ICotizacionCard = {
        codEmpresa: codEmp,
        nombreEmpresa: empresa.nombreEmpresa,
        valorActual: lastCotizacion[0].cotizacion,
        fluctuacion: parseFloat(cambioPorcentual.toFixed(3)),
      };
      return card
    }
    catch (error) {
      console.error("Error getlastCotizacionCard:", error);
      return null;
    }
  }
  async getallCotizacions(codEmp: string): Promise<Cotizacion[]> {
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { codEmpresa: codEmp },
      })
      if (!empresa) {
        console.log(`No se encontró una empresa con codEmpresa: ${codEmp}`);
        return null;
      }
      const lastCotizacions: Cotizacion[] = await this.cotizacionRepository.find(
        {
          where: { empresa: Equal(empresa.codEmpresa) },
          order: { id: "DESC" },
        })
      /* console.log('lastCotizacions:', lastCotizacions) */
      return Promise.all(lastCotizacions)
    }
    catch (error) {
      console.error("Error getlastCotizacionCard:", error);
      return null;
    }
  }
}


