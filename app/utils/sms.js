const Nexmo = require('nexmo');

const sendSms = async (content, phone) => {
    const nexmo = new Nexmo({
    apiKey: '0afc81ec',
    apiSecret: 'TPrrik9oiWZOlkOc'
    })

    const from = 'Habit Tune'
    const to = '201274596094'
    const text = content;

    nexmo.message.sendSms(from, to, text)
    return Promise.resolve();
}

const sendActivationCode = async (user, code) => {
    return sendSms(`Hi ${user.name}\nThis is the activatioin Code: ${code}`, user.phone);
}

const sendPhoneCode = async (user, code) => {
    return sendSms(`Hi ${user.name}\nThis is the verification Code: ${code}`, user.phone);
}

const sendResetCode = async (user, code) => {
    return sendSms(`Hi ${user.name}\nThis is the reset Code: ${code}`, user.phone);
}

module.exports = {sendActivationCode, sendPhoneCode, sendResetCode};
