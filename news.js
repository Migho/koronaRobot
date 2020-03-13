let Parser = require('rss-parser');
let parser = new Parser();

const getNews = async () => {
    let feed = await parser.parseURL('https://www.hs.fi/rss/tuoreimmat.xml');
    let news = "";
    
    feed.items.forEach(item => {
        if (item.title.includes("korona", "tartunt")) {
            news = news.concat(item.title.split("|")[1].trim() + ': ' + item.link + "\n");
        }
    });

    return news;
}

module.exports = getNews;