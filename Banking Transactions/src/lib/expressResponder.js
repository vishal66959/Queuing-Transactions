import logger from "./logger";
import _ from "lodash";

function Responder() { }

/*
 * This method sends the response to the client.
 */

function sendResponse(res, status, body) {
  if (!res.headersSent) {
    if (body) return res.status(status).json(body);
    return res.status(status).send();
  } else {
    logger.error("Response already sent.");
  }
}

function redirectResponse(res, link) {
  if (!res.headersSent) {
    if (link)
      return res.redirect(link);
    return res.status(status).send();
  } else {
    logger.error("Response already sent.");
  }
}

function renderResponse(res, status, view, body) {
  if (!res.headersSent) {
    if (view) {
      return res.status(status).render(view, { msg: body });
    } else if (body) {
      return res.status(status).json(body);
    } else {
      return res.status(status).send();
    }
  } else {
    logger.error("Response already sent.");
  }
}

/*
 * These methods are called to respond to the API user with the information on
 * what is the result of the incoming request
 */
Responder.success = (res, message) => {
  message = _.isString(message) ? { message } : message;
  return sendResponse(res, 200, message);
};

Responder.render = (res, view, message,status) => {

  return renderResponse(res, status || 200, view, message);
};

Responder.redirect = (res, link) => {
  return redirectResponse(res, link);
};

Responder.created = (res, object) => {
  return sendResponse(res, 201, object);
};

Responder.deleted = res => {
  return sendResponse(res, 204);
};

Responder.operationFailed = (res, reason) => {
  const status = reason.status;
  logger.error(reason);
  reason = reason.message || reason;
  return sendResponse(res, status || 400, { reason });
};

export default Responder;
