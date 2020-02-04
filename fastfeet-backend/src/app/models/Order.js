import Sequelize, { Model } from 'sequelize';

// Model de Encomendas
class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.STRING,
        canceled_at: Sequelize.DATE,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE
      },
      {
        sequelize
      }
    );

    return this;
  }

  static associate(models) {
    // Relacionamento de signature_id com a tabela de Arquivos
    this.belongsTo(models.File, {
      foreignKey: 'signature_id',
      as: 'signature'
    });
    // Relacionamento de recipient_id com a tabela de Endereços
    this.belongsTo(models.Recipient, {
      foreignKey: 'recipient_id',
      as: 'recipient'
    });
    // Relacionamento de deliverer_id com a tabela de Entregadores
    this.belongsTo(models.Deliverer, {
      foreignKey: 'deliverer_id',
      as: 'deliverer'
    });
  }
}

export default Order;
