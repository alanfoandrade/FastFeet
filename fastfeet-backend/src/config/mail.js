// Configuração do serviço de envio de emails de aviso, utilizada em /lib/Mail.js
export default {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'Transportadora FastFeet <noreply@fastfeet.com>',
  },
};
