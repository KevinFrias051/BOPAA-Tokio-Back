import { Module } from '@nestjs/common';
import { indiceCotizacionController } from './indiceCotizacion.controller';
import { IndiceCotizacion } from './entities/indiceCotizacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndiceCotizacionService } from './indiceCotizacion.service';
import { Cotizacion } from 'src/cotizacion/entities/cotizacion.entity';
import { Indice } from 'src/indice/entities/indice.entity';
import { EmpresaModule } from 'src/empresa/empresa.module';
import { IndiceModule } from 'src/indice/indice.module';

@Module({
  imports: [TypeOrmModule.forFeature([IndiceCotizacion,Cotizacion,Indice]),EmpresaModule,IndiceModule],
  controllers: [indiceCotizacionController],
  providers: [IndiceCotizacionService],
  exports:[IndiceCotizacionService]
})
export class IndiceCotizacionModule {}
