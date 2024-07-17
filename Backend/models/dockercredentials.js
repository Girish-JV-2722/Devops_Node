'use strict';
module.exports = (sequelize, DataTypes) => {
  const dockerCredentials = sequelize.define('dockerCredentials', {
    dockerId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dockerUsername: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dockerPassword: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'dockerCredentials',
    timestamps: true
  });

  dockerCredentials.associate = function(models) {
    // associations can be defined here
    dockerCredentials.belongsTo(models.Users, {
      foreignKey: 'userId',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  };

  return dockerCredentials;
};
