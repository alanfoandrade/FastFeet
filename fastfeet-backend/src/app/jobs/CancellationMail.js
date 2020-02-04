import Mail from '../../lib/Mail';

// Job de envio de email de aviso de cancelamento de Entregas
class CancellationMail {
  // Exporta o nome da fila a qual pertence o job, acessível por job.key
  get key() {
    return 'CancellationMail';
  }

  // Método para envio do email de aviso de cancelamento de Entrega
  async handle({ data }) {
    const { deliverer, recipient } = data;

    await Mail.sendMail({
      to: `${deliverer.name} <${deliverer.email}>`,
      subject: 'Encomenda cancelada',
      template: 'cancellation',
      context: {
        deliverer: deliverer.name,
        name: recipient.name,
        street: recipient.street,
        number: recipient.number,
        city: recipient.city,
        state: recipient.state,
        zipcode: recipient.zipcode
      }
    });
  }
}

export default new CancellationMail();
