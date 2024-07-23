'use strict';
module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    applicationId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true
    },
    environment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gitUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    scripts: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nodeVersion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'Applications',
    timestamps: true
  });

  Application.associate = function(models) {
    // associations can be defined here
    Application.belongsTo(models.Users, {
      foreignKey: 'userId',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    Application.belongsTo(models.Projects, {
      foreignKey: 'projectId',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  };

  return Application;
};
