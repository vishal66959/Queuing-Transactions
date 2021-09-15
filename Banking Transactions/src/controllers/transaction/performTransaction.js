import { default as models } from '../../models/index';
import of from 'await-of';
import uuidv1 from 'uuid/v1'
import { BadRequestError, ServiceUnavailableError } from '../../errors';
import Responder from '../../lib/expressResponder';
import logger from '../../lib/logger'
import { argumentValidator } from '../../lib/utill';
import { userChannels, TxQueue } from './transactionHandler';

const { user, transaction, Sequelize, sequelize } = models;
const { Op } = Sequelize
let insertDB
const currencies = ['bitcoin', 'ethereum']
let balance, wallet, max, currency

const requestValidation = {
  properties: {
    currencyType: { type: 'string', enum: ['bitcoin', 'ethereum'] },
    currencyAmount: { type: 'number', min: 0 },
    targetWallet: { type: 'string' }
  },
  currencyValidator: [{ key: 'targetWallet' }],
  required: ['currencyType', 'currencyAmount', 'targetWallet']
}
export class PerformTransaction {

  static async perform(req, res) {
    return Responder.render(res, "makeTransaction", "Add transaction Data");
  }
  static async validateAndPerformTransaction(req, res) {
    req.session.user = { email: 'user1@yo.com' }
    //transaction object
    const requestData = await argumentValidator(res, requestValidation, req.body)
    if (!requestData.valid) return
    let transactionObj = requestData.response
    logger.info("validateAndPerformTransaction begin for transaction", transactionObj)
    transactionObj.transactionId = uuidv1()
    logger.info("Transaction Id", transactionObj.transactionId)
    //variable for key for generic for all currencies
    currency = transactionObj.currencyType
    balance = currency + 'Balance'
    wallet = currency + 'Wallet'
    max = 'max' + currency.charAt(0).toUpperCase() + currency.slice(1)
    //time when transaction begun
    transactionObj.createdAt = Date.now();
    logger.info("transaction begun at", transactionObj.createdAt)

    //validate transaction
    logger.info("Validating Transaction")
    const validateRes = await PerformTransaction.validateTransaction(req, transactionObj)
    //if not valid return error
    if (!validateRes.valid) return Responder.operationFailed(res, new BadRequestError(validateRes))

    //if valid then perform it     
    return Responder.created(res, validateRes)
  }
  static async validateTransaction(req, transactionObj) {

    //retrieve source user account from DB
    let query = {}

    //retrieve source user account from DB
    if (!userChannels[req.session.user.email]) {
      query["email"] = req.session.user.email

      logger.info("Fetching user for email id", query)
      let [sourceUser, sourceError] = await of(user.findOne({ where: query }))

      if (!(sourceUser !== null && sourceUser !== '')) {
        return { valid: false, message: 'user not found' }
      }
      sourceUser = sourceUser.dataValues
      userChannels[sourceUser.email] = { email: sourceUser.email, maxBitcoin: sourceUser.maxBitcoin, maxEthereum: sourceUser.maxEthereum, bitcoinWallet: sourceUser.bitcoinWallet, ethereumWallet: sourceUser.ethereumWallet }
    }
    //In Memory user Details
    let sourceUser = userChannels[req.session.user.email]
    //check if transaction amount is less than max
    if (sourceUser[max] < transactionObj.currencyAmount)
      return { valid: false, message: 'Transaction amount greater than limit' }

    //retrieve target account 
    query = {}
    query[wallet] = transactionObj.targetWallet

    let [targetUser, err2] = await of(user.findOne({ where: query }))
    if (!(targetUser !== null && targetUser !== '')) {
      return { valid: false, message: 'user not found' }
    }

    targetUser = targetUser.dataValues
    //target and source should not be same
    if (targetUser.email === sourceUser.email) return { valid: false, message: 'Source and Target same' }
    //check for accepting max currency by target
    if (targetUser[max] < transactionObj.currencyAmount) {
      return { valid: false, message: 'Transaction amount greater than receiver limit' }
    }

    //transaction object
    transactionObj.sourceUserId = sourceUser["email"]
    transactionObj.targetUserId = targetUser["email"]
    delete transactionObj.targetWallet

    //the main transaction handler
    logger.info("Transaction Validated")
    logger.info("Transaction Enqueued")
    TxQueue.enqueue(transactionObj)
    //if all pass ,return valid signal
    return { valid: true, transactionId: transactionObj.transactionId, message: 'Transaction valid' }
  }

  static async executeTransaction(transactionObj) {
    return sequelize.transaction(function (t) {
      return of(user.findOne({ where: { email: transactionObj.sourceUserId } }, { transaction: t })).then(function ([sourceUser, err2]) {

        if (err2) throw { status: 500, error: err2 }
        if (!(sourceUser !== null && sourceUser !== '')) {
          throw { status: 401, valid: false, message: 'source user not found' }
        }
        sourceUser = sourceUser.dataValues
        //check account have sufficient balance 
        if (sourceUser[balance] < transactionObj.currencyAmount)
          throw { status: 401, message: 'Insufficient Balance' }

        //update source user account 
        let sourceUpdate = {}
        sourceUpdate[balance] = transactionObj.currencyAmount
        let query = {}
        query["email"] = transactionObj.sourceUserId

        return of(user.decrement(sourceUpdate, { where: query }, { transaction: t })).then((insertDB) => {

          if (insertDB[1]) throw { status: 500, error: insertDB[1] }
          if (insertDB[0][0][1] != 1) throw { status: 401, error: insertDB }

          //update target user account
          let targetUpdate = {}
          targetUpdate[balance] = transactionObj.currencyAmount

          return of(user.increment(targetUpdate, { where: { email: transactionObj.targetUserId } }, { transaction: t })).then((insertDB) => {

            if (insertDB[1]) throw { status: 500, error: insertDB[1] }
            if (insertDB[0][0][1] == 0) throw { status: 401, error: insertDB }

            return { status: 200, message: 'transaction successful' }

          })
        })
      })
    }).then((result) => {
      console.log("returned result", result)
      return result
    }).catch((err) => {
      console.log("error thrown", err)
      return err
    })
  }

  static async insertTransaction(transactionObj) {
    //current time when transaction is processed
    transactionObj.processedAt = Date.now();
    insertDB = await of(transaction.create(transactionObj))

    if (insertDB[1]) {
      return { status: 500, error: insertDB[1] }
    }
    if (!(insertDB[0] !== null && insertDB[0] !== '')) {
      return { status: 500, error: insertDB[0] }
    }
    return { status: 201, Response: { transactionObj, message: 'transaction confirmed' } }
  }
}