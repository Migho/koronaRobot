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

const getLastWeek = data => {
    const results = [];
    data.forEach(e => {
        if(new Date(e.date).getTime() > new Date(new Date().setDate(new Date().getDate()-7)).getTime()) {
            results.push(e)
        }
    });
    return results;
}

const parseChange = value => {
    return (value > 0 ? `+*${value}*` : value < 0 ? `-*${Math.abs(value)}*` : `*${value}*`) + " _viim. 24h aikana_";
}

// Dirtyhack. Make it more beautiful later when gradu is not killing.
const parseWeekChange = value => {
    return (value > 0 ? `+*${value}*` : value < 0 ? `-*${Math.abs(value)}*` : `*${value}*`) + " _viim. 7d aikana_";
}

const parseSimpleStats = data => {
    const hospitalizedAll = data.hospitalised.filter(e => e.area === 'Finland');

    return `Tartuntoja: *${data.cases.confirmed.length}* (${parseWeekChange(getLastWeek(data.cases.confirmed).length)})\n` +
    `Kuolleita: *${data.cases.deaths.length}* (${parseChange(getLastDay(data.cases.deaths).length)})\n` +
    ` - - - \n` +
    `Sairaalahoidossa: *${hospitalizedAll[0].totalHospitalised}* (${parseChange(hospitalizedAll[0].totalHospitalised - hospitalizedAll[1].totalHospitalised)})\n` +
    `Joista teholla: *${hospitalizedAll[0].inIcu}* (${parseChange(hospitalizedAll[0].inIcu - hospitalizedAll[1].inIcu)})\n` +
    ` - - - \n` +
    `_${getLastDay(data.cases.confirmed).length - getLastDay(data.cases.recovered).length >= 0 ? getRandomEncourage() : getRandomRelief()}_`;
}

const parseAdvancedStats = data => {
    const hospitalizedAll = data.hospitalised.filter(e => e.area === 'Finland');

    return `Tartuntoja: *${data.cases.confirmed.length}* (${parseWeekChange(getLastWeek(data.cases.confirmed).length)})\n` +
    `Kuolleita: *${data.cases.deaths.length}* (${parseChange(getLastDay(data.cases.deaths).length)})\n` +
    ` - - - \n` +
    `Sairaalahoidossa: *${hospitalizedAll[0].totalHospitalised}* (${parseChange(hospitalizedAll[0].totalHospitalised - hospitalizedAll[1].totalHospitalised)})\n` +
    `Joista teholla: *${hospitalizedAll[0].inIcu}* (${parseChange(hospitalizedAll[0].inIcu - hospitalizedAll[1].inIcu)})\n`
}

module.exports = { parseSimpleStats, parseAdvancedStats };