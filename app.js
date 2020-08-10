const { getUCOPrice } = require('./blockchainio_api')
const { getBTCPrice } = require('./btc_api')

const app = require('express')()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = process.env["UCO_TRACKER_PORT"] || 3000

const getPrice = function (currency) {
    return new Promise(async (resolve, reject) => {
        try {
            const uco_price = await getUCOPrice()
            console.log(`UCO Price: ${uco_price}`)
            const btc_price = await getBTCPrice(currency)
            console.log(`BTC Price in ${currency}: ${btc_price}`)
            console.log(`UCO Price in ${currency}: ${btc_price * uco_price}`)
            return resolve({ price: btc_price * uco_price, currency: currency })
        }
        catch (e) {
            console.log(e)
            return reject(e.message)
        }
    })
}

io.on('connection', (socket) => {
    socket.on("uco_price", (currency) => {
        setInterval(() => {
            getPrice(currency)
            .then(price => {
                socket.emit("uco_price", price)
            })
        }, 3000)
    })
})

app.get("/uco_price/:currency", (req, res) => {
    getPrice(req.params.currency)
        .then(price => {
            res.json(price)
        })
        .catch((e) => {
            res.json({ error: e})
        })
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


http.listen(port, () => {
    console.log(`Application listening on ${port}`)
})