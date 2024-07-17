'use strict';
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    'Users',
    {
      Username: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      GitUsername: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      GitPassword: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      AwsUserName: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      AwsPassword: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      DockerHubId: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      DockerHubPassword: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'Users',
      timestamps: true,
    },
  );

  
  return Users;
};