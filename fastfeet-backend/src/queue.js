import 'dotenv/config';

import Queue from './lib/Queue';

// Inicializa a Fila em um Node independente da api
Queue.processQueue();
