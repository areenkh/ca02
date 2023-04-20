
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// check if the user is logged in
isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// Route to display transactions list with optional sorting
router.get('/transactions',
  isLoggedIn,
  async (req, res, next) => {
    const sortBy = req.query.sortBy;
    const userId = req.user._id;

    let transactions;
    if (sortBy === 'date') {
      transactions = await Transaction.find({ userId }).sort({ date: 1 });
    } else if (sortBy === 'amount') {
      transactions = await Transaction.find({ userId }).sort({ amount: -1 });
    } else if (sortBy === 'description') {
      transactions = await Transaction.find({ userId }).sort({ description: 1 });
    } else if (sortBy === 'category') {
      transactions = await Transaction.find({ userId }).sort({ category: 1 });
    } else {
      transactions = await Transaction.find({ userId });
    }

    res.render('transactionsList', { transactions });
});

// Route to display transactions list grouped by category
router.get('/transactions/byCategory',
  isLoggedIn,
  async (req, res, next) => {
    const userId = req.user._id;
    const transactionsByCategory = await Transaction.aggregate([
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' } } },
      { $sort: { totalAmount: -1 } }
    ]);

    res.render('transactionsListByCategory', { transactionsByCategory });
});

// Route to add a new transaction to the database
router.post('/transactions',
  isLoggedIn,
  async (req, res, next) => {
    const { description, amount, category, date } = req.body;
    const userId = req.user._id;

    const transaction = new Transaction({
      description,
      amount: parseFloat(amount),
      category,
      date,
      userId
    });

    await transaction.save();

    res.redirect('/transactions');
});

// Route to delete a transaction from the database
router.get('/transactions/delete/:id',
  isLoggedIn,
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    await Transaction.deleteOne({ _id: id, userId });

    res.redirect('/transactions');
});

// Route to display the edit transaction page
router.get('/transactions/edit/:id',
  isLoggedIn,
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    const transaction = await Transaction.findOne({ _id: id, userId });

    res.render('editTransaction', { transaction });
});

// Route to update a transaction in the database
router.post('/transactions/update',
  isLoggedIn,
  async (req, res, next) => {
    const { id, description, amount, category, date } = req.body;
    const userId = req.user._id;

    await Transaction.updateOne(
      { _id: id, userId },
      { $set: { description, amount: parseFloat(amount), category, date } }
    );

    res.redirect('/transactions');
});

module.exports = router;
