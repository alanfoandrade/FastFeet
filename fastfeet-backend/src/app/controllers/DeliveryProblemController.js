import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import Deliverer from '../models/Deliverer';
import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

// Controller de Problemas na Entrega
class DeliveryProblemController {
  // Lista todas encomendas com problemas
  async index(req, res) {
    const deliveries = await DeliveryProblem.findAll({
      attributes: ['id', 'description'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'recipient_id',
            'deliverer_id',
            'signature_id',
            'product',
            'canceled_at',
            'start_date',
            'end_date',
          ],
        },
      ],
    });

    if (deliveries.length === 0)
      return res.status(400).json({ message: 'Nenhuma entrega com problema' });

    return res.json(deliveries);
  }

  // Lista todos problemas da encomenda com o id passado via params
  async show(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      orderId: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { orderId } = req.params;

    // Busca problemas com encomenda com o id passado via params
    const problems = await DeliveryProblem.findAll({
      where: { order_id: orderId },
      attributes: ['id', 'description'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'recipient_id',
            'deliverer_id',
            'signature_id',
            'product',
            'canceled_at',
            'start_date',
            'end_date',
          ],
        },
      ],
    });

    if (problems.length === 0)
      return res
        .status(400)
        .json({ message: 'Nenhum problema com a encomenda' });

    return res.json(problems);
  }

  // Cadastra problema com a encomenda com o id passado via params
  async store(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      orderId: Yup.number().required(),
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
      },
    });

    if (!order)
      return res
        .status(400)
        .json({ message: 'Encomenda não cadastrada, finalizada ou cancelada' });

    const { id, description, order_id } = await DeliveryProblem.create({
      ...req.body,
      order_id: orderId,
    });

    return res.json({
      id,
      description,
      order_id,
    });
  }

  // Altera dados do problema com o id passado via params
  async update(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      problemId: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { problemId } = req.params;

    // Busca problema com o id passado via params
    const problem = await DeliveryProblem.findByPk(problemId);

    if (!problem)
      return res
        .status(400)
        .json({ message: 'Entrega com problema não encontrada' });

    const { id, description, order_id } = await problem.update(req.body);

    return res.json({
      id,
      description,
      order_id,
    });
  }

  // Cancela encomenda relacionada ao problema com o id passado via params
  async destroy(req, res) {
    // Validação do id passado via params
    const schema = Yup.object().shape({
      problemId: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ message: 'Erro de validação' });
    }

    const { problemId } = req.params;

    // Busca problema com o id passado via params
    const problem = await DeliveryProblem.findByPk(problemId);

    if (!problem)
      return res
        .status(400)
        .json({ message: 'Entrega com problema não encontrada' });

    // Busca encomenda com o id referenciado em problem.order_id
    const order = await Order.findOne({
      where: {
        id: problem.order_id,
        canceled_at: null,
      },
      include: [
        {
          model: Deliverer,
          as: 'deliverer',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'number', 'city', 'state', 'zipcode'],
        },
      ],
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
      recipient,
    });

    return res.json({ message: 'Encomenda cancelada com sucesso' });
  }
}

export default new DeliveryProblemController();
