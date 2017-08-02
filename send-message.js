module.exports = function sendMessage(strTo, objContent) {
    const request = require('request');
    const options = {
        uri: "https://apis.worksmobile.com/" + process.env.API_ID + "/message/sendMessage/v2",
        headers: {
            "Content-type": "application/json",
            "consumerKey": process.env.CONSUMER_KEY,
            "Authorization": process.env.TOKEN
        },
        json: {
            "botNo": Number(process.env.BOT_NO),
            "accountId": strTo,
            "content": objContent
        }
    };
    request.post(options, function (error, response, body) {
        console.log(body);
    });
}