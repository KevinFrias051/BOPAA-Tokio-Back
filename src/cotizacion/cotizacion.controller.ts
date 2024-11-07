import { Body, Controller, Get, Param, Query } from "@nestjs/common";
import { CotizacionesService } from "./cotizacion.service";
import { Cotizacion } from "./entities/cotizacion.entity";
import DateMomentUtils from "src/utils/dateMomentsUtils";

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
        DateMomentUtils.cotDia(grFecha), DateMomentUtils.cotDia(lrFecha));
    }

    //traer todas las cotizaciones del dia GMT
    //a partir de la fecha seleccionada, trae todas las cotizaciones correspoindientes filtradas
    @Get('/dia/:codEmpresa')
    public getCotizacionesDia(@Param('codEmpresa') codEmpresa: string,
      @Query('fecha') fecha: string,
    ): Promise<Cotizacion[]> {
      return this.cotizacionesService.getCotizacionesxDiaCodGMT(codEmpresa, 
        DateMomentUtils.cotDia(fecha),
        DateMomentUtils.sumaHoras(fecha, 8));
    }

    

}
