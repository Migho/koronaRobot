const Parser = require('rss-parser');
const parser = new Parser();
const oldNews = new Set();
const ONE_MINUTE_IN_MS = 60000;

const getNews = async (useTimer) => {
    const feed = await parser.parseURL('https://www.hs.fi/rss/tuoreimmat.xml');
    const now = new Date().getTime();
    const news = [];
    
    feed.items.forEach(item => {
        const isCoronaNews = item.title.includes("korona") ||
            item.title.includes("tartunt") ||
            item.title.includes("Korona") ||
            item.title.includes("Tartunt");
        const correctTime = useTimer ? (now - Date.parse(item.pubDate)) < ONE_MINUTE_IN_MS : true;
        const isNotOldNews = !oldNews.has(item.guid);

        if (isCoronaNews && correctTime && isNotOldNews) {
            const splitTitle = item.title.split("|").length;
            if (splitTitle.length == 2) {
                news.push(splitTitle[1].trim() + ': ' + item.link + "\n");
            } else {
                news.push(item.title.trim() + ': ' + item.link + "\n");
            }
            oldNews.add(item.guid);
        }
    });

    return news;
}

module.exports = getNews;