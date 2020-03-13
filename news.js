const Parser = require('rss-parser');
const parser = new Parser();

const getNews = async () => {
    const feed = await parser.parseURL('https://www.hs.fi/rss/tuoreimmat.xml');
    const news = [];
    
    feed.items.forEach(item => {
        if (item.title.includes("korona", "tartunt")) {
            news.push(item.title.split("|")[1].trim() + ': ' + item.link + "\n");
        }
    });

    return news;
}

module.exports = getNews;