'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Applications', {
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // name of the target model
          key: 'id'       // key in the target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      region: {
        type: Sequelize.STRING,
        allowNull: true
      },
      environment: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gitUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      scripts: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      nodeVersion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Projects', // name of the target model
          key: 'projectId'   // key in the target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Applications');
  }
};
