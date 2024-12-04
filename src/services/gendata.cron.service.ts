/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CotizacionesService } from 'src/cotizacion/cotizacion.service';
import { EmpresaService } from 'src/empresa/empresa.service';
import { IndiceService } from 'src/indice/indice.service';
import { IndiceCotizacionService } from 'src/indiceCotizaciones/indiceCotizacion.service';

@Injectable()
export class GenDataService {
  private readonly logger = new Logger(GenDataService.name);
  constructor(
    private readonly cotizacionesService: CotizacionesService,
    private readonly indiceService:IndiceService,
    private readonly indiceCotizacionesService:IndiceCotizacionService,
    private readonly empresaService:EmpresaService
    
    ) {
    this.logger.log('Servicio Gen Data Inicializado');
  }


  @Cron('1 0 * * * *')
  //GUARDA TODAS LAS COTIZACIONES FALTANTES EN MI DB
  async getLastCotizaciones() {
    const arrCodigosEmpresas = ['GOOGL', 'NVDA', 'NESN.SW', 'KO', 'BA', 'WMT', 'SHEL'];
    for (const codigo of arrCodigosEmpresas) {
      await this.empresaService.saveEmpresaDbByCod(codigo);
    }
    this.logger.log("Todas las empresas fueron guardadas correctamente.");
    
      await Promise.all(arrCodigosEmpresas.map(async (codigo) => {
        console.log('codigo:',codigo)
        await this.cotizacionesService.saveAllCotizacionesDb(codigo);
      }));
      this.logger.log('Todas las cotizaciones se han guardado correctamente.');
  }


  @Cron('1 4 * * * *')
  async getIndiceCotizacion() {
    //guarda todos los indices de gempresa en db
    await this.indiceService.saveAllIndicesDb();
    this.logger.log('guardado los indices en db')
  }

  @Cron('1 5 * * * *')
  async postIndiceCotizacion() {

    //Calcula mis indices faltantes y los postea a gempresa
    await this.indiceCotizacionesService.calcularIndicesFaltantes()
    this.logger.log('Calculado y posteado indices TSE en gempresa')
    this.logger.log('Ejecución del cron indiceCotizacionesService:', new Date().toISOString());
  }

  @Cron('1 10 * * * *')
  //Guarda cotizaciones indices faltantes en db
  async getIndiceCotizaciones() {
    await this.indiceCotizacionesService.saveAllIndicesCotizacion()
    this.logger.log('guardado los indices Cotizaciones en Db')
    this.logger.log('Ejecución del cron getIndiceCotizaciones : ', new Date().toISOString());
  }


}
