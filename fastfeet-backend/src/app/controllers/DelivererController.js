import * as Yup from 'yup';

import Deliverer from '../models/Deliverer';
import File from '../models/File';

// Controller de Entregadores
class DelivererController {
  // Lista todos entregadores cadastrados
  async index(req, res) {
    const deliverers = await Deliverer.findAll({
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url']
        }
      ]
    });

    if (deliverers.length === 0)
      return res.status(400).json({ message: 'Nenhum entregador cadastrado' });

    return res.json(deliverers);
  }

  // Exibe entregador por id passado via params
  async show(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      delivererId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { delivererId } = req.params;

    // Busca entregador com o id passado via params
    const deliverer = await Deliverer.findByPk(delivererId, {
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url']
        }
      ]
    });

    if (!deliverer)
      return res.status(400).json({ message: 'Entregador não cadastrado' });

    return res.json(deliverer);
  }

  // Cadastra entregador
  async store(req, res) {
    // Validação dos dados do body
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { email: newEmail } = req.body;

    // Verifica se email já está cadastrado
    const emailExists = await Deliverer.findOne({
      where: { email: newEmail }
    });

    if (emailExists) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const { id, name, email } = await Deliverer.create(req.body);

    return res.json({ id, name, email });
  }

  // Altera dados do cadastro de entregador por id passado via params
  async update(req, res) {
    // Validação do id passado via params
    const schemaParams = Yup.object().shape({
      delivererId: Yup.number().required()
    });

    if (!(await schemaParams.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    // Validação dos dados do body
    const schemaBody = Yup.object().shape({
      name: Yup.string(),
      avatar_id: Yup.number(),
      email: Yup.string().email()
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { delivererId } = req.params;
    const { email: newEmail, avatar_id: newAvatar } = req.body;

    // Busca entregador com o id passado via params
    const deliverer = await Deliverer.findByPk(delivererId);

    if (!deliverer)
      return res.status(400).json({ message: 'Entregador não cadastrado' });

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
      const fileExists = await File.findByPk(newAvatar);

      if (!fileExists) {
        return res.status(400).json({ message: 'Arquivo não encontrado' });
      }
    }

    const { id, name, avatar_id, email } = await deliverer.update(req.body);

    return res.json({ id, name, avatar_id, email });
  }

  // Exclui cadastro do entregador com o id passado via params
  async destroy(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      delivererId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { delivererId } = req.params;

    // Busca entregador com id passado via params
    const deliverer = await Deliverer.findByPk(delivererId);

    if (!deliverer)
      return res.status(400).json({ message: 'Entregador não cadastrado' });

    // Apaga registro do banco
    await deliverer.destroy();

    return res.json({ message: 'Entregador excluído com sucesso' });
  }
}

export default new DelivererController();
