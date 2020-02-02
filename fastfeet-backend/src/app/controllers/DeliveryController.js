import { Op } from 'sequelize';
import * as Yup from 'yup';

import Order from '../models/Order';
import File from '../models/File';

class DeliveryController {
  async index(req, res) {
    const schema = Yup.object().shape({
      delivererId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const orders = await Order.findAll({
      where: {
        deliverer_id: req.params.delivererId,
        canceled_at: null,
        end_date: null
      },
      attributes: ['id', 'recipient_id', 'product', 'start_date']
    });

    if (orders.length === 0)
      return res.status(400).json({ message: 'Nenhuma entrega cadastrada' });

    return res.json(orders);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      delivererId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const orders = await Order.findAll({
      where: {
        deliverer_id: req.params.delivererId,
        canceled_at: null,
        end_date: {
          [Op.not]: null
        }
      },
      attributes: [
        'id',
        'recipient_id',
        'signature_id',
        'product',
        'start_date',
        'end_date'
      ]
    });

    if (orders.length === 0)
      return res.status(400).json({ message: 'Nenhuma entrega concluída' });

    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      orderId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const order = await Order.findOne({
      where: {
        id: req.params.orderId,
        canceled_at: null,
        end_date: null
      }
    });

    if (!order)
      return res
        .status(400)
        .json({ message: 'Encomenda não cadastrada, finalizada ou cancelada' });

    // TODO: VALIDAR HORARIO ENTRE 08:00 E 18:00 - VALIDAR 5 RETIRADAS POR DIA
    order.start_date = new Date();

    const { id, recipient_id, product, start_date } = await order.save();

    return res.json({
      id,
      recipient_id,
      product,
      start_date
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
      signature_id: Yup.number().required()
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const order = await Order.findByPk(req.params.orderId);

    if (!order)
      return res.status(400).json({ message: 'Entrega não cadastrada' });

    const { signature_id: newSignature } = req.body;

    // Verifica se assinatura existe no banco
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
      signature_id,
      product,
      start_date,
      end_date
    } = await order.update({
      ...req.body,
      end_date: new Date()
    });

    return res.json({
      id,
      recipient_id,
      signature_id,
      product,
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
        .json({ message: 'Entrega não cadastrada ou cancelada' });

    order.start_date = null;

    await order.save();

    return res.json({ message: 'Entrega cancelada com sucesso' });
  }
}

export default new DeliveryController();
