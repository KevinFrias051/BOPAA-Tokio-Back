/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CotizacionesController } from 'src/cotizacion/cotizacion.controller';
import { CotizacionesService } from 'src/cotizacion/cotizacion.service';
import { Cotizacion } from 'src/cotizacion/entities/cotizacion.entity';
import { EmpresaService } from 'src/empresa/empresa.service';

import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Indice } from 'src/indice/entities/indice.entity';
import { IndiceCotizacion } from 'src/indiceCotizaciones/entities/indiceCotizacion.entity';

@Injectable()
export class GenDataService {
  private readonly logger = new Logger(GenDataService.name);
  constructor(
    private readonly cotizacionesService: CotizacionesService,
    
    ) {
    this.logger.log('Servicio Gen Data Inicializado');
  }


  @Cron('1 0 * * * *')

  async getLastCotizaciones() {

    const arrCodigosEmpresas = ['GOOGL', 'NVDA', 'NESN.SW', 'KO', 'BA', 'WMT', 'SHEL'];
      await Promise.all(arrCodigosEmpresas.map(async (codigo) => {
        console.log('codigo:',codigo)
        await this.cotizacionesService.saveAllCotizacionesDb(codigo);
      }));
    
      console.log('Todas las cotizaciones se han guardado correctamente.');
    //this.cotizacionControler.getLastCotizacion()
  }


  @Cron('1 5 * * * *')
  postIndiceCotizacion() {
    this.logger.log('Ejecución del cron postIndiceCotizacion:', new Date().toISOString());
  }

  @Cron('1 10 * * * *')
  getIndiceCotizaciones() {
    this.logger.log('Ejecución del cron getIndiceCotizaciones : ', new Date().toISOString());
  }


}
