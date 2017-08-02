require('dotenv').config();
var request = require('request');
var options = {
    uri: "https://apis.worksmobile.com/" + process.env.API_ID + "/message/registerBotDomain/v2",
    headers: {
        "Content-type": "application/json",
        "consumerKey": process.env.CONSUMER_KEY,
        "Authorization": process.env.TOKEN
    },
    json: {
        "botNo": Number(process.env.BOT_NO),
        "domainId": 0
    }
};
request.post(options, function (error, response, body) {
    console.log(body);
});