import * as Yup from 'yup';

import Order from '../models/Order';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryProblemController {
  async index(req, res) {
    const deliveries = await DeliveryProblem.findAll({
      attributes: ['id', 'description'],
      include: [
        {
          model: Order,
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
        }
      ]
    });

    if (deliveries.length === 0)
      return res.status(400).json({ message: 'Nenhuma entrega com problema' });

    return res.json(deliveries);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      orderId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const deliveries = await DeliveryProblem.findAll({
      where: { order_id: req.params.orderId },
      attributes: ['id', 'description'],
      include: [
        {
          model: Order,
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
        }
      ]
    });

    if (deliveries.length === 0)
      return res
        .status(400)
        .json({ message: 'Nenhum problema com a encomenda' });

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      orderId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { orderId } = req.params;

    const order = await Order.findOne({
      where: {
        id: orderId,
        canceled_at: null
      }
    });

    if (!order)
      return res
        .status(400)
        .json({ message: 'Encomenda não cadastrada, finalizada ou cancelada' });

    const { id, description, order_id } = await DeliveryProblem.create({
      ...req.body,
      order_id: orderId
    });

    return res.json({
      id,
      description,
      order_id
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      problemId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const problem = await DeliveryProblem.findByPk(req.params.problemId);

    if (!problem)
      return res
        .status(400)
        .json({ message: 'Entrega com problema não encontrada' });

    const { id, description, order_id } = await problem.update(req.body);

    return res.json({
      id,
      description,
      order_id
    });
  }

  async destroy(req, res) {
    const schema = Yup.object().shape({
      problemId: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const problem = await DeliveryProblem.findByPk(req.params.problemId);

    if (!problem)
      return res
        .status(400)
        .json({ message: 'Entrega com problema não encontrada' });

    const order = await Order.findOne({
      where: {
        id: problem.order_id,
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

export default new DeliveryProblemController();
