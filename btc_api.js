const API = "https://blockchain.info/ticker"
const request = require('request');

module.exports.getBTCPrice = function(currency) {
    return new Promise((resolve, reject) => {
        request.get(`${API}`, { json: true}, (err, res, body) => {
            if (err) {
                return reject(err)
            }

            if (body[currency] === undefined) {
                return reject(`Currency ${currency} not supported`)
            }

            return resolve(body[currency].last)
        })
    })
}