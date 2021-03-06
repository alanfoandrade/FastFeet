import Sequelize, { Model } from 'sequelize';

// Model de Entregadores
class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        street: Sequelize.STRING,
        number: Sequelize.INTEGER,
        compl: Sequelize.STRING,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        zipcode: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Recipient;
