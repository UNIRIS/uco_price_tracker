const API = 'https://api.coingecko.com/api/v3/simple/price?ids=uniris&vs_currencies=eur'

const request = require('request');

function getUCOPrice() {
    return new Promise((resolve, reject) => {
        request.get(API, { json: true }, (err, res, body) => {
            if (err) { 
                return reject(err)
            }

            resolve(parseFloat(body.uniris.eur))
        })
    })
}

module.exports.getUCOPrice = getUCOPrice
