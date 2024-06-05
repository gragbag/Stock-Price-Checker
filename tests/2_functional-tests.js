const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let prevLikes = 0;

suite('Functional Tests', function() {
    
    test('Viewing one stock: GET request to /api/stock-prices/', done => {
        chai.request(server)
         .get('/api/stock-prices?stock=GOOG')
         .end((err, res) => {
            assert.equal(res.status, 200);

            prevLikes = res.body.stockData.likes;

            assert.equal(res.body.stockData.stock, 'GOOG');
            assert.isAbove(res.body.stockData.price, 0);
            assert.isAtLeast(res.body.stockData.likes, 0);
            done();
         })
    })

    test('Viewing one stock and liking it: GET request to /api/stock-prices/', done => {
        chai.request(server)
         .get('/api/stock-prices?stock=GOOG&like=true')
         .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, 'GOOG');
            assert.isAbove(res.body.stockData.price, 0);
            assert.isAtLeast(res.body.stockData.likes, 0);
            done();
         })
    })

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', done => {
        chai.request(server)
         .get('/api/stock-prices?stock=GOOG&like=true')
         .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, 'GOOG');
            assert.isAbove(res.body.stockData.price, 0);
            assert.isAtLeast(res.body.stockData.likes, 0);
            done();
         })
    })

    test('Viewing two stocks: GET request to /api/stock-prices/', done => {
        chai.request(server)
         .get('/api/stock-prices?stock=GOOG&stock=MSFT')
         .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.isAbove(res.body.stockData[0].price, 0);
            assert.isNotNaN(res.body.stockData[0].likes);
            assert.equal(res.body.stockData[1].stock, 'MSFT');
            assert.isAbove(res.body.stockData[1].price, 0);
            assert.isNotNaN(res.body.stockData[1].likes);
            done();
         })
    })

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', done => {
        chai.request(server)
         .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
         .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.isAbove(res.body.stockData[0].price, 0);
            assert.isNotNaN(res.body.stockData[0].likes);
            assert.equal(res.body.stockData[1].stock, 'MSFT');
            assert.isAbove(res.body.stockData[1].price, 0);
            assert.isNotNaN(res.body.stockData[1].likes);
            done();
         })
    })
});
