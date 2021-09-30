import { Model, DataTypes } from 'sequelize';
import sequelizeInstance from '../services/bdd.service';

export class Message extends Model {
  id:number;

  payload: any;

  network:string;

  roomId: string;

  sectionId: string;

  blockchainWallet: string;

  chainId: string;

  updatedAt: Date;

  createdAt: Date;
}

export const attributesMessage = {
  id: {
    primaryKey: true,
    type: DataTypes.BIGINT,
    unique: true,
    autoIncrement: true,
  },
  payload: {
    type: DataTypes.JSON,
  },
  network: {
    type: DataTypes.STRING,
  },
  roomId: {
    type: DataTypes.STRING,
  },
  sectionId: {
    type: DataTypes.STRING,
  },
  blockchainWallet: {
    type: DataTypes.STRING,
  },
  chainId: {
    type: DataTypes.STRING,
  },
  signature: {
    type: DataTypes.STRING,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
};

Message.init(attributesMessage, { sequelize: sequelizeInstance(), modelName: 'message' });
