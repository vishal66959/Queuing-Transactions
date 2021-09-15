import Responder from "./expressResponder"
import { AuthenticationError, BadRequestError, ServiceUnavailableError } from '../errors';
import walletAddressValidator from 'wallet-address-validator'

async function verifySessionExist(req, res, next) {
  if (!req.session.user)
    return Responder.operationFailed(res, new AuthenticationError("Unauthorized Access"))
  next()
}
async function verifySessionNotExist(req, res, next) {
  if (req.session.user)
    await req.session.destroy()
  next()
}
async function validateWalletAddress(obj, value, currencyType) {
  if (!currencyType) {
    if (walletAddressValidator.validate(value, 'btc') && obj.currencyType == 'bitcoin') return true
    if (walletAddressValidator.validate(value, 'eth') && obj.currencyType == 'ethereum') return true
    return false
  }
  if (await walletAddressValidator.validate(value, currencyType)) return true
  return false
}

function checkEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(String(email).toLowerCase());
}
function fail(res) {
  return Responder.operationFailed(res, new BadRequestError(`inappropriate request data`))
}
async function argumentValidator(res, requestValidation, obj) {
  let response = {}
  if (requestValidation.required.length !== 0) {
    for (let element of requestValidation.required) {
      if (!obj[element]) return fail(res)
    }
  }
  if (requestValidation.currencyValidator && requestValidation.currencyValidator.length != 0) {
    for (let element of requestValidation.currencyValidator) {
      let flag = await validateWalletAddress(obj, obj[element.key], element.currencyType)
      if (!flag) return fail(res)
    }
  }
  for (let key in requestValidation.properties) {
    if (!obj[key]) continue
    let element = requestValidation.properties[key]

    if (element.type == 'email')
      if (checkEmail(obj[key])) {
        response[key] = obj[key]
        continue
      }
      else return fail(res)

    if (element.type == 'number' && !isNaN(obj[key])) {
      let no = parseFloat(obj[key])
      if (element.max) if (!(no <= element.max)) return fail(res)
      if (element.min) if (!(no > element.min)) return fail(res)
      response[key] = no
      continue
    }

    if ((typeof (obj[key])) !== element.type) return fail(res)
    if (element.pattern) if (!element.pattern.test(obj[key])) return fail(res)
    if (element.enum && element.enum.length != 0) if (!element.enum.includes(obj[key])) return fail(res)

    response[key] = obj[key]
  };
  return { response, valid: true }
}
export { verifySessionNotExist, verifySessionExist, validateWalletAddress, argumentValidator }
