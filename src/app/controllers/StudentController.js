import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      birth_date: Yup.date().required(),
      weight: Yup.number()
        .positive()
        .required(),
      height: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    const {
      id,
      name,
      email,
      birth_date,
      age,
      weight,
      height,
    } = await Student.create(req.body);

    return res.json({ id, name, email, birth_date, age, weight, height });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      birth_date: Yup.date(),
      weight: Yup.number().positive(),
      height: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ error: 'Student was not found.' });
    }

    const newEmail = req.body.email;

    if (newEmail && newEmail !== student.email) {
      const studentExists = await Student.findOne({
        where: { email: newEmail },
      });

      if (studentExists) {
        return res.status(400).json({ error: 'E-mail already used.' });
      }
    }

    const {
      id,
      name,
      email,
      birth_date,
      age,
      weight,
      height,
    } = await student.update(req.body);

    return res.json({ id, name, email, birth_date, age, weight, height });
  }
}

export default new StudentController();
