import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IBotCreationAttr {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  status: boolean;
  is_admin: boolean;
  is_worker: boolean;
}

@Table({ tableName: 'bot' })
export class Bot extends Model<Bot, IBotCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
  })
  user_id: number;
  @Column({
    type: DataType.STRING,
  })
  username: string;
  @Column({
    type: DataType.STRING,
  })
  first_name: string;
  @Column({
    type: DataType.STRING,
  })
  last_name: string;
  @Column({
    type: DataType.STRING,
  })
  phone_number: string;
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  status: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_admin: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_worker: boolean;
}
