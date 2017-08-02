require('dotenv').config();
var request = require('request');
var options = {
    uri: "https://apis.worksmobile.com/" + process.env.API_ID + "/message/registerBot/v2",
    headers: {
        "Content-type": "application/json",
        "consumerKey": process.env.CONSUMER_KEY,
        "Authorization": process.env.TOKEN
    },
    json: {
        "name": {bot name},
        "photoUrl": "https://developers.worksmobile.com/favicon.png",
        "status": 1
    }
};
request.post(options, function (error, response, body) {
    console.log(body);
});