import { Controller, Get, Post, Body,  Param, Logger } from '@nestjs/common';
import { IndiceCotizacionService } from './indiceCotizacion.service';
import { EmpresaService } from 'src/empresa/empresa.service';
import { IndiceCotizacion } from './entities/indiceCotizacion.entity';


@Controller('IndiceCotizacion')
export class indiceCotizacionController {
  constructor(private readonly indiceCotizacionService: IndiceCotizacionService,
    private readonly empresaService: EmpresaService
  ) { }
  private readonly logger = new Logger(indiceCotizacionController.name);
  
  @Get('/CalcularIndicesYguardarlosDb')
  async guardarIndiceCotizacionEnDB() {
    await this.indiceCotizacionService.calcularIndicesFaltantes()
    this.logger.log('Se calcularon todos los indices.');
  }

  @Post()
  async postIndiceCotizacion(@Body() body: { fecha: string; hora: string; codigoIndice: string; valorIndice: number }): Promise<void> {
    await this.indiceCotizacionService.postIndiceCotizacion(body);
  }

  @Get('saveAllIndicesCotizacion')
  async saveAllIndicesCotizacion(): Promise<void> {
    await this.indiceCotizacionService.saveAllIndicesCotizacion();
    this.logger.log('Todas las cotizaciones indices se han guardado correctamente.');
  }

  @Get('getAllIndiceCotizacionByCod/:codIndice')
  async getallCotizacions(
    @Param('codIndice') codIndice: string
  ): Promise<IndiceCotizacion[]> {
    return await this.indiceCotizacionService.getallCotizacions(codIndice)
  }
}
