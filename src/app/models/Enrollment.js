import Sequelize, { Model } from 'sequelize';
import { addMonths } from 'date-fns';

class Enrollment extends Model {
  static init(sequelize) {
    super.init(
      {
        start_date: Sequelize.DATE,
        end_date: {
          type: Sequelize.VIRTUAL,
          get() {
            if (!this.plan) {
              return null;
            }

            return addMonths(this.start_date, this.plan.duration);
          },
        },
        price: {
          type: Sequelize.VIRTUAL,
          get() {
            if (!this.plan) {
              return null;
            }

            return this.plan.price * this.plan.duration;
          },
        },
      },
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Plan, { foreignKey: 'plan_id', as: 'plan' });
    this.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
  }
}

export default Enrollment;
