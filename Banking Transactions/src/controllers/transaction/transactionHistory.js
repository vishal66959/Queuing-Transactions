import of from 'await-of';
import Sequelize from 'sequelize';
import { default as models } from '../../models/index';
import { BadRequestError, ServiceUnavailableError } from '../../errors';
import Responder from '../../lib/expressResponder';
import logger from '../../lib/logger';
import { argumentValidator } from '../../lib/utill';

const { Op } = Sequelize;
const { transaction } = models;
const requestValidation = {
  properties: {
    currencyType: { type: 'string', enum: ['bitcoin', 'ethereum'] },
  },
  required: ['currencyType'],
};
export class TransactionHistory {
  static async perform(req, res) {
    return Responder.render(res, 'transactionHistory');
  }

  static async getTransactionHistory(req, res) {
    let requestData = await argumentValidator(res, requestValidation, req.body);
    if (!requestData.valid) return;
    requestData = requestData.response;
    const { email } = req.session.user;
    const { currencyType } = requestData;
    const [userTx, TxFetchError] = await of(transaction.findAll({
      where: { currencyType, [Op.or]: [{ sourceUserId: email }, { targetUserId: email }] },
    }));
    const Sent = [];
    const Received = [];
    if (userTx == null) return Responder.success(res, { Transactions: { Sent: [], Received: [] } });

    for (const element of userTx) {
      element.sourceUserId == email ? Sent.push(element) : Received.push(element);
    }
    if (TxFetchError) Responder.operationFailed(res, new ServiceUnavailableError('DB Error'));
    return Responder.success(res, { Transactions: { Sent, Received } });
  }
}
