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
import { IEmpresa } from './model/iEmpresa';

@Controller('empresas')

export class EmpresaControllers {
  constructor(private readonly empresaService: EmpresaService) { }



  @Get('/:codEmp')
  async getAll(@Param('codEmp') codEmp: string): Promise<Empresa> {
    return this.empresaService.getEmpresaByCod(codEmp)
  }

  @Get('/save/:codEmp')
  async saveEmpresa(@Param('codEmp') codEmp: string): Promise<Empresa> {
    return this.empresaService.saveEmpresaDbByCod(codEmp)
  }

  @Get('/find/:codEmp')
  async findEmpresa(@Param('codEmp') codEmp: string): Promise<Empresa> {
    return this.empresaService.findEmpresaDbByCod(codEmp)
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