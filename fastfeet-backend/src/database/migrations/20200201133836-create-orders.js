// Criação da tabela de Encomendas
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      recipient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Relacionamento com a tabela Endereços
        references: { model: 'recipients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      deliverer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Relacionamento com a tabela Entregadores
        references: { model: 'deliverers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      product: {
        type: Sequelize.STRING,
        allowNull: false
      },
      canceled_at: Sequelize.DATE,
      start_date: Sequelize.DATE,
      end_date: Sequelize.DATE,
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('orders');
  }
};
