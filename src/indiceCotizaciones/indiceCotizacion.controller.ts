import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IndiceCotizacionService } from './indiceCotizacion.service';
import { EmpresaService } from 'src/empresa/empresa.service';


@Controller('IndiceCotizacion')
export class indiceCotizacionController {
  constructor(private readonly indiceCotizacionService: IndiceCotizacionService,
    private readonly empresaService: EmpresaService
  ) {}

  @Get('/CalcularIndicesYguardarlosDb')
    async guardarIndiceCotizacionEnDB(){
      const arrCodigosEmpresas = await this.empresaService.getAllcodsEmpresa()
      await this.indiceCotizacionService.calcularIndicesFaltantes(arrCodigosEmpresas)
    }
  
  @Post()
  async postIndiceCotizacion(@Body() body: { fecha: string; hora: string;codigoIndice: string; valorIndice: number }): Promise<void> {
    await this.indiceCotizacionService.postIndiceCotizacion(body);
  }

  @Get('saveAllIndicesCotizacion')
  async saveAllIndicesCotizacion():Promise<void>{
    await this.indiceCotizacionService.saveAllIndicesCotizacion();
  }
}
