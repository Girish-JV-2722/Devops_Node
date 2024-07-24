'use strict';
module.exports = (sequelize, DataTypes) => {
  const Deployments = sequelize.define('Deployments', {
    deploymentId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    log: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    environment: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Deployments', // Ensure this matches your database table name
    timestamps: true // Adds createdAt and updatedAt columns
  });

  Deployments.associate = function(models) {
    // Ensure that `models.Users` and `models.Applications` exist and are correctly defined
    Deployments.belongsTo(models.Users, {
      foreignKey: 'userId',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    Deployments.belongsTo(models.Applications, {
      foreignKey: 'applicationId',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  };

  return Deployments;
};
