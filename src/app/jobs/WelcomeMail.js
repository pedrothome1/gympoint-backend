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
        endDate: enrollment.end_date,
        price: plan.price,
      },
    });
  }
}

export default new WelcomeMail();
