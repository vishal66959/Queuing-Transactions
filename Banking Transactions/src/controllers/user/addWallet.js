import { default as models } from '../../models/index';
import of from 'await-of';
import logger from "../../lib/logger";
import Responder from '../../lib/expressResponder';
import { AuthenticationError, BadRequestError, ServiceUnavailableError } from '../../errors';
import { argumentValidator } from '../../lib/utill';


let insertDB
const { user } = models;
const currencies = ['bitcoin', 'ethereum']
const requestValidation = {
    properties: {
        currencyType: { type: 'string', enum: ['bitcoin', 'ethereum'] },
        account: { type: 'string' },
        balance: { type: 'number', min: 0 }
    },
    currencyValidator: [{ key: 'account' }],
    required: ['account', 'currencyType']
}
export class AddWallet {
    static async perform(req, res) {
        return Responder.render(res, "addCurrencyAccount", req.session.user)
    }
    static async addCurrencyAccount(req, res) {
        let requestData = await argumentValidator(res, requestValidation, req.body)
        if (!requestData.valid) return
        requestData = requestData.response
        const currencyType = requestData.currencyType
        let userUpdate = {}
        userUpdate[currencyType + 'Wallet'] = requestData.account
        userUpdate[currencyType + 'Balance'] = requestData.balance
        userUpdate['max' + currencyType.charAt(0).toUpperCase() + currencyType.slice(1)] = requestData.maxLimit
        insertDB = await of(user.update(userUpdate, { where: { email: req.session.user.email } }))
        if (insertDB[1]) return Responder.operationFailed(res, new ServiceUnavailableError({ message: "DB Error", Error: insertDB[1] }))
        return Responder.created(res, 'Account Added successfully')
    }
}