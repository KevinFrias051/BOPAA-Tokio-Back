import { Body, Controller, Get, Param, Query } from "@nestjs/common";
import { CotizacionesService } from "./cotizacion.service";
import { Cotizacion } from "./entities/cotizacion.entity";

@Controller('/cotizaciones')
export class CotizacionesController {
  constructor(private cotizacionesService: CotizacionesService) { }

  @Get('/:codEmpresa')
  public getCotizacionesByEmpresa(@Param('codEmpresa') codEmpresa: string,
  @Query('grFecha') grFecha:string,
  @Query('lrFecha') lrFecha:string,
  ): Promise <Cotizacion[]> {
    return this.cotizacionesService.getCotizacionesEntreFechasByCodEmp(codEmpresa,grFecha,lrFecha);
  }

  @Get('/cotizacion/:codEmpresa')
  public getCotizacionByFechaHora(@Param('codEmpresa') codEmpresa: string,
  @Query('fecha') fecha:string,
  @Query('hora') hora:string,
):Promise <Cotizacion>{
    return this.cotizacionesService.getCotizacionByFechaHora(codEmpresa,fecha,hora)
  }





}
