import * as Yup from 'yup';

import Recipient from '../models/Recipient';

// Controller de Endereços
class RecipientController {
  // Lista todos endereços cadastrados
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
        'zipcode',
      ],
    });

    if (recipients.length === 0)
      return res
        .status(400)
        .json({ message: 'Nenhum destinatário cadastrado' });

    return res.json(recipients);
  }

  // Lista endereço com o id passado via params
  async show(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      recipientId: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { recipientId } = req.params;

    // Busca endereço com id passado via params
    const recipient = await Recipient.findByPk(recipientId, {
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'compl',
        'state',
        'city',
        'zipcode',
      ],
    });

    if (!recipient)
      return res.status(400).json({ message: 'Destinatário não cadastrado' });

    return res.json(recipient);
  }

  // Cadastra endereço
  async store(req, res) {
    // Validação dos dados do body
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      compl: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.number().required(),
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
      zipcode,
    } = await Recipient.create(req.body);

    return res.json({ id, name, street, number, compl, state, city, zipcode });
  }

  // Altera dados do endereço com o id passado via params
  async update(req, res) {
    // Validação do id passado via params
    const schemaParams = Yup.object().shape({
      recipientId: Yup.number().required(),
    });

    if (!(await schemaParams.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    // Validação dos dados do body
    const schemaBody = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number(),
      compl: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      zipcode: Yup.number(),
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { recipientId } = req.params;

    // Busca endereço com id passado via params
    const recipient = await Recipient.findByPk(recipientId);

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
      zipcode,
    } = await recipient.update(req.body);

    return res.json({ id, name, street, number, compl, state, city, zipcode });
  }

  // Exclui cadastro do endereço com o id passado via params
  async destroy(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      recipientId: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { recipientId } = req.params;

    // Busca endereço com id passado via params
    const recipient = await Recipient.findByPk(recipientId);

    if (!recipient)
      return res.status(400).json({ message: 'Destinatário não cadastrado' });

    // Apaga registro do banco
    await recipient.destroy();

    return res.json({ message: 'Destinatário excluído com sucesso' });
  }
}

export default new RecipientController();
