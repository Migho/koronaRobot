require('dotenv').config()
const schedule = require('node-schedule');
const Telegraf = require('telegraf')
const extra = require('telegraf/extra')
const markup = extra.markdown()
const axios = require('axios');
const fs = require('fs');

const getNews = require('./news');
const { parseSimpleStats, parseAdvancedStats } = require('./stats');
const { getRandomExcuse } = require('./random');

const URL_CASES = "https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData/v2";
const URL_HOSPITALISED = "https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaHospitalData";
const STATS_SUBSCRIBERS_FILE = "statsSubscribers.txt"
const NEWS_SUBSCRIBERS_FILE = "newsSubscribers.txt"

let newsSubscribers = new Set();
let statsSubscribers = new Set();

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
schedule.scheduleJob('0 0 9 * * *', async () => {
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

// "Database" commands. todo create separate file for these.
const saveSet = (fileName, set) => {
    fs.writeFile(fileName, JSON.stringify([...set]), (err) => {
        if (err) throw err;
    });
}

// Bot stuff
const bot = new Telegraf(process.env.TELEGRAM_API)

bot.start((ctx) => {
    ctx.reply("Commands: /stats | /news | /subscribenews | /subscribestats | /unsubscribe");
})

bot.command('subscribenews', (ctx) => {
    try {
        newsSubscribers.add(ctx.chat.id)
        saveSet(NEWS_SUBSCRIBERS_FILE, newsSubscribers)
        ctx.reply("Subscribed to HS Korona news!");
    } catch(err) {
        console.error("ERROR:", err);
        ctx.reply(getRandomExcuse());
    };
})

bot.command('subscribestats', (ctx) => {
    try {
        statsSubscribers.add(ctx.chat.id)
        saveSet(STATS_SUBSCRIBERS_FILE, statsSubscribers)
        ctx.reply("Subscribed to daily stats!");
    } catch(err) {
        console.error("ERROR:", err);
        ctx.reply(getRandomExcuse());
    };
})

bot.command('unsubscribe', (ctx) => {
    try {
        newsSubscribers.delete(ctx.chat.id)
        statsSubscribers.delete(ctx.chat.id)
        saveSet(NEWS_SUBSCRIBERS_FILE, newsSubscribers)
        saveSet(STATS_SUBSCRIBERS_FILE, statsSubscribers)
        ctx.reply('Unsubscribed from all lists');
    } catch(err) {
        console.error("ERROR:", err);
        ctx.reply(getRandomExcuse());
    };
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

// Load data, start the bot
fs.readFile(STATS_SUBSCRIBERS_FILE, function (err, data) {
    if (err) {
        console.warn("WARN: The stats subscribers file might be missing or broken.")
    } else {
        statsSubscribers = new Set(JSON.parse(data))
        console.log(`Successfully loaded ${statsSubscribers.size} stats subscribers`)
    }
});

fs.readFile(NEWS_SUBSCRIBERS_FILE, function (err, data) {
    if (err) {
        console.warn("WARN: The news subscribers file might be missing or broken.")
    } else {
        statsSubscribers = new Set(JSON.parse(data))
        console.log(`Successfully loaded ${statsSubscribers.size} news subscribers`)
    }
});

bot.launch()
