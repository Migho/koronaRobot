const prettify = (countries) => {
    const keys = Object.keys(countries); 
    return keys.reduce((acc, key, index) => {
        const msg = `${acc}${key}: ${countries[key]}`;
        return index === keys.length - 1 ? msg : msg + "\n";
    }, "");
};

const casesPerCountry = (confirmed) => {
    const countries = {};
    confirmed.forEach(a => {
        const country = a.infectionSourceCountry ? a.infectionSourceCountry : "TUNTEMATON";
        if (countries[country]) {
            countries[country] += 1;
        } else {
            countries[country] = 1;
        }
    });
    return prettify(countries);
};

module.exports = casesPerCountry;