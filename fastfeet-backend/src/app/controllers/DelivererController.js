import * as Yup from 'yup';

import Deliverer from '../models/Deliverer';
import File from '../models/File';

class DelivererController {
  async index(req, res) {
    const deliverers = await Deliverer.findAll({
      attributes: ['id', 'name', 'avatar_id', 'email']
    });

    if (deliverers.length === 0)
      return res.status(400).json({ message: 'Nenhum entregador cadastrado' });

    return res.json(deliverers);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      delivererId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const deliverer = await Deliverer.findByPk(req.params.delivererId, {
      attributes: ['id', 'name', 'avatar_id', 'email']
    });

    if (!deliverer)
      return res.status(400).json({ message: 'Entregador não cadastrado' });

    return res.json(deliverer);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    // Verifica se email já está cadastrado
    const emailExists = await Deliverer.findOne({
      where: { email: req.body.email }
    });

    if (emailExists) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const { id, name, email } = await Deliverer.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schemaParams = Yup.object().shape({
      delivererId: Yup.number().required()
    });

    if (!(await schemaParams.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const schemaBody = Yup.object().shape({
      name: Yup.string(),
      avatar_id: Yup.number(),
      email: Yup.string().email()
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const deliverer = await Deliverer.findByPk(req.params.delivererId);

    if (!deliverer)
      return res.status(400).json({ message: 'Entregador não cadastrado' });

    const { email: newEmail, avatar_id: newAvatar } = req.body;

    // Caso for alterar email, verifica se novo email já está cadastrado
    if (newEmail && newEmail !== deliverer.email) {
      const emailExists = await Deliverer.findOne({
        where: { email: newEmail }
      });

      if (emailExists) {
        return res.status(400).json({ message: 'Email já cadastrado' });
      }
    }

    // Caso for alterar avatar, verifica se avatar existe no banco
    if (newAvatar && newAvatar !== deliverer.avatar_id) {
      const fileExists = await File.findOne({
        where: { id: newAvatar }
      });

      if (!fileExists) {
        return res.status(400).json({ message: 'Arquivo não cadastrado' });
      }
    }

    const { id, name, avatar_id, email } = await deliverer.update(req.body);

    return res.json({ id, name, avatar_id, email });
  }

  async destroy(req, res) {
    const schema = Yup.object().shape({
      delivererId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const deliverer = await Deliverer.findByPk(req.params.delivererId);

    if (!deliverer)
      return res.status(400).json({ message: 'Entregador não cadastrado' });

    await deliverer.destroy();

    return res.json({ message: 'Entregador excluído com sucesso' });
  }
}

export default new DelivererController();
