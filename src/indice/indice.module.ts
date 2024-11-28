import { Module } from '@nestjs/common';
import { IndiceService } from './indice.service';
import { IndiceController } from './indice.controller';
import { Indice } from './entities/indice.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Indice])],
  controllers: [IndiceController],
  providers: [IndiceService],
  exports: [IndiceService]
})
export class IndiceModule { }
