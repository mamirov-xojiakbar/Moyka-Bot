import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Bot } from './bot.model';

interface ICarCreationAttr {
  model: string;
  number: string;
  color: string;
  userId: number;
  text_status: string;
}

@Table({ tableName: 'car' })
export class Car extends Model<Car, ICarCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;
  @Column({
    type: DataType.STRING,
  })
  model: string;
  @Column({
    type: DataType.STRING,
  })
  number: string;
  @Column({
    type: DataType.STRING,
  })
  color: string;
  @ForeignKey(() => Bot)
  @Column({
    type: DataType.BIGINT,
  })
  userId: number;

  @Column({
    type: DataType.STRING,
    defaultValue: 'car_model',
  })
  text_status: string;

  @BelongsTo(() => Bot)
  user: Bot;
}
