const prettify = (countries) => {
    const keys = Object.keys(countries); 
    return keys.reduce((acc, key, index) => {
        const a = acc + key + ": " + countries[key];
        return index === keys.length - 1 ? a : a + ", ";
    }, "");
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
    return prettify(countries);
};

module.exports = casesPerCountry;