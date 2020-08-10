const request = require('request');
const API = "https://api.blockchain.io/v1/ticker/price?symbol=ucobtc"

module.exports.getUCOPrice = function() {
    return new Promise((resolve, reject) => {
        request.get(API, { json: true,      strictSSL : false        }, (err, res, body) => {
            if (err) { 
                return reject(err)
            }
            if (isNaN(parseFloat(body.price))) {
                setTimeout(function(){return true;},1000);
                return getUCOPrice()
            }
            resolve(parseFloat(body.price))
        })
    })
}

