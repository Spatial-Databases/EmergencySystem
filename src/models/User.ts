import { DataTypes, Model, } from 'sequelize';
import sequelize from '../database.js';

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public createdAt?: Date;
  public updatedAt?: Date;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  schema: 'public',
  modelName: 'Users',
  timestamps: false,
},);

export default User;
