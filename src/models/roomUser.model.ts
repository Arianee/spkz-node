import { Model, DataTypes } from 'sequelize';
import sequelizeInstance from '../services/bdd.service';

// a user of a section
export class RoomUser extends Model {
  roomId: string;

  blockchainWallet: string;

  chainId: string;

  network: string;

  payload: string

  updatedAt: Date;

  createdAt: Date;
}

export const attributesRoomUser = {
  payload: {
    type: DataTypes.JSON,
  },
  network: {
    type: DataTypes.STRING,
  },
  roomId: {
    type: DataTypes.STRING,
  },
  blockchainWallet: {
    primaryKey: true,
    unique: true,
    type: DataTypes.STRING,
  },
  chainId: {
    type: DataTypes.STRING,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
};

RoomUser.init(attributesRoomUser, { sequelize: sequelizeInstance(), modelName: 'roomUser' });
