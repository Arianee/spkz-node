import { DataTypes } from 'sequelize';
import * as config from '../config/database';

module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable(
      { schema: config.define.schema, tableName: 'roomUsers' },
    );

    await queryInterface.createTable(
      { schema: config.define.schema, tableName: 'roomUsers' },
      {
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
        tableName: 'roomUsers',
        timestamps: true,
      },
    );

    await queryInterface.addIndex(
      { schema: config.define.schema, tableName: 'roomUsers' },
      ['blockchainWallet', 'roomId', 'network', 'chainId'], {
        name: 'sectionUsers_blockchainWallet_roomId_network_chainId',
        unique: true,
      },
    );
  },
  down(queryInterface) {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.dropTable('roomUsers'),
    ]);
  },
};
