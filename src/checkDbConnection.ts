import sequelize from './database.js';

export const checkDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.',);
  } catch (error) {
    console.error('Unable to connect to the database:', error,);
  } finally {
    await sequelize.close();
  }
};

export const getTableNames = async () => {
  sequelize.getQueryInterface().showAllSchemas().then((tableObj,) => {
    console.log('// Tables in database','==========================',);
    console.log(tableObj,);
  },)
    .catch((err,) => {
      console.log('showAllSchemas ERROR',err,);
    },);
};
