import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

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
