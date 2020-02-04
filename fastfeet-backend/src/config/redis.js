// Configuração do banco de armazenamento das filas de envio de email, utilizada em /lib/Queue.js
export default {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
};
