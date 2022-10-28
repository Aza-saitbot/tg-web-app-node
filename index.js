const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')

const token = '5522402285:AAFXzGLSFo45ixG5MTXZE2JWgqrr4MJrBgE'
const PORT = 8000
const webAppUrl = 'https://web-tg-react-app.netlify.app'

const bot = new TelegramBot(token, {polling: true})
const app = express()

app.use(express.json())
app.use(cors())


bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const text = msg.text

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появиться кнопка заполните форму', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })
    }

    await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Оформить заказ', web_app: {url: webAppUrl}}]
            ]
        }
    })

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)

            await bot.sendMessage(chatId, 'Спасибо за обратную связь')
            await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country)
            await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street)

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Все информацию вы получите в этом чате')
            }, 3000)
        } catch (e) {
            console.log('Ошибка при получении даты от бота', e)
        }
    }

})

app.post('/web-data', async (req, res) => {

    const {products=[], totalPrice, queryId} = req.body

    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная прогулка',
            input_message_content: {
                message_text: `Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, купленные товары: 
               ${products.map(i => i.title).join(', ')}`
            }
        })
        return res.status(200).json({})
    } catch (e) {

        return res.status(500).json({})
    }
})


app.listen(PORT, () => {
    console.log('Server started on port ' + PORT)
})
