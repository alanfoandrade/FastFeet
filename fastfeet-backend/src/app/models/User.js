import bcrypt from 'bcryptjs';
import Sequelize, { Model } from 'sequelize';

// Model de Usuários (admin)
class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    // Criptografa senha antes de salvar registros
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  // Método para verificação da senha criptografada
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
