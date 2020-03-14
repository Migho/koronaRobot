const casesPerCountry = require('./countries');
const { getRandomEncourage, getRandomRelief } = require('./random');

const getLastDay = data => {
    const results = [];
    data.forEach(e => {
        if(new Date(e.date).getTime() > new Date(new Date().setDate(new Date().getDate()-1)).getTime()) {
            results.push(e)
        }
    });
    return results;
}

const parseChange = value => {
    return (value > 0 ? `+*${value}*` : value < 0 ? `-*${Math.abs(value)}*` : `*${value}*`) + " _viimeisen 24h aikana_";
}

const parseSimpleStats = resp => {
    const totalChange = getLastDay(resp.data.confirmed).length - getLastDay(resp.data.recovered).length - getLastDay(resp.data.deaths).length;

    return `Sairaita: *${resp.data.confirmed.length - resp.data.deaths.length - resp.data.recovered.length}* (${parseChange(totalChange)})\n` +
    `Infektotuneita: *${resp.data.confirmed.length}* (${parseChange(getLastDay(resp.data.confirmed).length)})\n` +
    `Parantuneita: *${resp.data.recovered.length}* (${parseChange(getLastDay(resp.data.recovered).length)})\n` +
    `Kuolleita: *${resp.data.deaths.length}* (${parseChange(getLastDay(resp.data.deaths).length)})\n` +
    `_${totalChange >= 0 ? getRandomEncourage() : getRandomRelief()}_`;
}

const parseAdvancedStats = resp => {
    const totalChange = getLastDay(resp.data.confirmed).length - getLastDay(resp.data.recovered).length - getLastDay(resp.data.deaths).length;

    return `Sairaita: *${resp.data.confirmed.length - resp.data.deaths.length - resp.data.recovered.length}* (${parseChange(totalChange)})\n` +
    `Infektotuneita: *${resp.data.confirmed.length}* (${parseChange(getLastDay(resp.data.confirmed).length)})\n` +
    `Parantuneita: *${resp.data.recovered.length}* (${parseChange(getLastDay(resp.data.recovered).length)})\n` +
    `Kuolleita: *${resp.data.deaths.length}* (${parseChange(getLastDay(resp.data.deaths).length)})\n` +
    `Viiruksen lähdemaa:\n${casesPerCountry(resp.data.confirmed)}\n`;
}

module.exports = { parseSimpleStats, parseAdvancedStats };