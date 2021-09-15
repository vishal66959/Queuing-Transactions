import { default as models } from '../../models/index';
import of from 'await-of';
import logger from "../../lib/logger";
import Responder from '../../lib/expressResponder';
import { AuthenticationError, BadRequestError, ServiceUnavailableError } from '../../errors';

export class Dashboard {
    static async perform(req, res) {
        return Responder.render(res, "dashboard", JSON.stringify(req.session.user))
    }
}