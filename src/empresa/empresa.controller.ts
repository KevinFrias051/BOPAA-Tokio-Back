import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Empresa } from './entities/empresa.entity';
import { EmpresaService } from './empresa.service';

@Controller('empresas')

export class EmpresaControllers {
  constructor(private readonly empresaService: EmpresaService) { }



  @Get('/:codEmp')
  async getAll(@Param('codEmp') codEmp: string): Promise<Empresa> {
    return this.empresaService.getEmpresaByCod(codEmp)
  }

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
      console.log('entro')
      console.log('this.empresaService.findEmpresas():',await this.empresaService.findEmpresas())
      return await this.empresaService.findEmpresas();    
    } catch (error) {
      console.error(error)
    }
  }


  @Post('/saveall')
  async saveEmpresasDb(): Promise<void> {
    console.log("Todas las empresas");
    const arrCodigosEmpresas = ['GOOGL', 'NVDA', 'NESN.SW', 'KO', 'BA', 'WMT', 'SHEL'];

    try {
      for (const codigo of arrCodigosEmpresas) {
        await this.empresaService.saveEmpresaDbByCod(codigo); 
    }
      console.log("Todas las empresas fueron guardadas correctamente.");
    } catch (error) {
      console.error("Error al guardar las empresas:", error);
    }
  }
}