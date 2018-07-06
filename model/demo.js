const Sequelize = require('sequelize');

function user(sequelize) {
	const User = sequelize.define('link', {
		link_id: Sequelize.BIGINT,
	  link_text: Sequelize.STRING,
	  link_code: Sequelize.STRING
	});
	return User
}

module.exports = user