import * as Yup from 'yup';

import Order from '../models/Order';
import File from '../models/File';
import Deliverer from '../models/Deliverer';
import Recipient from '../models/Recipient';

import Queue from '../../lib/Queue';
import NewOrderMail from '../jobs/NewOrderMail';
import CancellationMail from '../jobs/CancellationMail';

class OrderController {
  // Lista todas encomendas cadastradas
  async index(req, res) {
    const orders = await Order.findAll({
      attributes: [
        'id',
        'recipient_id',
        'deliverer_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date'
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url']
        }
      ]
    });

    if (orders.length === 0)
      return res.status(400).json({ message: 'Nenhuma encomenda cadastrada' });

    return res.json(orders);
  }

  // Lista encomenda com o id passado via params
  async show(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      orderId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { orderId } = req.params;

    // Busca encomenda com id passado via params
    const order = await Order.findByPk(orderId, {
      attributes: [
        'id',
        'recipient_id',
        'deliverer_id',
        'signature_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date'
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url']
        }
      ]
    });

    if (!order)
      return res.status(400).json({ message: 'Encomenda não cadastrada' });

    return res.json(order);
  }

  // Cadastra encomenda
  async store(req, res) {
    // Validação dos dados do body
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliverer_id: Yup.number().required(),
      signature_id: Yup.number(),
      product: Yup.string().required(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const {
      deliverer_id: newDeliverer,
      recipient_id: newRecipient,
      signature_id: newSignature
    } = req.body;

    // Busca entregador com id passado via body
    const deliverer = await Deliverer.findByPk(newDeliverer);

    if (!deliverer)
      return res.status(400).json({ message: 'Entregador não cadastrado' });

    // Busca endereço com o id passado via body
    const recipient = await Recipient.findByPk(newRecipient);

    if (!recipient)
      return res.status(400).json({ message: 'Endereço não cadastrado' });

    // Caso for cadastrar assinatura, verifica se assinatura existe no banco
    if (newSignature) {
      const fileExists = await File.findByPk(newSignature);

      if (!fileExists) {
        return res.status(400).json({ message: 'Arquivo não encontrado' });
      }
    }

    const { id, recipient_id, deliverer_id, product } = await Order.create(
      req.body
    );

    // Envia email avisando o entregador da nova entrega
    await Queue.add(NewOrderMail.key, {
      deliverer,
      recipient
    });

    return res.json({
      id,
      recipient_id,
      deliverer_id,
      product
    });
  }

  // Altera dados referente à entrega com o id passado via params
  async update(req, res) {
    // Validação do id passado via params
    const schemaParams = Yup.object().shape({
      orderId: Yup.number().required()
    });

    if (!(await schemaParams.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    // Validação dos dados do body
    const schemaBody = Yup.object().shape({
      recipient_id: Yup.number(),
      deliverer_id: Yup.number(),
      signature_id: Yup.number(),
      product: Yup.string()
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { orderId } = req.params;

    // Busca encomenda com o id passado via params
    const order = await Order.findByPk(orderId);

    if (!order)
      return res.status(400).json({ message: 'Encomenda não cadastrada' });

    const {
      deliverer_id: newDeliverer,
      recipient_id: newRecipient,
      signature_id: newSignature
    } = req.body;

    // Busca entregador com id passado via body
    const deliverer = await Deliverer.findByPk(newDeliverer);

    if (!deliverer)
      return res.status(400).json({ message: 'Entregador não cadastrado' });

    // Busca endereço com o id passado via body
    const recipient = await Recipient.findByPk(newRecipient);

    if (!recipient)
      return res.status(400).json({ message: 'Endereço não cadastrado' });

    // Caso for alterar assinatura, verifica se assinatura existe no banco
    if (newSignature && newSignature !== order.signature_id) {
      const fileExists = await File.findByPk(newSignature);

      if (!fileExists) {
        return res.status(400).json({ message: 'Arquivo não encontrado' });
      }
    }

    const {
      id,
      recipient_id,
      order_id,
      signature_id,
      product,
      canceled_at,
      start_date,
      end_date
    } = await order.update(req.body);

    return res.json({
      id,
      recipient_id,
      order_id,
      signature_id,
      product,
      canceled_at,
      start_date,
      end_date
    });

    // TODO: TESTAR SE É POSSÍVEL ALTERAR START_DATE E END_DATE
  }

  // Candela encomenda com o id passado via params
  async destroy(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      orderId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { orderId } = req.params;

    // Busca encomenda com o id passado via params
    const order = await Order.findOne({
      where: {
        id: orderId,
        canceled_at: null
      },
      include: [
        {
          model: Deliverer,
          as: 'deliverer',
          attributes: ['name', 'email']
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'number', 'city', 'state', 'zipcode']
        }
      ]
    });

    if (!order)
      return res
        .status(400)
        .json({ message: 'Encomenda não cadastrada ou cancelada' });

    // Seta data de cancelamento
    order.canceled_at = new Date();

    await order.save();

    const { recipient, deliverer } = order;

    // Envia email avisando o entregador do cancelamento
    await Queue.add(CancellationMail.key, {
      deliverer,
      recipient
    });

    return res.json({ message: 'Encomenda cancelada com sucesso' });
  }
}

export default new OrderController();
