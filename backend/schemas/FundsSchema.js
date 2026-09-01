const { Schema } = require("mongoose");

const FundsSchema = new Schema({
  availableCash: {
    type: Number,
    default: 10000,
  },

  usedMargin: {
    type: Number,
    default: 0,
  },

  openingBalance: {
    type: Number,
    default: 10000,
  },
});

module.exports = { FundsSchema };