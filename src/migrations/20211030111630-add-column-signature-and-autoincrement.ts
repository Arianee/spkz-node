import { DataTypes } from 'sequelize';
import * as config from '../config/database';

module.exports = {
  up(queryInterface) {
    return Promise.all([
      queryInterface.dropTable(
        { schema: config.define.schema, tableName: 'messages' },
      ),
      queryInterface.dropTable(
        { schema: config.define.schema, tableName: 'roomUsers' },
      ),
      queryInterface.dropTable(
        { schema: config.define.schema, tableName: 'sectionUsers' },
      ),
      queryInterface.createTable(
        { schema: config.define.schema, tableName: 'messages' },
        {
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
        },
        {
          tableName: 'messages',
          timestamps: true,
        },
      ),
      queryInterface.createTable(
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
        },
        {
          tableName: 'roomUsers',
          timestamps: true,
        },
      ),
      queryInterface.createTable(
        { schema: config.define.schema, tableName: 'sectionUsers' },
        {
          id: {
            primaryKey: true,
            unique: true,
            type: DataTypes.BIGINT,
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
          tableName: 'sectionUsers',
          timestamps: true,
        },
      ),
    ]);
  },

  down(queryInterface) {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.removeColumn('messages', 'signature'),
    ]);
  },
};
