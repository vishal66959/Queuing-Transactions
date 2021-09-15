import { default as models } from '../../models/index';
import of from 'await-of';
import logger from "../../lib/logger";
import Responder from '../../lib/expressResponder';
import { AuthenticationError, BadRequestError, ServiceUnavailableError } from '../../errors';

import { argumentValidator } from '../../lib/utill';


let insertDB
const { user } = models;
const requestValidation = {
    properties: {
        email: { type: 'email' },
        password: { type: 'string' }
    },
    required: ['email', 'password']
}

export class Login {

    static async perform(req, res) {
        return Responder.render(res, "login", "User Login");
    }
    static async userLogin(req, res) {
        let requestData = await argumentValidator(res, requestValidation, req.body)
        if (!requestData.valid) return
        requestData = requestData.response
        let [userDetails, fetchErr] = await of(user.findOne({ where: { email: requestData.email } }));
        if (fetchErr) return Responder.operationFailed(res, new ServiceUnavailableError("DB Error"))
        if (!userDetails || userDetails == null) return Responder.operationFailed(res, new AuthenticationError("Invalid Login Details"))
        userDetails = userDetails.dataValues
        if (userDetails.password !== requestData.password) return Responder.operationFailed(res, new AuthenticationError("Invalid Login Details"))
        req.session.user = { email: userDetails.email, userName: userDetails.name }
        return Responder.redirect(res, "/dashboard");
    }
}