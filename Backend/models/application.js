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
  };

  return Application;
};
