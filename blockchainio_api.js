const request = require('request');
const API = "https://api.blockchain.io/v1/ticker/price?symbol=ucobtc"

module.exports.getUCOPrice = function() {
    return new Promise((resolve, reject) => {
        request.get(API, { json: true}, (err, res, body) => {
            if (err) { 
                return reject(err)
            }
    
            resolve(parseFloat(body.price))
        })
    })
}

