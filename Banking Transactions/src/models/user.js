import bcrypt from 'bcrypt'
const walletAddressValidator = require('wallet-address-validator')

export default (sequelize, DataTypes) => {

  const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    bitcoinWallet: { type: DataTypes.STRING, field: 'bitcoin_wallet', unique: true },
    bitcoinBalance: { type: DataTypes.DECIMAL(28, 18), field: 'bitcoin_balance' },
    maxBitcoin: { type: DataTypes.DECIMAL(28, 18), field: 'max_bitcoin' },
    ethereumWallet: { type: DataTypes.STRING, field: 'ethereum_wallet', unique: true },
    ethereumBalance: { type: DataTypes.DECIMAL(28, 18), field: 'ethereum_balance' },
    maxEthereum: { type: DataTypes.DECIMAL(28, 18), field: 'max_ethereum' }
  }, {});
  return User;
};
