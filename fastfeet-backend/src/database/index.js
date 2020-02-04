import Sequelize from 'sequelize';

import Deliverer from '../app/models/Deliverer';
import DeliveryProblem from '../app/models/DeliveryProblem';
import File from '../app/models/File';
import Order from '../app/models/Order';
import Recipient from '../app/models/Recipient';
import User from '../app/models/User';
import databaseConfig from '../config/database';

const models = [User, Recipient, Deliverer, File, Order, DeliveryProblem];

// Configuração do banco Postgres
class Database {
  constructor() {
    this.init();
  }

  init() {
    // Inicializa conexão do Sequelize
    this.connection = new Sequelize(databaseConfig);

    // Percorre array de models, conectando com o sequelize e fazendo os relacionamentos
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
