import * as config from '../config/database';
import { attributesMessage } from '../models/message.model';

export = {
  up: (queryInterface) => queryInterface.createTable(
    { schema: config.define.schema, tableName: 'messages' },
    attributesMessage,
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
