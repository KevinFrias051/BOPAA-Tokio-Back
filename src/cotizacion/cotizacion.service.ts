import { Injectable, } from '@nestjs/common';
import { Cotizacion } from './entities/cotizacion.entity';
import { Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import clienteAxios from 'axios';
import { baseURL } from 'src/Services/axios/config';
import DateMomentUtils from 'src/utils/dateMomentsUtils';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { IFecha } from 'src/model/fecha.model';

@Injectable()
export class CotizacionesService {
  constructor(@InjectRepository(Cotizacion)
  private readonly cotizacionRepository: Repository<Cotizacion>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>) { }

  //TRAE LA FECHA Y HORA DE LA ULTIMA COTIZACION DE GMPRESA
  public async lastDateCotizacionGmpresa(): Promise<IFecha> {
    const fecha = DateMomentUtils.getLastDateCotizacion()
    console.log('FECHA ULTIMA COTIZACION GEMPRESA:', fecha)
    return fecha;
  }

  //RETORNA LA FECHA DE LA ULTIMA COTZACION GUARDADA EN DB DE UNA EMPRESA
  async findLastCotizacionDb(codEmp: string): Promise<IFecha> {
    try {
      console.log('codEmp:', codEmp)
      const empresa = await this.empresaRepository.findOne({
        where: { codEmpresa: codEmp },
      })
      if (!empresa) {
        console.log(`No se encontró una empresa con codEmpresa: ${codEmp}`);
        return null;
      }
      const lastCotizacion: Cotizacion[] = await this.cotizacionRepository.find(
        {
          where: { codEmpresa: Equal(empresa.codEmpresa) },
          order: { id: "DESC" },
          take: 1,
        })
      const dateCotizacion = lastCotizacion[0];
      if (!dateCotizacion || !dateCotizacion.fecha) {
        const fecha: IFecha = DateMomentUtils.transformGMTFechaHora('2024-01-01', '00:00');
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


  public async getCotizacionesEntreFechasByCodEmpUCT(codEmpresa: string, grFecha: string, lrFecha: string): Promise<Cotizacion[]> {
    const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}/cotizaciones?fechaDesde=${grFecha}&fechaHasta=${lrFecha}`);
    return respuesta.data;
    //guardar filtradas y modificadas utc en la db
  }

  public async getCotizacionByFechaHora(codEmpresa: string, fecha: string, hora: string): Promise<Cotizacion> {
    const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}/cotizacion/?fecha=${fecha}&hora=${hora}`);
    return respuesta.data
  }

  //GUARDA EN LA DB LA COTIZACION ENVIADA POR PARAMETRO
  public async saveCotizacionDb(cotizacion: Cotizacion) {
    try {

      if (await this.findCotizacionById(cotizacion.id) == null) {
        const savedCotizacion = await this.cotizacionRepository.save(cotizacion)
        return savedCotizacion;
      } else {
        console.log('La cotizacion ya existe en la base de datos')
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
  public async getCotizacionesEntreFechasByCodGMT(codEmpresa: string, grFecha: string, lrFecha: string): Promise<Cotizacion[]> {
    const empresa = await this.empresaRepository.findOne({ where: { codEmpresa } });
    //filtrado hora local
    const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}
      /cotizaciones?fechaDesde=${grFecha}&fechaHasta=${lrFecha}`);
    respuesta.data.forEach(cotizacion => {
      const fechaGmt = DateMomentUtils.transformGMTFechaHora(cotizacion.fecha, cotizacion.hora)
      if (DateMomentUtils.horasHabiles.includes(fechaGmt.hora)) {
        const newCotizacion = new Cotizacion(
          cotizacion.id,
          fechaGmt.fecha,
          fechaGmt.hora,
          cotizacion.cotization,
          empresa
        )
        this.saveCotizacionDb(newCotizacion)
      }
    });
    return respuesta.data;

  }

  /* GUARDAR  LAS COTIZACIONES FALTANTES DE UNA EMPRESA EN LA DB
  SI LA EMPRESA NO TIENE COTIZACIONES O LE FALTAN LAS COMPLETA 
  PIDIENDOSELAS A GMPRESA  */
  public async saveAllCotizacionesDb(codEmp:string){
    const fechaUltimaDb = await this.findLastCotizacionDb(codEmp);
    const strUltimaDb= DateMomentUtils.formatFechaHora(fechaUltimaDb)
    console.log('strUltimaDb:',strUltimaDb)
    const fechaUltimaGnpresa = await this.lastDateCotizacionGmpresa();
    const strUltimaGnpresa=DateMomentUtils.formatFechaHora(fechaUltimaGnpresa)
    console.log('strUltimaGnpresa:',strUltimaGnpresa)
    this.getCotizacionesEntreFechasByCodGMT(codEmp,strUltimaDb,strUltimaGnpresa)
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
    //guardar filtradas y modificadas utc en la db
  }





}


