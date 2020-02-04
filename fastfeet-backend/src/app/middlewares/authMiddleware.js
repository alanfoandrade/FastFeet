import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

/*
  Middleware de autenticação responsável por verificar e decodificar o token
  passado no header, anexando o id do usuário logado ao req
 */
export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não informado' });
  }

  // Separa e armazena apenas o valor do token, eliminando a palavra Bearer
  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // Anexa ao req o id do usuário logado, contido no payload do token decodificado
    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
