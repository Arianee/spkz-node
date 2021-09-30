import { DataTypes } from 'sequelize';
import * as config from '../config/database';

export = {
  up: (queryInterface) => queryInterface.createTable(
    { schema: config.define.schema, tableName: 'messages' },
    {
      id: {
        primaryKey: true,
        type: DataTypes.BIGINT,
        unique: true,
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
    },
    {
      tableName: 'messages',
      timestamps: true,
    },
  ),
  down: (queryInterface) => queryInterface.dropTable({
    schema: config.define.schema,
    tableName: 'messages',
  }),
};
