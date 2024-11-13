import { Module } from '@nestjs/common';
import { indiceCotizacionController } from './indiceCotizacion.controller';
import { IndiceCotizacion } from './entities/indiceCotizacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndiceCotizacionService } from './indiceCotizacion.service';
import { Cotizacion } from 'src/cotizacion/entities/cotizacion.entity';
import { Indice } from 'src/indice/entities/indice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndiceCotizacion,Cotizacion,Indice])],
  controllers: [indiceCotizacionController],
  providers: [IndiceCotizacionService],
})
export class IndiceCotizacionModule {}
