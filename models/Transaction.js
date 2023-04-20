
'use strict';

// Require necessary packages
const mongoose = require('mongoose');

// Create a mongoose schema for a transaction
const transactionSchema = mongoose.Schema({
description: String,
amount: Number,
category: String,
date: Date,
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User'
}
});

// Create a mongoose model for a transaction based on the schema
const Transaction = mongoose.model('Transaction', transactionSchema);

// Export the model
module.exports = Transaction;