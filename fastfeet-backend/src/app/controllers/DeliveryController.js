import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  setHours,
  setMinutes,
  getHours,
  startOfDay,
  isBefore,
  isAfter
} from 'date-fns';

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

    const timeNow = new Date();

    // Início do horário comercial 08:00
    const beginWork = setMinutes(setHours(timeNow, 8), 0);

    // Encerramento do horário comercial 18:00
    const stopWork = setMinutes(setHours(timeNow, 18), 0);

    // Verificando se agora é horário comercial
    if (isBefore(timeNow, beginWork) || isAfter(timeNow, stopWork)) {
      return res.status(400).json({
        message: `Horário inválido, retiradas apenas entre ${getHours(
          beginWork
        )} e ${getHours(stopWork)}`
      });
    }

    const withdrawCount = await Order.findAndCountAll({
      where: {
        deliverer_id: order.deliverer_id,
        start_date: {
          [Op.gte]: startOfDay(timeNow)
        }
      }
    });

    if (withdrawCount.count >= 5) {
      return res
        .status(400)
        .json({ message: 'Limite de retiradas diárias atingido' });
    }

    order.start_date = new Date();

    const { id, recipient_id, product, start_date } = await order.save();

    return res.json({
      id,
      recipient_id,
      product,
      start_date,
      message: `Retirada ${withdrawCount.count + 1} de 5 diárias`
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
