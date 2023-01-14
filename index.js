const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')

const token = '5697588352:AAFDUAi6nUhQc63GSxT_maDtdNdl6CcRI7w'
const PORT = 8000
 const webAppUrl = 'https://tg-web-app-react-sigma.vercel.app'

const bot = new TelegramBot(token, {polling: true})
const app = express()

app.use(express.json())
app.use(cors())

const urlGeoSalon='https://www.google.com/maps/place/Arkin+kuafor+guzellik+salonu/@36.6926803,34.4460278,18.12z/data=!4m5!3m4!1s0x14d8774e7e8b49ed:0xbe92973d74c2d4af!8m2!3d36.6920018!4d34.4449682?hl=ru'

bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const text = msg.text

    if(text === '/start') {

        await bot.sendMessage(chatId, 'Посмотреть геолокацию салона красоты', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Геолокация', web_app: {url: urlGeoSalon}}]
                ]
            }
        })
        await bot.sendMessage(chatId, 'Cалон красоты "Arkin"', {
            reply_markup: {
                keyboard: [
                    [{text: 'Записаться', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })
        await bot.sendMessage(chatId, 'Посмотреть работы, можно здесь', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Работы', web_app: {url: webAppUrl}}]
                ]
            }
        })

    }

    if (msg?.web_app_data?.data) {
        try {
            console.log('msg?.web_app_data?.data',msg?.web_app_data?.data)
            const data = JSON.parse(msg?.web_app_data?.data)
            
            console.log('ПРИНИМАЕМ ДАТУ',data)
            //
            // {
            //     services:selected,
            //         comment,
            //         date:valueDate,
            //     time
            // }

            await bot.sendMessage(chatId, 'Запись успешно создано')
            await bot.sendMessage(chatId, 'Ваша услуги: ' + data?.services.map(s => s.join(', ')))
            await bot.sendMessage(chatId, 'Дата и время: ' + data?.date + ` - ${data.time}`)
            await bot.sendMessage(chatId, 'Комментария: ' + data?.comment)

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
            title: 'Успешная покупка',
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
