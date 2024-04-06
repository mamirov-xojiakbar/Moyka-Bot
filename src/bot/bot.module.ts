import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { BotUpdate } from './bot.update';
import { Car } from './models/cars.model';

@Module({
  imports: [SequelizeModule.forFeature([Bot, Car])],
  providers: [BotService, BotUpdate],
  exports: [BotService],
})
export class BotModule {}
