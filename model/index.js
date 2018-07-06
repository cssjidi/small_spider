const Sequelize = require('sequelize');
const demo = require('./demo')

const sequelize = new Sequelize('shortLink', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  freezeTableName: true,
  underscored: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorsAliases: false
});

const model = {
	demo: demo(sequelize),
}

module.exports = model