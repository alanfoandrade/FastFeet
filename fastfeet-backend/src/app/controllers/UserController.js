import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  // Lista todos usuários (admin) cadastrados
  async index(req, res) {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email']
    });

    if (users.length === 0)
      return res.status(400).json({ message: 'Nenhum usuário cadastrado' });

    return res.json(users);
  }

  // Exibe usuário (admin) com o id passado via params
  async show(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      userId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { userId } = req.params;

    // Busca usuário com id passado via params
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email']
    });

    if (!user)
      return res.status(400).json({ message: 'Usuário não cadastrado' });

    return res.json(user);
  }

  // Cadastra usuário (admin)
  async store(req, res) {
    // Validação dos dados do body
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

    const { email: newEmail } = req.body;

    // Verifica se email já está cadastrado
    const emailExists = await User.findOne({
      where: { email: newEmail }
    });

    if (emailExists) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({ id, name, email });
  }

  // Altera dados do usuário (admin) logado
  async update(req, res) {
    // Validação dos dados do body
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

    // req.userId = id do usuário logado, anexado ao token
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

  // Exclui cadastro do usuário (admin) logado
  async destroy(req, res) {
    // req.userid = id do usuário logado, anexado ao token
    const user = await User.findByPk(req.userId);

    if (!user)
      return res.status(400).json({ message: 'Usuário não cadastrado' });

    // Apaga registro do banco
    await user.destroy();

    return res.json({ message: 'Usuário excluído com sucesso' });
  }
}

export default new UserController();
