'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Applications', 'status', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Applications', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });
  }
};
