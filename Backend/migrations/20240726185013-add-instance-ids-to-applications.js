'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Applications', 'backendInstanceId', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('Applications', 'frontendInstanceId', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Applications', 'backendInstanceId');
    await queryInterface.removeColumn('Applications', 'frontendInstanceId');
  }
};
