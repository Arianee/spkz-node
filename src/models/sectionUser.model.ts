import { Model, DataTypes } from 'sequelize';
import sequelizeInstance from '../services/bdd.service';

// a user of a section
export class SectionUser extends Model {
  id: number;

  roomId: string;

  sectionId: string;

  blockchainWallet: string;

  chainId: string;

  network: string;

  payload: string

  updatedAt: Date;

  createdAt: Date;

  lastViewed: Date;

  userProfile?: any;
}

export const attributesSectionUser = {
  id: {
    primaryKey: true,
    unique: true,
    type: DataTypes.BIGINT,
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
  updatedAt: {
    type: DataTypes.DATE,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  lastViewed: {
    type: DataTypes.DATE,
  },
};

SectionUser.init(attributesSectionUser, { sequelize: sequelizeInstance(), modelName: 'sectionUser' });
