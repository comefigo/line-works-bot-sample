require('dotenv').config();
var request = require('request');
var options = {
    uri: "https://apis.worksmobile.com/" + process.env.API_ID + "/message/getBotList/v2",
    headers: {
        "Content-type": "application/json",
        "consumerKey": process.env.CONSUMER_KEY,
        "Authorization": process.env.TOKEN
    },
    json: {
        "isActive": false
    }
};

request.post(options, function (error, response, body) {
    console.log(body);
});