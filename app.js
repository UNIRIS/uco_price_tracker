const { getUCOPrice } = require('./blockchainio_api')
const { getBTCPrice } = require('./btc_api')

const app = require('express')()
const cors = require('cors')

app.use(cors())

const path = require('path')
const http = require('http')
const https = require('https')
const fs = require('fs')
const CronJob = require('cron').CronJob;
const readLastLines = require('read-last-lines');

const server = http.createServer(app).listen(5000)

const server = https.createServer({
    key: fs.readFileSync(process.env["SSL_KEY"]),
    cert: fs.readFileSync(process.env["SSL_CERT"])
}, app)

const io = require('socket.io')(server);

const port = process.env["UCO_TRACKER_PORT"] || 3000

const searchPrice = function (currency) {
    return new Promise(async (resolve, reject) => {
        try {
            const uco_price = await getUCOPrice()
            console.log(`UCO Price: ${uco_price}`)
            const btc_price = await getBTCPrice(currency)
            console.log(`BTC Price in ${currency}: ${btc_price}`)
            console.log(`UCO Price in ${currency}: ${btc_price * uco_price}`)
            return resolve(btc_price * uco_price)
        }
        catch (e) {
            console.log(e)
            return reject(e.message)
        }
    })
}

const log_file = path.join(__dirname, "uco_history_eur")

const putPrice = function(price) {
    return new Promise((resolve, reject) => {
        fs.writeFile(log_file, `${new Date().toLocaleString()} - ${price}\n`, { flag: 'a+'}, err => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}

const getPrice = function() {
    return new Promise((resolve, reject) => {
        return readLastLines.read(log_file, 1).then(line => {
            splitted_entry = line.split(' - ')
            resolve(parseFloat(splitted_entry[1].replace("\n", "")))
        })
    })
}

const job = new CronJob('10 * * * * *', async () => {
    price = await searchPrice("EUR")
    await putPrice(price)
}, null, true, 'Etc/UTC');

job.start();

io.on('connection', (socket) => {
    socket.on("uco_price", () => {
        setInterval(() => {
            getPrice().then(price => {
                socket.emit("uco_price", price)
            })
        }, 10000)
    })
})

app.get("/uco_price", (req, res) => {
    getPrice().then(price => {
        res.json(price)
    })
    .catch((e) => {
        res.json({ error: e})
    })
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


server.listen(port, () => {
    console.log(`Application listening on ${port}`)
})
