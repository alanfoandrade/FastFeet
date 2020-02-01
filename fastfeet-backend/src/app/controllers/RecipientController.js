import * as Yup from 'yup';

import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const recipients = await Recipient.findAll({
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'compl',
        'state',
        'city',
        'zipcode'
      ]
    });

    if (recipients.length === 0)
      return res
        .status(400)
        .json({ message: 'Nenhum destinatário cadastrado' });

    return res.json(recipients);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      recipientId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const recipient = await Recipient.findByPk(req.params.recipientId, {
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'compl',
        'state',
        'city',
        'zipcode'
      ]
    });

    if (!recipient)
      return res.status(400).json({ message: 'Destinatário não cadastrado' });

    return res.json(recipient);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      compl: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.number().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const {
      id,
      name,
      street,
      number,
      compl,
      state,
      city,
      zipcode
    } = await Recipient.create(req.body);

    return res.json({ id, name, street, number, compl, state, city, zipcode });
  }

  async update(req, res) {
    const schemaParams = Yup.object().shape({
      recipientId: Yup.number().required()
    });

    if (!(await schemaParams.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const schemaBody = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number(),
      compl: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      zipcode: Yup.number()
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const recipient = await Recipient.findByPk(req.params.recipientId);

    if (!recipient)
      return res.status(400).json({ message: 'Destinatário não cadastrado' });

    const {
      id,
      name,
      street,
      number,
      compl,
      state,
      city,
      zipcode
    } = await recipient.update(req.body);

    return res.json({ id, name, street, number, compl, state, city, zipcode });
  }

  async destroy(req, res) {
    const schema = Yup.object().shape({
      recipientId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const recipient = await Recipient.findByPk(req.params.recipientId);

    if (!recipient)
      return res.status(400).json({ message: 'Destinatário não cadastrado' });

    await recipient.destroy();

    return res.json({ message: 'Destinatário excluído com sucesso' });
  }
}

export default new RecipientController();
