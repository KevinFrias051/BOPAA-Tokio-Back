import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { AxiosResponse } from 'axios';
import clienteAxios from 'axios';
import { baseURL } from 'src/services/axios/config';


@Injectable()
export class EmpresaService {
  private empresas: Empresa[] = []

  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>
  ) { }

  async getEmpresa(): Promise<Empresa> {
    try {
      const respuesta: AxiosResponse<any, any> = await clienteAxios.get(baseURL)
      console.log('respuesta.data:',respuesta.data)
      return respuesta.data
    } catch (error) {

    }
  }
  async getEmpresaByCod(codEmpresa:string): Promise<Empresa> {
    try {
      const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}/details`)

      console.log('respuesta.data:',respuesta.data)
      return respuesta.data
    } catch (error) {
    }
  }

  async saveEmpresaDbByCod(codEmpresa:string): Promise<Empresa> {
    try {
      if(await this.findEmpresaDbByCod(codEmpresa) == null){
        const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/empresas/${codEmpresa}/details`)
        const empresa = new Empresa(
          respuesta.data.codempresa,
          respuesta.data.empresaNombre,
          respuesta.data.cotizationInicial,
          respuesta.data.cantidadAcciones
        );
        const savedEmpresa = await this.empresaRepository.save(empresa)

        console.log('Empresa guardada:(emp.service.back)', savedEmpresa);
        return savedEmpresa;
      }
      else{
        console.log('La empresa ya existe en la base de datos')
      }
    } catch (error) {
      console.error("Error al guardar la empresa:", error);
      throw error;
    }
  }

  async saveEmpresas(): Promise<void> {
    const arrCodigosEmpresas = await this.getAllcodsEmpresa()

    try {
        // Ciclo secuencial para guardar las empresas
        for (const codEmpresa of arrCodigosEmpresas) {
            await this.saveEmpresaDbByCod(codEmpresa);  // Llamamos a la función asincrónica para cada empresa
        }

        console.log('Todas las empresas fueron guardadas correctamente.');
    } catch (error) {
        console.error('Error al guardar las empresas:', error);
    }
}

  async findEmpresaDbByCod(codEmp:string): Promise<Empresa>{
    try {
      const empresas:Empresa=await this.empresaRepository.findOne({
        where:{codEmpresa: codEmp},
      })
      return empresas
    } catch (error) {
      console.error("Error buscando empresa:", error);
      throw error;
    }
  }

  async findEmpresas(): Promise<Empresa[]>{
    console.log('entro a find empresas')
    try {
      const empresas:Empresa[]=await this.empresaRepository.find({
      })
      return empresas
    } catch (error) {
      console.error("Error buscando empresas:", error);
      throw error;
    }
  }


  ///////TRAER TODOS LOS CODIGOS DE MIS EMPRESAS
  async getAllcodsEmpresa():Promise<string[]>{
    try {
      const empresas:Empresa[]=await this.empresaRepository.find({ })
      const arrCodigos: string[] = [];
      empresas.map((cod)=>{
        arrCodigos.push(cod.codEmpresa);
      })
      return arrCodigos
    } catch (error) {
      console.error("Error buscando empresas:", error);
      throw error;
    }
  }


}