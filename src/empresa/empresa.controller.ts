import {
  Controller,
  Get,
  Param,
  Post,
  Logger
} from '@nestjs/common';
import { Empresa } from './entities/empresa.entity';
import { EmpresaService } from './empresa.service';

@Controller('empresas')

export class EmpresaControllers {
  constructor(private readonly empresaService: EmpresaService) { }
  private readonly logger = new Logger(EmpresaControllers.name);


  @Get('/getAll')
  async getAllEmpresas(): Promise<Empresa[]> {
    return this.empresaService.findEmpresas()
  }

  @Get('/save/:codEmp')
  async saveEmpresa(@Param('codEmp') codEmp: string): Promise<Empresa> {
    return this.empresaService.saveEmpresaDbByCod(codEmp)
  }

  @Get('/find/:codEmp')
  async findEmpresa(@Param('codEmp') codEmp: string): Promise<Empresa> {
    return this.empresaService.findEmpresaDbByCod(codEmp)
  }

  @Get('/buscar/db')
  async findEmpresas(): Promise<Empresa[]> {
    try {
      return await this.empresaService.findEmpresas();
    } catch (error) {
      console.error(error)
    }
  }

  @Post('/saveall')
  async saveEmpresasDb(): Promise<void> {
    /* console.log("Todas las empresas"); */
    const arrCodigosEmpresas = await this.getAllcodsEmpresa()
    try {
      for (const codigo of arrCodigosEmpresas) {
        await this.empresaService.saveEmpresaDbByCod(codigo);
      }
      this.logger.log("Todas las empresas fueron guardadas correctamente.");
    } catch (error) {
      console.error("Error al guardar las empresas:", error);
    }
  }

  @Get('/getAllcodsEmpresa')
  async getAllcodsEmpresa(): Promise<string[]> {
    return await this.empresaService.getAllcodsEmpresa()
  }
}