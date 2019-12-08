import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class WelcomeMail {
  get key() {
    return 'WelcomeMail';
  }

  async handle({ data }) {
    const { student, plan, enrollment } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matrícula efetuada com sucesso',
      template: 'welcome',
      context: {
        student: student.name,
        plan: plan.title,
        endDate: format(parseISO(enrollment.end_date), 'dd/MM/yyyy'),
        price: Number(plan.price).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
      },
    });
  }
}

export default new WelcomeMail();
