import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpresaModule } from './empresa/empresa.module';
import { CotizacionesModule } from './cotizacion/cotizacion.module';
import { IndiceCotizacionModule } from './indiceCotizaciones/indiceCotizacion.module';
import { IndiceModule } from './indice/indice.module';
import { GenDataService } from './services/gendata.cron.service';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'bopaa',
    synchronize: false,
    entities: ['dist/**/*.entity.js'],
    logging: 'all',
  }),
  ScheduleModule.forRoot(),
  EmpresaModule,
  CotizacionesModule,
  IndiceCotizacionModule,
  IndiceModule,
],
  controllers: [AppController],
  providers: [AppService,GenDataService],
})
export class AppModule {}
