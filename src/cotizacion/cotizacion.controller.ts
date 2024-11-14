import { Body, Controller, Get, Param, Query } from "@nestjs/common";
import { CotizacionesService } from "./cotizacion.service";
import { Cotizacion } from "./entities/cotizacion.entity";
import DateMomentUtils from "src/utils/dateMomentsUtils";
import { IFecha } from "src/model/fecha.model";

@Controller('/cotizaciones')
export class CotizacionesController {
  constructor(private cotizacionesService: CotizacionesService) { }

  /* METODOS UTC */

  @Get('/UTC/:codEmpresa')
  public getCotizacionesEntreFechasByCodEmpUCT(@Param('codEmpresa') codEmpresa: string,
    @Query('grFecha') grFecha: string,
    @Query('lrFecha') lrFecha: string,
  ): Promise<Cotizacion[]> {
    return this.cotizacionesService.getCotizacionesEntreFechasByCodEmpUCT(codEmpresa, grFecha, lrFecha);
  }

  @Get('/cotizacion/:codEmpresa')
  public getCotizacionByFechaHora(@Param('codEmpresa') codEmpresa: string,
    @Query('fecha') fecha: string,
    @Query('hora') hora: string,
  ): Promise<Cotizacion> {
    return this.cotizacionesService.getCotizacionByFechaHora(codEmpresa, fecha, hora)
  }


  /* METODOS GMT */

  //Traer cotizaciones del DIA entre Fechas GMT
  //a partir de las fechas seleccionada, trae todas las cotizaciones correspoindientes filtradas
  @Get('/GMT/:codEmpresa')
  public getCotizacionesEntreFechasByCodGMT(@Param('codEmpresa') codEmpresa: string,
    @Query('grFecha') grFecha: string,
    @Query('lrFecha') lrFecha: string,
  ): Promise<Cotizacion[]> {
    return this.cotizacionesService.getCotizacionesEntreFechasByCodGMT(codEmpresa,
      DateMomentUtils.gmtMasNueve(grFecha), DateMomentUtils.gmtMasNueve(lrFecha));
  }

  //traer todas las cotizaciones del dia GMT
  //a partir de la fecha seleccionada, trae todas las cotizaciones correspoindientes filtradas
  @Get('/dia/:codEmpresa')
  public async getCotizacionesDia(
    @Param('codEmpresa') codEmpresa: string,
    @Query('fecha') fecha: string,
  ): Promise<Cotizacion[]> {
    return this.cotizacionesService.getCotizacionesxDiaCodGMT(codEmpresa, fecha);
  }

    //BUSCA Y GUARDA TODAS LAS COTIZACIONES DE GEMPRESA EN DB
  @Get('/last')
  public async getLastCotizacion(): Promise<void> {
    const arrCodigosEmpresas = ['GOOGL', 'NVDA', 'NESN.SW', 'KO', 'BA', 'WMT', 'SHEL'];
  
    for (const codigo of arrCodigosEmpresas) {
      await this.cotizacionesService.saveAllCotizacionesDb(codigo);
    }
  }

  @Get('/participacionBolsa')
  public async getCotizacion(): Promise<any> {
    //const arrCodigosEmpresas = ['nvda'];
    
    let arr: {empresa: string, participacion: number, tipo: string}[] = [];

    const arrCodigosEmpresas = ['GOOGL', 'NVDA', 'NESN.SW', 'KO', 'BA', 'WMT', 'SHEL'];
    
    for (const codigo of arrCodigosEmpresas) {
      const participacion = await this.cotizacionesService.calcularParticipacion(codigo,'DIA');
      arr.push({
        empresa: codigo,
        participacion: parseFloat(participacion.toFixed(2)),
        tipo: "DIA"
      });
    }
    for (const codigo of arrCodigosEmpresas) {
      const participacion = await this.cotizacionesService.calcularParticipacion(codigo,'MES');
      arr.push({
        empresa: codigo,
        participacion: parseFloat(participacion.toFixed(2)),                                                                                               
        tipo: "MES"
      });
    }
    console.log(arr);
    return arr
  }
  

  //falta postear mis indices 
  //falta enviar al front todos los indices

}
