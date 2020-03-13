require('dotenv').config()
const schedule = require('node-schedule');
console.log("key:", process.env.TELEGRAM_API);
const Telegraf = require('telegraf')
const axios = require('axios');
const casesPerCountry = require('./country');

const url = "https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData";
const subscribers = []

const parseResponse = (resp) => {
    const confirmed = JSON.stringify(resp.data.confirmed.slice(0,5));
    const deaths = JSON.stringify(resp.data.deaths);
    const recovered = JSON.stringify(resp.data.recovered);
    return `NUMBER OF CONFIRMED CASES:\n\n${resp.data.confirmed.length}\n\n
    CASES PER COUNTRY:\n\n${casesPerCountry(resp.data.confirmed)}\n\n
    FIVE LATEST CONFIRMED CASES:\n\n${confirmed}\n\n
    DEATHS:\n\n${deaths}\n\n
    RECOVERED:\n\n${recovered}`;
};

// Crons
schedule.scheduleJob('0 0 10 * * *', () => {
    axios.get(url).then(resp => {
        subscribers.forEach(chatId => bot.telegram.sendMessage(chatId, parseResponse(resp)))
    }).catch(err => {
        console.error("ERROR:", err);
    });
})

const bot = new Telegraf(process.env.TELEGRAM_API)

bot.start((ctx) => {
    subscribers.push(ctx.chat.id)
    ctx.reply("Subscribed to Korona news!");
})

bot.command('stats', (ctx) => {
    axios.get(url).then(resp => {
        ctx.reply(parseResponse(resp));
    }).catch(err => {
        console.error("ERROR:", err);
        ctx.reply("Something went wrong!");
    });
})

bot.launch()