import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IndiceService } from './indice.service';
import { Iindice } from './model/iIndice';
import { IndiceCotizacion } from './model/iIndice';
import { Indice } from './entities/indice.entity';


@Controller('indice')
export class IndiceController {
  constructor(private readonly indiceService: IndiceService) { }

  @Get('/saveDb')
  public async saveAllIndices(): Promise<Indice[]> {
    return await this.indiceService.saveAllIndicesDb()
  }

  @Post()
  async createIndice(@Body() body: { code: string; name: string },): Promise<void> {
    await this.indiceService.createIndice(body);
  }


  @Get('/getAllcodsIndice')
  async getAllCodsIndices(): Promise<string[]> {
    await this.indiceService.saveAllIndicesDb()
    return await this.indiceService.getAllcodsindices()
  }
}

