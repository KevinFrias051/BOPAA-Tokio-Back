import { Injectable } from '@nestjs/common';
import { Indice } from './entities/indice.entity';
import clienteAxios, { AxiosResponse } from 'axios';
import { baseURL } from 'src/services/axios/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class IndiceService {
  constructor(@InjectRepository(Indice) private readonly indiceRepository: Repository<Indice>) { }

  async createIndice(body): Promise<void> {
    try {
      await clienteAxios.post(`${baseURL}/indices`, body)
    } catch (error) {
      console.error('El indice ya existe', 409)
    }
  }

  async findIndiceByCod(code: string): Promise<Indice> {
    try {
      const indiceCotizacion: Indice = await this.indiceRepository.findOne({
        where: { codeIndice: code },
      })
      return indiceCotizacion
    } catch (error) {
      console.error("Error buscando indice Cotizacion:", error);
      throw error;
    }
  }

  public async saveAllIndicesDb(): Promise<Indice[]> {
    const respuesta: AxiosResponse<any, any> = await clienteAxios.get(`${baseURL}/indices`);
    /* console.log('respuesta.data:', respuesta.data) */
    const promesasGuardado = respuesta.data.map(async (indice) => {
      if (await this.findIndiceByCod(indice.code) == null) {
        const newIndice = new Indice(
          indice.id,
          indice.code,
          indice.name,
          indice.__v,
        );
        await this.indiceRepository.save(newIndice);
        return newIndice
      } else {
        console.log(`El indice code: ${indice.code} ya existe en la db`)
      }
    }
    );

    await Promise.all(promesasGuardado);
    return respuesta.data;
  }

  //TRAE TODOS LOS CODIGOS DE MIS INDICES
  async getAllcodsindices(): Promise<string[]> {
    try {
      const empresas: Indice[] = await this.indiceRepository.find({})
      const arrCodigos: string[] = [];
      empresas.map((cod) => {
        arrCodigos.push(cod.codeIndice);
      })
      return arrCodigos
    } catch (error) {
      console.error("Error buscando indices:", error);
      throw error;
    }
  }
}