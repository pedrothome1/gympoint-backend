import { Op } from 'sequelize';
import { startOfWeek, endOfWeek } from 'date-fns';
import CheckIn from '../models/CheckIn';
import Student from '../models/Student';

class CheckInController {
  async index(req, res) {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student was not found.' });
    }

    const checkIns = await CheckIn.findAll({
      where: { student_id: student.id },
      include: [
        {
          association: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(checkIns);
  }

  async store(req, res) {
    const student = await Student.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email'],
    });

    if (!student) {
      return res.status(404).json({ error: 'Student was not found.' });
    }

    /**
     * The student can only check-in five times in a week.
     */
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const checkInsCount = await CheckIn.count({
      where: {
        student_id: req.params.id,
        created_at: {
          [Op.between]: [weekStart, weekEnd],
        },
      },
    });

    if (checkInsCount === 5) {
      return res
        .status(400)
        .json({ error: 'You can only check-in five times in a week.' });
    }

    const checkIn = await CheckIn.create({ student_id: student.id });

    return res.json({
      id: checkIn.id,
      createdAt: checkIn.createdAt,
      updatedAt: checkIn.updatedAt,
      student,
    });
  }
}

export default new CheckInController();
