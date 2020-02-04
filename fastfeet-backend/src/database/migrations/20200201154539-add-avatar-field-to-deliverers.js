// Criação da coluna avatar_id na tabela de Entregadores
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliverers', 'avatar_id', {
      type: Sequelize.INTEGER,
      // Relacionamento com a tabela de Arquivos
      references: { model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('deliverers', 'avatar_id');
  },
};
