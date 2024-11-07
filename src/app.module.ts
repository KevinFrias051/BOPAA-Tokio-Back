import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpresaModule } from './empresa/empresa.module';
import { CotizacionesModule } from './cotizacion/cotizacion.module';

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
  EmpresaModule,
  CotizacionesModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
