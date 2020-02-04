// Criação da coluna signature_id na tabela de Entregas
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('orders', 'signature_id', {
      type: Sequelize.INTEGER,
      // Relacionamento com a tabela de Arquivos
      references: { model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('orders', 'signature_id');
  }
};
