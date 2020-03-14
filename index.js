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

// Random shoutings used later
const getRandomExcuse = () => {
    return _.sample([
        'En kerro!',
        'Korona vaivaa, en voi vastata',
        'Älä kysele.'
    ]);
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
        'Varo vaaraa!',
        'Hae Korona kaupasta, se auttaa!'
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

// Parse
const getLastDay = data => {
    let results = []
    data.forEach(e => {
        if(new Date(e.date).getTime() > new Date(new Date().setDate(new Date().getDate()-1)).getTime()) {
            results.push(e)
        }
    })
    return results
}

const parseChange = value => {
    return (value > 0 ? `+*${value}*` : value < 0 ? `-*${Math.abs(value)}*` : `*${value}*`) + " _viimeisen 24h aikana_";
}

const parseSimpleStats = resp => {
    let totalChange = getLastDay(resp.data.confirmed).length - getLastDay(resp.data.recovered).length - getLastDay(resp.data.deaths).length
    
    return `Sairaita: *${resp.data.confirmed.length - resp.data.deaths.length - resp.data.recovered.length}* (${parseChange(totalChange)})\n` +
    `Infektotuneita: *${resp.data.confirmed.length}* (${parseChange(getLastDay(resp.data.confirmed).length)})\n` +
    `Parantuneita: *${resp.data.recovered.length}* (${parseChange(getLastDay(resp.data.recovered).length)})\n` +
    `Kuolleita: *${resp.data.deaths.length}* (${parseChange(getLastDay(resp.data.deaths).length)})\n` +
    `_${totalChange >= 0 ? getRandomEncourage() : getRandomRelief()}_`
}

const parseAdvancedStats = resp => {
    let totalChange = getLastDay(resp.data.confirmed).length - getLastDay(resp.data.recovered).length - getLastDay(resp.data.deaths).length

    return `Sairaita: *${resp.data.confirmed.length - resp.data.deaths.length - resp.data.recovered.length}* (${parseChange(totalChange)})\n` +
    `Infektotuneita: *${resp.data.confirmed.length}* (${parseChange(getLastDay(resp.data.confirmed).length)})\n` +
    `Parantuneita: *${resp.data.recovered.length}* (${parseChange(getLastDay(resp.data.recovered).length)})\n` +
    `Kuolleita: *${resp.data.deaths.length}* (${parseChange(getLastDay(resp.data.deaths).length)})\n` +
    `Viiruksen lähdemaa:\n${casesPerCountry(resp.data.confirmed)}\n`
}

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
    });
})

// Bot stuff
const bot = new Telegraf(process.env.TELEGRAM_API)

bot.start((ctx) => {
    subscribers.push(ctx.chat.id)
    ctx.reply("Subscribed to Korona news!");
})

bot.command('unsubscribe', (ctx) => {
    var index = subscribers.indexOf(ctx.chat.id)
    if (index !== -1) subscribers.splice(index, 1);
    ctx.reply('Unsubscribed :(');
})

bot.command('stats', (ctx) => {
    axios.get(url).then(resp => {
        bot.telegram.sendMessage(ctx.message.chat.id, parseAdvancedStats(resp), markup);
    }).catch(err => {
        console.error("ERROR:", err);
        ctx.reply(getRandomExcuse());
    });
})

bot.command('news', (ctx) => {
    getNews(false).then(news => {
        news.forEach(n => ctx.reply(n));
    }).catch(err => {
        console.error("ERROR:", err);
        ctx.reply(getRandomExcuse());
    });
})

bot.launch()
