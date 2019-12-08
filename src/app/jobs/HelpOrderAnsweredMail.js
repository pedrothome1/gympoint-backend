import Mail from '../../lib/Mail';

class HelpOrderAnsweredMail {
  get key() {
    return 'HelpOrderAnsweredMail';
  }

  async handle({ data }) {
    const { helpOrder } = data;

    await Mail.sendMail({
      to: `${helpOrder.student.name} <${helpOrder.student.email}>`,
      subject: 'Sua pergunta foi respondida!',
      template: 'help-order-answered',
      context: {
        question: helpOrder.question,
        answer: helpOrder.answer,
      },
    });
  }
}

export default new HelpOrderAnsweredMail();
