'use strict';
const axios = require('axios');
const mongoose = require('mongoose')
const anonymize = require('ip-anonymize');
const bcrypt = require('bcrypt');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const stockSchema = new mongoose.Schema({
  symbol: String,
  likes: Number,
  userIPs: [String]
})

let Stock = mongoose.model('Stock', stockSchema)

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const stockSymbol = req.query.stock;
      const like = req.query.like;
      const ip = anonymize(req.ip);

      if (Array.isArray(stockSymbol)) {
        return compareTwoStocks(stockSymbol, like, ip, res);
      } else {
        return getSingleStock(stockSymbol, like, ip, res);
      }
      

    });
};

const getSingleStock = async (symbol, like, ip, res) => {
  let stockData;

  stockData = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`)
    .then((res) => res.data);

  if (!stockData) {
    return res.status(400).send({stockData: {
      error: 'invalid symbol'
    }})
  }

  const stockSymbol = stockData.symbol;
  const price = stockData.close;

  let likeData = await findOrCreateStock(stockSymbol);

  console.log(like);
  if (like === 'true') {
    console.log(like);
    if (!likeData.userIPs.includes(ip)) {
      likeData = await Stock.findOneAndUpdate({symbol: stockSymbol}, {$inc: {likes: 1}, $push: {userIPs: ip}}, {new: true});
    }
  }

  const likes = likeData.likes

  return res.status(200).send({
    stockData: {
      stock: stockSymbol,
      price: price,
      likes: likes
    }
  })
}

const compareTwoStocks = async (symbol, like, ip, res) => {
  if (symbol.length > 2) {
    return res.status(400).send({
      error: 'can only accept two stocks max'
    })
  }

  const stockOne = symbol[0];
  const stockTwo = symbol[1];

  let stockOneData;
  let stockTwoData;

  stockOneData = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockOne}/quote`)
    .then((res) => res.data);

  stockTwoData = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockTwo}/quote`)
    .then((res) => res.data);

  if (!stockOneData || !stockTwoData) {
    return res.status(400).send({stockData: {
      error: 'invalid symbol'
    }})
  }

  let likeOneData = await findOrCreateStock(stockOneData.symbol);
  let likeTwoData = await findOrCreateStock(stockTwoData.symbol);

  if (like) {
    if (!likeOneData.userIPs.includes(ip)) {
      likeOneData = await Stock.findOneAndUpdate({symbol: stockOneData.symbol}, {$inc: {likes: 1}, $push: {userIPs: ip}}, {new: true});
    }

    if (!likeTwoData.userIPs.includes(ip)) {
      likeTwoData = await Stock.findOneAndUpdate({symbol: stockTwoData.symbol}, {$inc: {likes: 1}, $push: {userIPs: ip}}, {new: true});
    }
  }

  console.log(like);
  console.log(likeOneData);
  console.log(likeTwoData);

  stockOneData = {
    stock: stockOneData.symbol,
    price: stockOneData.close,
    rel_likes: likeOneData.likes - likeTwoData.likes
  }

  stockTwoData = {
    stock: stockTwoData.symbol,
    price: stockTwoData.close,
    rel_likes: likeTwoData.likes - likeOneData.likes
  }

  return res.status(200).send({
    stockData: [stockOneData, stockTwoData]
  })


}

const findOrCreateStock = async (stockSymbol) => {
  let stock = await Stock.findOne({symbol: stockSymbol});

  if (!stock) {
    stock = new Stock({
      symbol: stockSymbol,
      likes: 0,
      userIPs: []
    })

    await stock.save();
  }

  return stock;
}
