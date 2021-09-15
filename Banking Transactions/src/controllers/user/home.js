import { default as models } from '../../models/index';
import of from 'await-of';
import logger from "../../lib/logger";
import Responder from '../../lib/expressResponder';

export class Home {
    static async perform(req, res) {
        return Responder.render(res, "home")
    }
}