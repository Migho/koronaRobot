require('dotenv').config()
const Telegraf = require('telegraf')

const bot = new Telegraf(process.env.TELEGRAM_API)
bot.start((ctx) => ctx.reply('KORONA'))
bot.launch()