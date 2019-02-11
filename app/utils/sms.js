
const sendSms = async (content, phone) => {
    console.log(`SMS sent to ${phone}\n"${content}"\n`);
    return Promise.resolve();
}

const sendActivationCode = async (user, code) => {
    return sendSms(`Hi ${user.name}\nThis is the activatioin Code: ${code}`, user.phone);
}

module.exports = {sendActivationCode};
