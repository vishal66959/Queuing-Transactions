import { Router } from 'express';
import { Login, Home, Dashboard, AddWallet, SignUp, Logout } from '../controllers/user'
import { PerformTransaction, TransactionHistory, TransactionStatus } from '../controllers/transaction'
import { verifySessionExist, verifySessionNotExist } from '../lib/utill';
const router = Router();

// Routes
router.get(['/home', '/'], Home.perform);
router.get('/signUp', SignUp.perform);
router.get('/login', Login.perform);
router.get('/dashboard', verifySessionExist, Dashboard.perform);
router.get('/logout', verifySessionExist, Logout.perform);
router.get('/addWallet', verifySessionExist, AddWallet.perform);
router.get('/makeTransaction', verifySessionExist, PerformTransaction.perform);
router.get('/transactionHistory', verifySessionExist, TransactionHistory.perform)
router.get('/transactionStatus', verifySessionExist, TransactionStatus.perform)

router.post('/getTransactionHistory', verifySessionExist, TransactionHistory.getTransactionHistory)
router.post('/createUser', SignUp.createUser);
router.post('/userLogin', verifySessionNotExist, Login.userLogin);
router.post('/transaction',  PerformTransaction.validateAndPerformTransaction)
router.post('/addCurrencyAccount', verifySessionExist, AddWallet.addCurrencyAccount)
router.post('/transactionStatus', verifySessionExist, TransactionStatus.transactionStatus)

export default router;
