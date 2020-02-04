// Configuração de autenticação utilizada para gerar o token JWT na controller de Sessões
export default {
  secret: process.env.APP_SECRET,
  expiresIn: '7d',
};
