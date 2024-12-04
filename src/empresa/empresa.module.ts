import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmpresaControllers } from "./empresa.controller";
import { EmpresaService } from "./empresa.service";
import { Empresa } from "./entities/empresa.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Empresa])],
  controllers: [EmpresaControllers],
  providers: [EmpresaService],
  exports:[EmpresaService]
})
export class EmpresaModule{};


