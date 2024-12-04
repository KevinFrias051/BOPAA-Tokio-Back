import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpresaModule } from './empresa/empresa.module';
import { CotizacionesModule } from './cotizacion/cotizacion.module';
import { IndiceCotizacionModule } from './indiceCotizaciones/indiceCotizacion.module';
import { IndiceModule } from './indice/indice.module';
import { GenDataService } from './services/gendata.cron.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', 
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        synchronize: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: configService.get<string>('DB_LOGGING') as any,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    EmpresaModule,
    CotizacionesModule,
    IndiceCotizacionModule,
    IndiceModule,
  ],
  controllers: [AppController],
  providers: [AppService, GenDataService],
})
export class AppModule {}




//import { Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';
//import { EmpresaModule } from './empresa/empresa.module';
//import { CotizacionesModule } from './cotizacion/cotizacion.module';
//import { IndiceCotizacionModule } from './indiceCotizaciones/indiceCotizacion.module';
//import { IndiceModule } from './indice/indice.module';
//import { GenDataService } from './services/gendata.cron.service';
//import { ScheduleModule } from '@nestjs/schedule';
//
//
//@Module({
//  imports: [TypeOrmModule.forRoot({
//    type: 'mysql',
//    host: 'mysql',
//    port: 3306,
//    username: 'root',
//    password: 'root',
//    database: 'bopaa',
//    synchronize: false,
//    entities: ['dist/**/*.entity.js'],
//    logging: 'all',
//  }),
//  ScheduleModule.forRoot(),
//  EmpresaModule,
//  CotizacionesModule,
//  IndiceCotizacionModule,
//  IndiceModule,
//],
//  controllers: [AppController],
//  providers: [AppService,GenDataService],
//})
//export class AppModule {}
