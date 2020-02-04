import Bee from 'bee-queue';
import NewOrderMail from '../app/jobs/NewOrderMail';
import CancellationMail from '../app/jobs/CancellationMail';

import redisConfig from '../config/redis';

const jobs = [NewOrderMail, CancellationMail];

// Configuração do serviço de Filas Bee-Queue
class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  // Cria as filas no redis, contendo nome e método de cada job
  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig
        }),
        handle
      };
    });
  }

  // Adiciona cada job em sua fila
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // Processa os métodos de cada job na fila, job.key é o nome de cada job
  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
