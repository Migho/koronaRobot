const Parser = require('rss-parser');
const parser = new Parser();

let newest;

const getNews = async () => {
    const feed = await parser.parseURL('https://www.hs.fi/rss/tuoreimmat.xml');
    const news = [];
    
    feed.items.forEach(item => {
        const now = new Date();
        const pubTime = item.pubDate.split(" ")[4];

        if (item.title.includes("korona", "tartunt") && (now.getTime() - Date.parse(item.pubDate)) < 60000) {
            console.log(Date.parse(item.pubDate));
            news.push(item.title.split("|")[1].trim() + ': ' + item.link + "\n");
        }
    });

    return news;
}

module.exports = getNews;