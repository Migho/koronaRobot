require('dotenv').config()
console.log("key:", process.env.TELEGRAM_API);
const Telegraf = require('telegraf')
const axios = require('axios');

const url = "https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData";

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

const casesPerCountry = (confirmed) => {
    const countries = {};
    confirmed.forEach(a => {
        const country = a.infectionSourceCountry ? a.infectionSourceCountry : "UNKNOWN";
        if (countries[country]) {
            countries[country] += 1;
        } else {
            countries[country] = 1;
        }
    });
    return JSON.stringify(countries);
};

const bot = new Telegraf(process.env.TELEGRAM_API)

bot.start((ctx) => {
    axios.get(url).then(resp => {
        ctx.reply(parseResponse(resp));
    }).catch(err => {
        console.error("ERROR:", err);
        ctx.reply("Something went wrong!");
    });
})

bot.launch()