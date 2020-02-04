import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  // Cria sessão autenticada e retorna o token
  async store(req, res) {
    // Validação dos dados do body
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { email, password } = req.body;

    // Busca usuário com email passado via body
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Email não cadastrado' });
    }

    // Checa senha passada via body
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Senha inválida' });
    }

    const { id, name } = user;

    // Anexa id, name e email ao payload do token, seta tempo de validade
    return res.json({
      user: {
        id,
        name,
        email
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn
      })
    });
  }
}

export default new SessionController();
