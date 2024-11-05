import { Injectable, } from '@nestjs/common';
import { Cotizacion } from './entities/cotizacion.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import clienteAxios from 'axios';
import { baseURL } from 'src/Services/axios/config';
import { IFecha } from 'src/model/fecha.model';

@Injectable()
export class CotizacionesService {
  constructor(@InjectRepository(Cotizacion) private readonly cotizacionRepository: Repository<Cotizacion>) { }

  public async getCotizacionesEntreFechasByCodEmp(codEmpresa: string,grFecha:string, lrFecha:string): Promise<Cotizacion[]> {
    const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}/cotizaciones?fechaDesde=${grFecha}&fechaHasta=${lrFecha}`); 
    return respuesta.data;
    //guardar filtradas y modificadas utc en la db
  }

  public async getCotizacionByFechaHora(codEmpresa:string,fecha:string,hora:string):Promise<Cotizacion>{
    const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}/cotizacion/?fecha=${fecha}&hora=${hora}`); 
    
    return respuesta.data
  }
  



}
