'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Applications', 'nodeVersion', {
      type: Sequelize.STRING,
      allowNull: true // Set to false if the field is required
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Applications', 'nodeVersion');
  }
};
