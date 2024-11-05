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
  async getAll(@Param('codEmp') codEmp:string):Promise<Empresa>{
    return this.empresaService.getEmpresaByCod(codEmp)
  }

  @Get('/save/:codEmp')
  async saveEmpresa(@Param('codEmp') codEmp:string):Promise<Empresa>{
    return this.empresaService.saveEmpresaDbByCod(codEmp)
  }

  @Get('/find/:codEmp')
  async findEmpresa(@Param('codEmp') codEmp:string):Promise<Empresa>{
    return this.empresaService.findEmpresaDbByCod(codEmp)
  }


}