const { getUCOPrice } = require('./blockchainio_api')
const { getBTCPrice } = require('./btc_api')

const express = require('express')
const app = express()

app.get("/uco_price/:currency", async (req, res) => {
    try {
        const uco_price = await getUCOPrice()
        const btc_price = await getBTCPrice(req.params.currency)
    
        res.json({ price: btc_price * uco_price, currency: req.params.currency })
    }
    catch (e) {
        res.json({ error: e.message })
    }
})

app.listen(3000)