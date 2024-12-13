'use strict';
module.exports = (sequelize, DataTypes) => {
  const gitCredentials = sequelize.define('gitCredentials', {
    gitUsername: {
      primaryKey: true,
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
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
