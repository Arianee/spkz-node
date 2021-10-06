import { DataTypes } from 'sequelize';
import * as config from '../config/database';

module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable(
      { schema: config.define.schema, tableName: 'sectionUsers' },
    );

    await queryInterface.createTable(
      { schema: config.define.schema, tableName: 'sectionUsers' },
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
    );
  },
  down(queryInterface) {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.dropTable('sectionUsers'),
    ]);
  },
};
