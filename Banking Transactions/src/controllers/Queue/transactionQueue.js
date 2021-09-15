import Queue from 'queue-fifo'
import { updateUserChannels } from '../transaction/transactionHandler';

function TransactionQueue() {
  this.queue = new Queue()
}
TransactionQueue.prototype.enqueue = function (obj) {
  this.queue.enqueue(obj)
  updateUserChannels(obj)
  //update this transaction queue in DB
  return obj.transactionId
};
TransactionQueue.prototype.dequeue = function () {
  return this.queue.dequeue()
};
TransactionQueue.prototype.clear = function () {
  return this.queue.clear()
};
TransactionQueue.prototype.isEmpty = function () {
  return this.queue.isEmpty();
};
TransactionQueue.prototype.peek = function () {
  return this.queue.peek()
};
TransactionQueue.prototype.size = function () {
  return this.queue.size();
};

export { TransactionQueue }