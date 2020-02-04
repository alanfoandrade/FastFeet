import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DelivererController from './app/controllers/DelivererController';
import OrderController from './app/controllers/OrderController';
import FileController from './app/controllers/FileController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import authMiddleware from './app/middlewares/authMiddleware';

const routes = new Router();
const upload = multer(multerConfig);

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

// Delivery Controller
routes.get('/delivery/:delivererId', DeliveryController.index);
routes.get('/delivery/:delivererId/delivered', DeliveryController.show);
routes.post('/delivery/:orderId', DeliveryController.store);
routes.patch('/delivery/:orderId', DeliveryController.update);
// routes.delete('/delivery/:orderId', DeliveryController.destroy);

// DeliveryProblem Controller
routes.post('/delivery/:orderId/problems', DeliveryProblemController.store);
routes.patch('/delivery/:problemId/problems', DeliveryProblemController.update);

// Authenticated Routes
routes.use(authMiddleware);

// File Controller
routes.post('/files', upload.single('file'), FileController.store);

// User Controller
routes.patch('/users', UserController.update);
routes.delete('/users', UserController.destroy);

// Recipient Controller
routes.post('/recipients', RecipientController.store);
routes.patch('/recipients/:recipientId', RecipientController.update);
routes.delete('/recipients/:recipientId', RecipientController.destroy);

// Deliverer Controller
routes.get('/deliverers', DelivererController.index);
routes.get('/deliverers/:delivererId', DelivererController.show);
routes.post('/deliverers', DelivererController.store);
routes.patch('/deliverers/:delivererId', DelivererController.update);
routes.delete('/deliverers/:delivererId', DelivererController.destroy);

// Order Controller
routes.get('/orders', OrderController.index);
routes.get('/orders/:orderId', OrderController.show);
routes.post('/orders', OrderController.store);
routes.patch('/orders/:orderId', OrderController.update);
routes.delete('/orders/:orderId', OrderController.destroy);

// DeliveryProblem Controller
routes.get('/delivery/list/problems', DeliveryProblemController.index);
routes.get('/delivery/:orderId/problems', DeliveryProblemController.show);
routes.delete(
  '/delivery/:problemId/cancel-order',
  DeliveryProblemController.destroy
);

export default routes;
