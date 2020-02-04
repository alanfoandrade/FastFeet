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
  // Lista todas entregas não concluídas para o entregador com o id passado via params
  async index(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      delivererId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { delivererId } = req.params;

    const orders = await Order.findAll({
      where: {
        deliverer_id: delivererId,
        canceled_at: null,
        end_date: null
      },
      attributes: ['id', 'recipient_id', 'product', 'start_date']
    });

    if (orders.length === 0)
      return res.status(400).json({ message: 'Nenhuma entrega cadastrada' });

    return res.json(orders);
  }

  // Lista as entregas já concluídas pelo entregador com o id passado via params
  async show(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      delivererId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { delivererId } = req.params;

    // Busca encomendas já concluídas pelo entregador com id passado via params
    const orders = await Order.findAll({
      where: {
        deliverer_id: delivererId,
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

  // Cadastra retirada da encomenda com o id passado via params
  async store(req, res) {
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
        canceled_at: null,
        end_date: null
      }
    });

    if (!order)
      return res
        .status(400)
        .json({ message: 'Encomenda não cadastrada, finalizada ou cancelada' });

    // Horário atual
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

    // Verifica quantas retiradas foram feitas hoje
    const withdrawCount = await Order.findAndCountAll({
      where: {
        deliverer_id: order.deliverer_id,
        start_date: {
          [Op.gte]: startOfDay(timeNow)
        }
      }
    });

    // Limite de 5 retiradas diárias
    if (withdrawCount.count >= 5) {
      return res
        .status(400)
        .json({ message: 'Limite de retiradas diárias atingido' });
    }

    // Seta data de retirada da encomenda
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

  // Confirma entrega da encomenda com o id passado via params
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
      signature_id: Yup.number().required()
    });

    if (!(await schemaBody.isValid(req.body))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { orderId } = req.params;

    // Busca encomenda com o id passado via params
    const order = await Order.findByPk(orderId);

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

  // Cancela retirada da encomenda com o id passado via params
  /* async destroy(req, res) {
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
      }
    });

    if (!order)
      return res
        .status(400)
        .json({ message: 'Entrega não cadastrada ou cancelada' });

    // Apaga data de retirada da encomenda
    order.start_date = null;

    await order.save();

    return res.json({ message: 'Entrega cancelada com sucesso' });
  } */
}

export default new DeliveryController();
