import of from 'await-of';
import { default as models } from '../../models/index';
import { BadRequestError, ServiceUnavailableError } from '../../errors';
import Responder from '../../lib/expressResponder';
import logger from '../../lib/logger';
import { argumentValidator } from '../../lib/utill';

const { transaction } = models;

const requestValidation = {
  properties: {
    transactionId: { type: 'string', pattern: /^[0-9A-F]{8}-[0-9A-F]{4}-[1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i },
  },
  required: ['transactionId'],
};
export class TransactionStatus {
  static async perform(req, res) {
    return Responder.render(res, 'transactionStatus');
  }

  static async transactionStatus(req, res) {
    let requestData = await argumentValidator(res, requestValidation, req.body);
    if (!requestData.valid) return;
    requestData = requestData.response;
    const { transactionId } = requestData;
    const regEx = /^[0-9A-F]{8}-[0-9A-F]{4}-[1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    if (!regEx.test(transactionId)) Responder.operationFailed(res, new BadRequestError('Invalid Transaction ID'));
    const [fetchTx, fetchEr] = await of(transaction.findOne({ where: { transactionId } }));
    if (fetchEr) Responder.operationFailed(res, new ServiceUnavailableError('DB Error'));
    if (!(fetchTx !== null && fetchTx !== '')) {
      return Responder.operationFailed(res, new ServiceUnavailableError(`Transaction for ${transactionId} not found`));
    }
    return Responder.success(res, { TransactionStatus: fetchTx.dataValues.state });
  }
}
