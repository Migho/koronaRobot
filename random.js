const _ = require('lodash');

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
};

const getRandomRelief = () => {
    return _.sample([
        'Kaikki kääntyi parempaan päin!',
        'Pian koittaa ilon ja onnen päivät!',
        'Enää ei tarvitse hamstrata!',
        'Valoa tunnelin päässä?',
        '✨✨✨'
    ]);
};

const getRandomExcuse = () => {
    return _.sample([
        'En kerro!',
        'Korona vaivaa, en voi vastata',
        'Älä kysele.'
    ]);
};

module.exports = { getRandomEncourage, getRandomRelief, getRandomExcuse };