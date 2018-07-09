const Sequelize = require('sequelize');
const link = require('./link')

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
	link: new link(sequelize),
}

module.exports = model