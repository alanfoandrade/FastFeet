import Sequelize, { Model } from 'sequelize';

// Model de Problemas na Entrega
class DeliveryProblem extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  // Relacionamento de order_id com a tabela de Entregas
  static associate(models) {
    this.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
  }
}

export default DeliveryProblem;
