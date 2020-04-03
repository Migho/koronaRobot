require('dotenv').config()
const schedule = require('node-schedule');
const Telegraf = require('telegraf')
const extra = require('telegraf/extra')
const markup = extra.markdown()
const axios = require('axios');
const getNews = require('./news');
const { parseSimpleStats, parseAdvancedStats } = require('./stats');
const { getRandomExcuse } = require('./random');

const URL_CASES = "https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData/v2";
const URL_HOSPITALISED = "https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaHospitalData";
const newsSubscribers = new Set();
const statsSubscribers = new Set();

// Axios calls
const getData = async () => {
    const [cases, hospitalised] = await axios.all([axios.get(URL_CASES), axios.get(URL_HOSPITALISED)]);
    const reverseHospitalised = hospitalised.data.hospitalised.reverse()
    return {
        cases: cases.data,
        hospitalised: reverseHospitalised
    }
}

// Crons
schedule.scheduleJob('0 0 6 * * *', async () => {
    try {
        const data = await getData()
        statsSubscribers.forEach(chatId => bot.telegram.sendMessage(chatId, parseSimpleStats(data), markup))
    } catch(err) {
        console.error("ERROR:", err);
    };
})

schedule.scheduleJob('0 * * * * *', () => {
    getNews(false).then(news => {
        news.forEach(n => {
            newsSubscribers.forEach(chatId => bot.telegram.sendMessage(chatId, n));
        })
    }).catch(err => {
        console.error("ERROR:", err);
    });
})

// Bot stuff
const bot = new Telegraf(process.env.TELEGRAM_API)

bot.start((ctx) => {
    ctx.reply("Commands: /stats | /news | /subscribenews | /subscribestats | /unsubscribe");
})

bot.command('subscribenews', (ctx) => {
    newsSubscribers.add(ctx.chat.id)
    ctx.reply("Subscribed to HS Korona news!");
})

bot.command('subscribestats', (ctx) => {
    statsSubscribers.add(ctx.chat.id)
    ctx.reply("Subscribed to daily stats!");
})

bot.command('unsubscribe', (ctx) => {
    newsSubscribers.delete(ctx.chat.id)
    statsSubscribers.delete(ctx.chat.id)
    ctx.reply('Unsubscribed from all lists :(');
})

bot.command('stats', async (ctx) => {
    try {
        bot.telegram.sendMessage(ctx.message.chat.id, parseAdvancedStats(await getData()), markup);
    } catch(err) {
        console.error("ERROR:", err);
        ctx.reply(getRandomExcuse());
    };
})

bot.command('news', (ctx) => {
    getNews(true).then(news => {
        news.forEach(n => ctx.reply(n));
    }).catch(err => {
        console.error("ERROR:", err);
        ctx.reply(getRandomExcuse());
    });
})

bot.launch()
