import { Injectable, } from '@nestjs/common';
import { Cotizacion } from './entities/cotizacion.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import clienteAxios from 'axios';
import { baseURL } from 'src/Services/axios/config';
import DateMomentUtils from 'src/utils/dateMomentsUtils';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Injectable()
export class CotizacionesService {
  constructor(@InjectRepository(Cotizacion)
  private readonly cotizacionRepository: Repository<Cotizacion>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>) { }

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
      }else {
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



  //TRAE LAS COTIZACIONES DEL DIA ENTRE DOS FECHAS Y LAS MODIFICA PARA TENER HORARIO LOCAL
  public async getCotizacionesEntreFechasByCodGMT(codEmpresa: string, grFecha: string, lrFecha: string): Promise<Cotizacion[]> {
    const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}/cotizaciones?fechaDesde=${grFecha}&fechaHasta=${lrFecha}`);

    return respuesta.data;
    //guardar filtradas y modificadas utc en la db
  }

  //TRAE LAS COTIZACIONES DEL DIA Y LAS MODIFICA PARA TENER HORARIO LOCAL. Y LAS GUARDA EN DB
  public async getCotizacionesxDiaCodGMT(codEmpresa: string, grFecha: string, lrFecha: string): Promise<Cotizacion[]> {
    const empresa = await this.empresaRepository.findOne({ where: { codEmpresa } });
    if (!empresa) {
      throw new Error(`La empresa con codEmpresa ${codEmpresa} no existe.`);
    }
    const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}/cotizaciones?fechaDesde=${grFecha}&fechaHasta=${lrFecha}`);
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


