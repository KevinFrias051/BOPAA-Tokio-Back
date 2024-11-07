import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cotizacion } from './entities/cotizacion.entity';
import { CotizacionesController } from './cotizacion.controller';
import { CotizacionesService } from './cotizacion.service';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cotizacion,Empresa])],
  controllers: [CotizacionesController],
  providers: [CotizacionesService],
})

export class CotizacionesModule {}