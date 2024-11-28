import { Controller, Get, Logger, Param, Query } from "@nestjs/common";
import { CotizacionesService } from "./cotizacion.service";
import { Cotizacion } from "./entities/cotizacion.entity";
import DateMomentUtils from "src/utils/dateMomentsUtils";
import { ICotizacionCard } from "./model/iCotizacion";
import { EmpresaService } from "src/empresa/empresa.service";

@Controller('/cotizaciones')
export class CotizacionesController {
  constructor(private cotizacionesService: CotizacionesService, private readonly empresaService: EmpresaService) { }
  private readonly logger = new Logger(CotizacionesController.name);

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

  //LLEVAR LA ULTIMA COTIZACION, SI SUBIO O BAJO EN %, EL VALOR ACTUAL, CODIGOEMP
  @Get('/lastCotizacionEmpByCod/:codEmpresa')
  public async getlastCotizacion(
    @Param('codEmpresa') codEmpresa: string
  ): Promise<ICotizacionCard> {
    return await this.cotizacionesService.getlastCotizacionCard(codEmpresa)
  }


  //TRAER TODAS LAS COTIZACIONES DE DB PARA UNA EMPRESA
  @Get('/allCotizacionEmpByCod/:codEmpresa')
  public async getallCotizacions(
    @Param('codEmpresa') codEmpresa: string
  ): Promise<Cotizacion[]> {
    return await this.cotizacionesService.getallCotizacions(codEmpresa)
  }

  //BUSCA Y GUARDA TODAS LAS COTIZACIONES DE GEMPRESA EN DB
  @Get('/last')
  public async getLastCotizacion(): Promise<void> {
    const arrCodigosEmpresas = await this.empresaService.getAllcodsEmpresa()
    await Promise.all(arrCodigosEmpresas.map(async (codigo) => {
      console.log('codigo:', codigo)
      await this.cotizacionesService.saveAllCotizacionesDb(codigo);
    }));
    this.logger.log('Todas las cotizaciones se han guardado correctamente.');
  }


  @Get('/participacionBolsa')
  public async getCotizacion(): Promise<any> {
    await this.getLastCotizacion();
    const participacionesDia = await this.cotizacionesService.calcularParticipaciones('DIA');
    const participacionesMes = await this.cotizacionesService.calcularParticipaciones('MES');
    const resultado = [
      ...participacionesDia.map(p => ({ ...p, tipo: 'DIA' })),
      ...participacionesMes.map(p => ({ ...p, tipo: 'MES' })),
    ];
    console.log(resultado);
    return resultado;
  }

}
