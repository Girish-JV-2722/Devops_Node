'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Applications', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });
    await queryInterface.addColumn('Applications', 'ipAddress', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Applications', 'port', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Applications', 'status');
    await queryInterface.removeColumn('Applications', 'ipAddress');
    await queryInterface.removeColumn('Applications', 'port');
  }
};
