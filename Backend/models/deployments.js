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
    tableName: 'Deployments',
    timestamps: true
  });

  Deployments.associate = function(models) {
    // associations can be defined here
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
