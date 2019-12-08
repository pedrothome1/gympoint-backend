import * as Yup from 'yup';
import Queue from '../../lib/Queue';
import WelcomeMail from '../jobs/WelcomeMail';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

class EnrollmentController {
  async index(req, res) {
    const enrollments = await Enrollment.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          association: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          association: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });

    return res.json(enrollments);
  }

  async show(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: ['student', 'plan'],
    });

    return res.json(enrollment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .required(),
      plan_id: Yup.number()
        .integer()
        .required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const student = await Student.findByPk(req.body.student_id);
    if (!student) {
      return res.status(404).json({ error: 'Student was not found.' });
    }

    const plan = await Plan.findByPk(req.body.plan_id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan was not found.' });
    }

    const enrollment = await Enrollment.create(req.body);
    enrollment.plan = plan;

    await Queue.add(WelcomeMail.key, {
      student,
      plan,
      enrollment,
    });

    const { id, student_id, plan_id, start_date } = enrollment;

    return res.json({ id, student_id, plan_id, start_date });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().integer(),
      plan_id: Yup.number().integer(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment was not found.' });
    }

    if (req.body.student_id) {
      if (!(await Student.findByPk(req.body.student_id))) {
        return res.status(404).json({ error: 'Student was not found.' });
      }
    }

    if (req.body.plan_id) {
      if (!(await Plan.findByPk(req.body.plan_id))) {
        return res.status(404).json({ error: 'Plan was not found.' });
      }
    }

    const { id, student_id, plan_id, start_date } = await enrollment.update(
      req.body
    );

    return res.json({ id, student_id, plan_id, start_date });
  }

  async destroy(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment was not found.' });
    }

    enrollment.destroy();

    return res.status(204).send();
  }
}

export default new EnrollmentController();
