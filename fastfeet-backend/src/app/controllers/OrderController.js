import * as Yup from 'yup';

import Order from '../models/Order';
import File from '../models/File';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll({
      attributes: [
        'id',
        'recipient_id',
        'deliverer_id',
        'signature_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date'
      ]
    });

    if (orders.length === 0)
      return res.status(400).json({ message: 'Nenhuma encomenda cadastrada' });

    return res.json(orders);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      orderId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const order = await Order.findByPk(req.params.orderId, {
      attributes: [
        'id',
        'recipient_id',
        'deliverer_id',
        'signature_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date'
      ]
    });

    if (!order)
      return res.status(400).json({ message: 'Encomenda não cadastrada' });

    return res.json(order);
  }

  async store(req, res) {
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

    const { id, recipient_id, deliverer_id, product } = await Order.create(
      req.body
    );

    // TODO: EMAIL DE AVISO DE ENCOMENDA

    return res.json({
      id,
      recipient_id,
      deliverer_id,
      product
    });
  }

  async update(req, res) {
    const schemaParams = Yup.object().shape({
      orderId: Yup.number().required()
    });

    if (!(await schemaParams.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const schemaBody = Yup.object().shape({
      recipient_id: Yup.number(),
      deliverer_id: Yup.number(),
      signature_id: Yup.number(),
      product: Yup.string()
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const order = await Order.findByPk(req.params.orderId);

    if (!order)
      return res.status(400).json({ message: 'Encomenda não cadastrada' });

    const { signature_id: newSignature } = req.body;

    // Caso for alterar avatar, verifica se avatar existe no banco
    if (newSignature && newSignature !== order.signature_id) {
      const fileExists = await File.findOne({
        where: { id: newSignature }
      });

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
  }

  async destroy(req, res) {
    const schema = Yup.object().shape({
      orderId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const order = await Order.findOne({
      where: {
        id: req.params.orderId,
        canceled_at: null
      }
    });

    if (!order)
      return res
        .status(400)
        .json({ message: 'Encomenda não cadastrada ou cancelada' });

    order.canceled_at = new Date();

    await order.save();

    // TODO: EMAIL DE AVISO DE CANCELAMENTO

    return res.json({ message: 'Encomenda cancelada com sucesso' });
  }
}

export default new OrderController();
