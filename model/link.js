const Sequelize = require('sequelize');

function Link(sequelize) {
	this.link = sequelize.define('link', {
		link_id: Sequelize.BIGINT,
	  	link_text: Sequelize.STRING,
	  	link_code: Sequelize.STRING
	});
}

Link.prototype.save = async function(code) {
	this.link.findOrCreate({where: {link_code: code} });
}

module.exports = Link