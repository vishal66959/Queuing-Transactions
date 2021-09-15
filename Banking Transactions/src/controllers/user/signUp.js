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
        name: { type: 'string' },
        description: { type: 'string' },
        email: { type: 'email' },
        password: { type: 'string' },
        bitcoinWallet: { type: 'string' },
        bitcoinBalance: { type: 'number', min: 0 },
        maxBitcoin: { type: 'number', min: 0 },
        ethereumWallet: { type: 'string' },
        ethereumBalance: { type: 'number', min: 0 },
        maxEthereum: { type: 'number', min: 0 }
    },
    currencyValidator: [{ key: 'bitcoinWallet', currencyType: 'btc' }, { key: 'ethereumWallet', currencyType: 'eth' }],
    required: ['name', 'email', 'password']
}

export class SignUp {
    static async perform(req, res) {
        return Responder.render(res, "signUp");
    }
    static async createUser(req, res) {
        let requestData = await argumentValidator(res, requestValidation, req.body)
        if (!requestData.valid) return
        requestData = requestData.response
        logger.info('Inserting user', requestData)
        let [response, err] = await of(user.create(requestData))
        if (err) Responder.operationFailed(res, new ServiceUnavailableError(err))
        else Responder.render(res, "login", "User Created ,Please Login", 201)
    }
}
