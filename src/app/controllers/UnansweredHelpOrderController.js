import * as Yup from 'yup';
import Queue from '../../lib/Queue';
import HelpOrderAnsweredMail from '../jobs/HelpOrderAnsweredMail';
import HelpOrder from '../models/HelpOrder';

class UnansweredHelpOrderController {
  async index(req, res) {
    const unanswered = await HelpOrder.findAll({
      where: { answer: null },
    });

    return res.json(unanswered);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const helpOrder = await HelpOrder.findByPk(req.params.id, {
      include: [
        {
          association: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!helpOrder) {
      return res.status(404).json({ error: 'Help order was not found.' });
    }

    const updated = await helpOrder.update({
      answer: req.body.answer,
      answer_at: new Date(),
    });

    await Queue.add(HelpOrderAnsweredMail.key, {
      helpOrder: updated,
    });

    return res.json(updated);
  }
}

export default new UnansweredHelpOrderController();
