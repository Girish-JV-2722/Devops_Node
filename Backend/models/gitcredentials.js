'use strict';
module.exports = (sequelize, DataTypes) => {
  const gitCredentials = sequelize.define('gitCredentials', {
    gitId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gitUsername: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gitToken: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'gitCredentials',
    timestamps: true
  });

  gitCredentials.associate = function(models) {
    // associations can be defined here
    gitCredentials.belongsTo(models.Users, {
      foreignKey: 'userId',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  };

  return gitCredentials;
};
