import { resolve } from 'path';
import 'dotenv/config';

import express from 'express';
import * as Sentry from '@sentry/node';
import Youch from 'youch';

import 'express-async-errors';

import routes from './routes';
import sentryConfig from './config/sentry';

import './database';

// Configurações da API
class App {
  constructor() {
    // Cria servidor express
    this.server = express();

    // Conexão do módulo de monitoramento de excessões Sentry
    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    // Middleware de monitoramento de excessões do Sentry
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

  // Tatamento de excessões e retorno em JSON usando Youch
  exceptionHandler() {
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
