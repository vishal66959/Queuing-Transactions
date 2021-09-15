import { exportDefaultSpecifier } from 'babel-types'
import { UserQueue } from '../Queue/userQueue'
import { TransactionQueue } from '../Queue/transactionQueue'
import { PerformTransaction } from './performTransaction'
import logger from '../../lib/logger'
let userChannels = {}
let TxQueue = new TransactionQueue()

function updateUserChannels(current) {
  if (!userChannels[current.sourceUserId]) logger.info("User channel not foud")
  if (!userChannels[current.sourceUserId].debitTxQueue)
    userChannels[current.sourceUserId].debitTxQueue = new UserQueue()
  userChannels[current.sourceUserId].debitTxQueue.enqueue(current)
   return
}

async   function executeChannelTransaction(userEmail) {
  if (userChannels[userEmail] && userChannels[userEmail].debitTxQueue)
    while (!userChannels[userEmail].debitTxQueue.isEmpty()) {
      let transactionObj = userChannels[userEmail].debitTxQueue.peek()
      logger.info('Executing transaction for', transactionObj)
      let response = await PerformTransaction.executeTransaction(transactionObj)
      if (response.status == 500) {
        let trial = 3
        while (response.status == 500 && trial != 0) {
          response = await PerformTransaction.executeTransaction(transactionObj)
          trial -= 1
        }
      }
      if (response.status != 200) {
        logger.info('Transaction Failed', response.error || response.message)
        transactionObj.state = 'failed'
      }
      if (response.status == 200) {
        transactionObj.state = 'success'
      }
      let txRes = await PerformTransaction.insertTransaction(transactionObj)
      if (txRes.status == 201)
        logger.info("Transaction completed", userChannels[userEmail].debitTxQueue.dequeue())
      else logger.info("transaction insertion failed", userChannels[userEmail].debitTxQueue.dequeue())
    }
  logger.info("All queued transactions completed")
  return
}
export { userChannels, executeChannelTransaction, updateUserChannels, TxQueue }