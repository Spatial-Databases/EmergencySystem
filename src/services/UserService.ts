import sequelize from '../database.js';
import User from '../models/User.js';

class UserService {
  async getAllUsers() {
    return User.findAll();
  }

  async getAllUsersSpecial() {
    sequelize.query('SELECT * FROM get_all_users();',).then(function (response,) {
      console.log('res:', response[0],);

      return response[0];
    },);
  }

  async createUser(name: string, email: string,) {
    return User.create({ name, email, },);
  }
}

export default new UserService();
