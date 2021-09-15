export default (sequelize, DataTypes) => {
  const Transaction = sequelize.define('transaction', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    transactionId: { type: DataTypes.UUID, allowNull: false, unique: true },
    currencyType: { type: DataTypes.ENUM('bitcoin', 'ethereum'), allowNull: false, field: 'currency_type' },
    currencyAmount: { type: DataTypes.DECIMAL(28,18), allowNull: false, field: 'currency_amount' },
    sourceUserId: { type: DataTypes.STRING, allowNull: false, field: 'source_user_id' },
    targetUserId: { type: DataTypes.STRING, allowNull: false, field: 'target_user_id' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    processedAt: { type: DataTypes.DATE, field: 'processed_at' },
    state: DataTypes.ENUM('success', 'failed')

  }, {});
  return Transaction;
};
