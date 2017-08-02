require('dotenv').config();
const sendMsg = require('./send-message');

sendMsg({account id}, {
    type: 'text',
    text: {message text}
});