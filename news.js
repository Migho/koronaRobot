const Parser = require('rss-parser');
const parser = new Parser();

let newest;

const getNews = async (useTimer) => {
    const feed = await parser.parseURL('https://www.hs.fi/rss/tuoreimmat.xml');
    const news = [];
    
    feed.items.forEach(item => {
        const now = new Date();
        const timeBool = useTimer ? (now.getTime() - Date.parse(item.pubDate)) < 60000 : true;

        if (item.title.includes("korona", "tartunt") && timeBool) {
            news.push(item.title.split("|")[1].trim() + ': ' + item.link + "\n");
        }
    });

    return news;
}

module.exports = getNews;