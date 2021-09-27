import { Sequelize } from 'sequelize';
import * as database from '../config/database';

let sequelizeInstanceSingletan: Sequelize = null;
const sequelizeInstance = (): Sequelize => {
  if (!sequelizeInstanceSingletan) {
    sequelizeInstanceSingletan = new Sequelize(database);
  }
  return sequelizeInstanceSingletan;
};
export = sequelizeInstance;
