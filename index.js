const { Client, Message, Chat, Contact, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { OpenAI } = require('openai');
const webversion = "2.2412.54";
require('dotenv').config();


const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY
});


const client = new Client({
    authStrategy: new LocalAuth(),
    webVersion: webversion,
    webVersionCache: {
        type: "remote",
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${webversion}.html`,
    },
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// print the QR code to the console
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// listern to all incoming messages
client.on('message_create', async message => {

    const chat = await message.getChat();
    if (chat.archived) return;

    // console.log(message.body)

    if (chat.isGroup) {
        await handleGroupMessage(message, chat);
    } else {
        await handlePrivateMessage(message, chat);
    }

});


/**
 * @param { Message } message
 * @param { Chat } chat
 */
async function handleGroupMessage(message, chat) {

    // in group messages, listern to the word אמלק
    if (message.body.split(' ')[0] === 'אמלק') {
        let messages = await chat.fetchMessages({ limit: 5 });

        // don't use the OpenAI api if it was just used in the last 5 messages. to avoid unnecessary cost
        if (messages.filter(msg => msg.body.split(' ')[0] === 'אמלק').length > 1) {
            message.react('🙄');
            message.reply(`יופי! אני שמח שהפיצ'ר אמלק צובר פופולריות. אני לא מאמלק עכשיו שוב, כי כבר אימלקתי לפני הודעות ספורות.` +
                `\n\n` +
                `נ.ב. אמ;לק זה קיצור של "ארוך מידי, לא קראתי" ובסלנג האינטרנטי הפועל "לאמלק" זה לסכם בקצרה הרבה הודעות / הודעות ארוכות.`);
        } else {
            await summarize(message, chat);
        }
    }
}


/**
 * @param { Message } message
 * @param { Chat } chat
 */
async function handlePrivateMessage(message, chat) {

    // just trying to create a loader...
    if (message.body.toLowerCase() === 'test') {
        const dotsArr = [
            'אני מכין לך את הסיכום,\nרק רגע',
            'אני מכין לך את הסיכום,\nרק רגע.',
            'אני מכין לך את הסיכום,\nרק רגע..',
            'אני מכין לך את הסיכום,\nרק רגע...',
            'אני מכין לך את הסיכום,\nרק רגע....',
            'אני מכין לך את הסיכום,\nרק רגע.....',
            'אני מכין לך את הסיכום,\nרק רגע......',
        ]
        let reply = await message.reply(dotsArr[0]);
        let i = 0;
        let interval = setInterval(function () {
            i++;
            reply.edit(dotsArr[i % 7]);
        }, 280)
        setTimeout(() => {
            clearInterval(interval);
            setTimeout(() => {
                reply.edit('הנה התשובה');
            }, 300);
        }, 5000);
    }

    // handle voice notes
    if (message.type === 'ptt') {
        // client.sendMessage(message.from, 'אם אפשר לכתוב, זה עדיף לי. לא תמיד אני זמין לשמיעת הודעות קוליות. תודה.');
    } else if (message.body === 'אתה בוט?' || message.body === 'אתה בוט ?') {
        message.reply('איך עלית עליי? \nאני אכן סוג של בוט, אבל לא הסוג שאתה חושב. אני אותו מורדי שאתה מכיר כבר שנים ומעולם לא חשדת... תמיד הייתי בוט.')
    } else if (message.body === 'תודה') {
        message.react('💜')
    } else {
        // message.react('👍')
    }
}


/**
 * @param { Message } message
 * @param { Chat } chat
 */
async function summarize(message, chat) {

    let limit = 50;

    if (!isNaN(message.body.split(' ')[1])) {
        limit = Math.min(500, message.body.split(' ')[1]);
    }

    const dotsArr = [
        'אני מכין לך את הסיכום,\nרק רגע',
        'אני מכין לך את הסיכום,\nרק רגע.',
        'אני מכין לך את הסיכום,\nרק רגע..',
        'אני מכין לך את הסיכום,\nרק רגע...',
        'אני מכין לך את הסיכום,\nרק רגע....',
        'אני מכין לך את הסיכום,\nרק רגע.....',
        'אני מכין לך את הסיכום,\nרק רגע......',
    ];
    let reply = await message.reply(dotsArr[0]);
    let i = 0;
    let interval = setInterval(function () {
        i++;
        reply.edit(dotsArr[i % 7]);
    }, 300);

    const prompt = `תסכם את ההתכתבות הבאה. הסיכום צריך לכלול את הנקודות העיקריות שנכתבו ולהגיד מי הכותב. תוודא שאתה כולל את כל הנקודות החשובות שנכתבו, ותתעלם מהודעות חוזרות. האורך של הסיכום צריך להיות מותאם לכמות ההודעות ולמורכבות שלהם, ולתת סיכום ברור וקצר של כל מה שנכתב בלי לפספס נקודות חשובות. אם מישהו מספר משהו, תכלול תקציר של הסיפור.
    לפני הסיכום תכתוב את המשפט הבא: "היי, אני הבוט של מורדי ואשמח לסכם לך את ההודעות האחרונות (עד ${limit} הודעות)" ואז בשורה חדשה תכתוב את הסיכום.`;

    let messages = await chat.fetchMessages({ limit: limit });

    messages = await Promise.all(messages.map(async msg => ({
        contact: getContactName(await msg.getContact()),
        body: msg.body || `{ ${msg.type} }`,
    })));

    messages = messages.map(msg => `from: ${msg.contact}. message: ${msg.body}`).join('\n');
    console.log(messages);

    const gpt = await openai.chat.completions.create({
        // model: "gpt-3.5-turbo",
        model: "gpt-4o",
        temperature: 0,
        messages: [
            {
                role: "system",
                content: [{ type: "text", text: prompt }]
            },
            {
                role: "user",
                content: [{ "type": "text", "text": messages }]
            },
        ]
    });

    console.log(gpt.choices[0].message.content);

    clearInterval(interval);
    setTimeout(() => {
        reply.edit(gpt.choices[0].message.content);
    }, 300);
}



/**
 * @param { Contact } contact
 * @returns { string }
 */
function getContactName(contact) {
    if (contact.pushname?.length > 2) return contact.pushname;
    else return contact.number;
}

client.initialize();

