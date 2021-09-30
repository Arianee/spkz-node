import * as config from '../config/database';
import { attributesSectionUser } from '../models/sectionUser.model';

export = {
  up: (queryInterface) => queryInterface.createTable(
    { schema: config.define.schema, tableName: 'sectionUsers' },
    attributesSectionUser,
    {
      tableName: 'sectionUsers',
      timestamps: true,
    },
  ),
  down: (queryInterface) => queryInterface.dropTable({
    schema: config.define.schema,
    tableName: 'sectionUsers',
  }),
};
