const Nexmo = require('nexmo');
const {preparePhone} = require('./utils');
const config = require('config');

const sendSms = async (content, phone) => {
    const nexmoKey = config.get('nexmo.key');
    const nexmoSecret = config.get('nexmo.secret');
    phone = preparePhone(phone);
    
    const nexmo = new Nexmo({
        apiKey: nexmoKey,
        apiSecret: nexmoSecret
    })

    const from = 'Habit Tune'
    let to = phone;
    const text = content;

    if (config.has('nexmo.defaultPhone')) {
        const defaultPhone = config.get('nexmo.defaultPhone');
        if (typeof(defaultPhone) === 'string' && defaultPhone.length > 0) {
            to = defaultPhone;
        }
    }

    nexmo.message.sendSms(from, to, text, {"type": "unicode"}, (err, res) => {
        if (err) {
            console.log("Sms Error", err);
        } else {
            console.log("Sms Sent", res);
        }
    })
    return Promise.resolve();
}

const sendActivationCode = async (user, code) => {
    return sendSms(`استخدم ${code} كرمز تنشيط حسابك علي Habit Tune`, user.phone);
}

const sendPhoneCode = async (user, code) => {
    return sendSms(`استخدم ${code} كرمز تنشيط هاتفك علي Habit Tune`, user.phone);
}

const sendResetCode = async (user, code) => {
    return sendSms(`استخدم ${code} كرمز إعادة تعيين كلمة مرور حساب Habit Tune`, user.phone);
}

module.exports = {sendActivationCode, sendPhoneCode, sendResetCode};
