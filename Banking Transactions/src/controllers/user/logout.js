import { default as models } from '../../models/index';
import of from 'await-of';
import logger from "../../lib/logger";
import Responder from '../../lib/expressResponder';

export class Logout {
    static async perform(req, res) {
        req.session.destroy()
        Responder.render(res, "home", "logged Out")
    }
}