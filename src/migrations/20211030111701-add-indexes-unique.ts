import * as config from '../config/database';

module.exports = {
  up(queryInterface) {
    return Promise.all([
      queryInterface.addIndex(
        { schema: config.define.schema, tableName: 'sectionUsers' },
        ['blockchainWallet', 'roomId', 'sectionId', 'network', 'chainId'], {
          name: 'sectionUsers_blockchainWallet_roomId_sectionId_network_chainId',
          unique: true,
        },
      ),
      queryInterface.addIndex(
        { schema: config.define.schema, tableName: 'roomUsers' },
        ['blockchainWallet', 'roomId', 'network', 'chainId'], {
          name: 'sectionUsers_blockchainWallet_roomId_network_chainId',
          unique: true,
        },
      ),
    ]);
  },
  down() {},
};
