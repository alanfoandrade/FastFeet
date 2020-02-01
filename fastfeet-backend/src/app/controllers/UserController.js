import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async index(req, res) {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email']
    });

    if (users.length === 0)
      return res.status(400).json({ message: 'Nenhum usuário encontrado' });

    return res.json(users);
  }

  async show(req, res) {
    const user = await User.findByPk(req.params.userId, {
      attributes: ['id', 'name', 'email']
    });

    if (!user)
      return res.status(400).json({ message: 'Usuário não encontrado' });

    return res.json(user);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6)
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      password: Yup.string().min(6),
      oldPassword: Yup.string()
        .min(6)
        .when('password', (password, field) =>
          password ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      )
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { email: newEmail, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    // Caso for alterar email, verifica se novo email já está cadastrado
    if (newEmail && newEmail !== user.email) {
      const emailExists = await User.findOne({
        where: { email: newEmail }
      });

      if (emailExists) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
    }

    // Caso for alterar senha, verifica senha anterior
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ message: 'Senha inválida' });
    }

    const { id, name, email } = await user.update(req.body);

    return res.json({ id, name, email });
  }

  async destroy(req, res) {
    const user = await User.findByPk(req.userId);

    if (!user)
      return res.status(400).json({ message: 'Usuário não encontrado' });

    await user.destroy();

    return res.json({ message: 'Usuário excluído com sucesso' });
  }
}

export default new UserController();
