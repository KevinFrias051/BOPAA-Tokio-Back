import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IndiceCotizacionService } from './indiceCotizacion.service';


@Controller('IndiceCotizacion')
export class indiceCotizacionController {
  constructor(private readonly indiceCotizacionService: IndiceCotizacionService) {}

  @Get('/CalcularIndicesYguardarlosDb')
    async guardarIndiceCotizacionEnDB(){
      const arrCodigosEmpresas = ['GOOGL', 'NVDA', 'NESN.SW', 'KO', 'BA', 'WMT', 'SHEL'];
      await this.indiceCotizacionService.calcularIndicesFaltantes(arrCodigosEmpresas)
    }
}
