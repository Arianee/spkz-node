import * as config from '../config/database';
import { attributesRoomUser } from '../models/roomUser.model';

export = {
  up: (queryInterface) => queryInterface.createTable(
    { schema: config.define.schema, tableName: 'roomUsers' },
    attributesRoomUser,
    {
      tableName: 'roomUsers',
      timestamps: true,
    },
  ),
  down: (queryInterface) => queryInterface.dropTable({
    schema: config.define.schema,
    tableName: 'roomUsers',
  }),
};
