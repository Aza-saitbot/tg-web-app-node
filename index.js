const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')
const dayjs = require('dayjs')
require('dayjs/locale/ru')

const token = '5697588352:AAFDUAi6nUhQc63GSxT_maDtdNdl6CcRI7w'
const PORT = 8000
const webAppUrl = 'https://tg-web-app-react-sigma.vercel.app'

const bot = new TelegramBot(token, {polling: true})
const app = express()

app.use(express.json())
app.use(cors())

const urlGeoSalon = 'https://www.google.com/maps/place/Arkin+kuafor+guzellik+salonu/@36.6926803,34.4460278,18.12z/data=!4m5!3m4!1s0x14d8774e7e8b49ed:0xbe92973d74c2d4af!8m2!3d36.6920018!4d34.4449682?hl=ru'

bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const text = msg.text

    if (text === '/start') {

        await bot.sendMessage(chatId, 'Посмотреть геолокацию салона красоты - Arkin', {
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
            const data = JSON.parse(msg?.web_app_data?.data)
            await bot.sendMessage(chatId, 'Запись успешно создано')
            await bot.sendMessage(chatId, 'Ваша услуги: ' + data?.services.map(s => s).join(', '))
            await bot.sendMessage(chatId, `Дата и время: ${dayjs(data?.date).locale('ru').format('D MMMM')} в ${dayjs(data?.time).format('hh-mm')}`)
            if (data?.comment?.length > 0) {
                await bot.sendMessage(chatId, 'Комментария: ' + data?.comment)
            }
            await bot.sendMessage(chatId, 'Посмотреть геолокацию салона красоты - Arkin', {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Геолокация', web_app: {url: urlGeoSalon}}]
                    ]
                }
            })
            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию Вы получите в этом чате')
            }, 3000)

        } catch (e) {
            console.log('Ошибка при получении даты от бота', e)
        }
    }

})


app.post('/web-data', async (req, res) => {

    const {queryId, ...data} = req.body

    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Запись успешно создано',
            input_message_content: {
                message_text: `Запись успешно создано на ${dayjs(data?.date).locale('ru').format('D MMMM')} в ${dayjs(data?.time).format('hh-mm')}, услуги: ${data?.services.map(s => s).join(', ')} ${data?.comment.length > 0 ? ', комментарии: ' + data?.comment : ''}`
            }
        })

    } catch (e) {
        return res.status(500).json({})
    }
})


app.listen(PORT, () => {
    console.log('Server started on port ' + PORT)
})
