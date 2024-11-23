import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cotizacion } from './entities/cotizacion.entity';
import { CotizacionesController } from './cotizacion.controller';
import { CotizacionesService } from './cotizacion.service';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { EmpresaModule } from 'src/empresa/empresa.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cotizacion,Empresa]),EmpresaModule],
  controllers: [CotizacionesController],
  providers: [CotizacionesService],
  exports: [CotizacionesService],
})

export class CotizacionesModule {}