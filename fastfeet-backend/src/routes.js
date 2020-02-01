import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';

import authMiddleware from './app/middlewares/authMiddleware';

const routes = new Router();

// Unauthenticated Routes

// Sessions Controller
routes.post('/sessions', SessionController.store);

// User Controller
routes.get('/users', UserController.index);
routes.get('/users/:userId', UserController.show);
routes.post('/users', UserController.store);

// Recipient Controller
routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:recipientId', RecipientController.show);

// Authenticated Routes
routes.use(authMiddleware);

// User Controller
routes.patch('/users', UserController.update);
routes.delete('/users', UserController.destroy);

// Recipient Controller
routes.post('/recipients', RecipientController.store);
routes.patch('/recipients/:recipientId', RecipientController.update);
routes.delete('/recipients/:recipientId', RecipientController.destroy);

export default routes;
