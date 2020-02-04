import nodemailer from 'nodemailer';
import { resolve } from 'path';
import expressHbs from 'express-handlebars';
import nodemailerHbs from 'nodemailer-express-handlebars';

import mailConfig from '../config/mail';

// Configuração do serviço de email Nodemailer
class Mail {
  constructor() {
    const { host, port, secure, auth } = mailConfig;

    // Cria conexão do nodemailer
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null
    });

    this.configureTemplates();
  }

  // Método de configuração dos templates do Handlebars
  configureTemplates() {
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

    this.transporter.use(
      'compile',
      nodemailerHbs({
        viewEngine: expressHbs.create({
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs'
        }),
        viewPath,
        extName: '.hbs'
      })
    );
  }

  // Método para envio de emails
  sendMail(message) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message
    });
  }
}

export default new Mail();
