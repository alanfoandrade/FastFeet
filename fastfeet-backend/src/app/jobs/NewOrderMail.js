import Mail from '../../lib/Mail';

class NewOrderMail {
  get key() {
    return 'NewOrderMail';
  }

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
        zipcode: recipient.zipcode
      }
    });
  }
}

export default new NewOrderMail();
