import { DataTypes } from 'sequelize';
import * as config from '../config/database';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('sectionUsers', 'lastViewed', { type: DataTypes.DATE });

    await queryInterface.addIndex(
      {
        schema: config.define.schema,
        tableName: 'messages',
      },
      ['createdAt', 'roomId', 'sectionId', 'network', 'chainId'], {
        name: 'messages_createdAt_roomId_sectionId_network_chainId',
      },
    );
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('sectionUsers', 'lastViewed', { type: DataTypes.DATE });
  },
};
