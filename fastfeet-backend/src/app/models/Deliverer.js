import Sequelize, { Model } from 'sequelize';

// Model de Entregadores
class Deliverer extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING
      },
      {
        sequelize
      }
    );

    return this;
  }

  // Relacionamento de avatar_id com a tabela de Arquivos
  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }
}

export default Deliverer;
