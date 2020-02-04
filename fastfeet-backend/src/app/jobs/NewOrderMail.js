import Mail from '../../lib/Mail';

// Job de envio de email de aviso de cadastro de Entregas
class NewOrderMail {
  // Exporta o nome da fila a qual pertence o job, acessível por job.key
  get key() {
    return 'NewOrderMail';
  }

  // Método para envio do email de aviso de cadastro de Entrega
  async handle({ data }) {
    const { deliverer, recipient } = data;

    await Mail.sendMail({
      to: `${deliverer.name} <${deliverer.email}>`,
      subject: 'Encomenda cancelada',
      template: 'neworder',
      context: {
        deliverer: deliverer.name,
        name: recipient.name,
        street: recipient.street,
        number: recipient.number,
        city: recipient.city,
        state: recipient.state,
        zipcode: recipient.zipcode,
      },
    });
  }
}

export default new NewOrderMail();
