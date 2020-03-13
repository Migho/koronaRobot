require('dotenv').config()
const _ = require('lodash');
const schedule = require('node-schedule');
const Telegraf = require('telegraf')
const extra = require('telegraf/extra')
const markup = extra.markdown()
const axios = require('axios');
const getNews = require('./news');
const casesPerCountry = require('./countries');

const url = "https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData";
const subscribers = [];

const getLastDay = data => {
    let results = []
    data.forEach(e => {
        if(new Date(e.date).getTime() > new Date(new Date().setDate(new Date().getDate()-1)).getTime()) {
            results.push(e)
        }
    })
    return results
}

const getRandomEncourage = () => {
    return _.sample([
        'Luoja meitä varjelkoon!',
        'Kyllä se siitä!',
        'Käy äkkiä hakemassa lisää vessapaperia!',
        'Kielletään kaikki!',
        '💉💉💉',
        'Paha paha...',
        'Kantsii varoo!',
        'Tänään kannattaa pysyä kotona!',
        'Muista pestä käsiä!',
        '😶',
        'Varo vaaraa!'
    ]);
}

const getRandomRelief = () => {
    return _.sample([
        'Kaikki kääntyi parempaan päin!',
        'Pian koittaa ilon ja onnen päivät!',
        'Enää ei tarvitse hamstrata!',
        'Valoa tunnelin päässä?',
        '✨✨✨'
    ]);
}

const parseChange = value => {
    return (value > 0 ? `+*${value}*` : value < 0 ? `-*${Math.abs(value)}*` : `*${value}*`) + " _viimeisen 24h aikana_";
}

const parseSimpleStats = resp => {
    const total = resp.data.confirmed.length - resp.data.deaths.length - resp.data.recovered.length
    let totalChange = getLastDay(resp.data.confirmed).length - getLastDay(resp.data.recovered).length - getLastDay(resp.data.deaths).length

    return `Sairaita: *${resp.data.confirmed.length - resp.data.deaths.length - resp.data.recovered.length}* (${parseChange(totalChange)})\n` +
    `Infektotuneita: *${resp.data.confirmed.length}* (${parseChange(getLastDay(resp.data.confirmed).length)})\n` +
    `Parantuneita: *${resp.data.recovered.length}* (${parseChange(getLastDay(resp.data.recovered).length)})\n` +
    `Kuolleita: *${resp.data.deaths.length}* (${parseChange(getLastDay(resp.data.deaths).length)})\n` +
    `Viiruksen lähdemaa:\n${casesPerCountry(resp.data.confirmed)}\n` +
    `_${totalChange >= 0 ? getRandomEncourage() : getRandomRelief()}_`
}

// OLD
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
        subscribers.forEach(chatId => bot.telegram.sendMessage(chatId, parseSimpleStats(resp)))
    }).catch(err => {
        console.error("ERROR:", err);
    });
})

schedule.scheduleJob('0 * * * * *', () => {
    getNews(true).then(news => {
        news.forEach(n => {
            subscribers.forEach(chatId => bot.telegram.sendMessage(chatId, n));
        })
    }).catch(err => {
        console.error("ERROR:", err);
        ctx.reply("Something went wrong!");
    });
})

const bot = new Telegraf(process.env.TELEGRAM_API)

bot.start((ctx) => {
    subscribers.push(ctx.chat.id)
    ctx.reply("Subscribed to Korona news!");
    ctx.reply("Type '/stats' to get the newest statistics.");
    ctx.reply("Type '/news' to get the current news.");
})

bot.command('stats', (ctx) => {
    axios.get(url).then(resp => {
        bot.telegram.sendMessage(ctx.message.chat.id, parseSimpleStats(resp), markup);
    }).catch(err => {
        console.error("ERROR:", err);
        ctx.reply("Something went wrong!");
    });
})

bot.command('news', (ctx) => {
    getNews(false).then(news => {
        news.forEach(n => ctx.reply(n));
    }).catch(err => {
        console.error("ERROR:", err);
        ctx.reply("Something went wrong!");
    });
})

bot.launch()
