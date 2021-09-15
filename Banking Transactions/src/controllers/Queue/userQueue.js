import Queue from 'queue-fifo'
import { executeChannelTransaction } from '../transaction/transactionHandler';

function UserQueue() {
  this.queue = new Queue()
}
UserQueue.prototype.enqueue = function (obj) {
  if (!this.queue.isEmpty())
    return this.queue.enqueue(obj);
  this.queue.enqueue(obj);
  executeChannelTransaction(obj.sourceUserId)
  return true
};
UserQueue.prototype.dequeue = function () {
  if (!this.queue.isEmpty()) {
    let transaction = this.queue.peek()
    this.queue.dequeue()
    return transaction
  } return "empty"
};
UserQueue.prototype.clear = function () {
  return this.queue.clear()
};
UserQueue.prototype.isEmpty = function () {
  return this.queue.isEmpty();
};
UserQueue.prototype.peek = function () {
  return this.queue.peek()
};
UserQueue.prototype.size = function () {
  return this.queue.size();
};

export { UserQueue }