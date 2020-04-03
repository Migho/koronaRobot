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
    return (value > 0 ? `+*${value}*` : value < 0 ? `-*${Math.abs(value)}*` : `*${value}*`) + " _viim. 24h aikana_";
}

const parseSimpleStats = data => {
    const totalChange = getLastDay(data.cases.confirmed).length - getLastDay(data.cases.recovered).length - getLastDay(data.cases.deaths).length;
    const hospitalizedAll = data.hospitalised.filter(e => e.area === 'Finland');

    return `Tartuntoja: *${data.cases.confirmed.length}* (${parseChange(getLastDay(data.cases.confirmed).length)})\n` +
    `Parantuneita: *${data.cases.recovered.length}* (${parseChange(getLastDay(data.cases.recovered).length)})\n` +
    `Kuolleita: *${data.cases.deaths.length}* (${parseChange(getLastDay(data.cases.deaths).length)})\n` +
    ` - - - \n` +
    `Sairaita: *${data.cases.confirmed.length - data.cases.deaths.length - data.cases.recovered.length}* (${parseChange(totalChange)})\n` +
    `Sairaalahoidossa: *${hospitalizedAll[0].totalHospitalised}* (${parseChange(hospitalizedAll[0].totalHospitalised - hospitalizedAll[1].totalHospitalised)})\n` +
    `Joista teholla: *${hospitalizedAll[0].inIcu}* (${parseChange(hospitalizedAll[0].inIcu - hospitalizedAll[1].inIcu)})\n` +
    ` - - - \n` +
    `_${getLastDay(data.cases.confirmed).length - getLastDay(data.cases.recovered).length >= 0 ? getRandomEncourage() : getRandomRelief()}_`;
}

const parseAdvancedStats = data => {
    const totalChange = getLastDay(data.cases.confirmed).length - getLastDay(data.cases.recovered).length - getLastDay(data.cases.deaths).length;
    const hospitalizedAll = data.hospitalised.filter(e => e.area === 'Finland');

    return `Tartuntoja: *${data.cases.confirmed.length}* (${parseChange(getLastDay(data.cases.confirmed).length)})\n` +
    `Parantuneita: *${data.cases.recovered.length}* (${parseChange(getLastDay(data.cases.recovered).length)})\n` +
    `Kuolleita: *${data.cases.deaths.length}* (${parseChange(getLastDay(data.cases.deaths).length)})\n` +
    ` - - - \n` +
    `Sairaita: *${data.cases.confirmed.length - data.cases.deaths.length - data.cases.recovered.length}* (${parseChange(totalChange)})\n` +
    `Sairaalahoidossa: *${hospitalizedAll[0].totalHospitalised}* (${parseChange(hospitalizedAll[0].totalHospitalised - hospitalizedAll[1].totalHospitalised)})\n` +
    `Joista teholla: *${hospitalizedAll[0].inIcu}* (${parseChange(hospitalizedAll[0].inIcu - hospitalizedAll[1].inIcu)})\n`
}

module.exports = { parseSimpleStats, parseAdvancedStats };