import * as Sentry from '@sentry/node';
import express from 'express';
import { resolve } from 'path';
import 'dotenv/config';
import Youch from 'youch';

import 'express-async-errors';

import sentryConfig from './config/sentry';
import routes from './routes';

import './database';

// Configurações da API
class App {
  constructor() {
    // Cria servidor express
    this.server = express();

    // Conexão do módulo de monitoramento de exceções Sentry
    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    // Método de tratamento de exceções
    this.exceptionHandler();
  }

  middlewares() {
    // Middleware de monitoramento de exceções do Sentry
    this.server.use(Sentry.Handlers.requestHandler());
    // Middleware do módulo de upload de arquivos Multter
    this.server.use(
      '/files',
      express.static(resolve(__dirname, '..', 'tmp', 'uploads'))
    );
    // Configura express para compreender I/O JSON
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  // Tatamento de exceções e retorno em JSON usando Youch
  exceptionHandler() {
    // Middleware para captura de exceções
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    });
  }
}

export default new App().server;
