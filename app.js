'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const sendMsg = require('./send-message');

app.use(bodyParser.json());
 
app.post('/callback', (req, res) => {
    const reqbody = req.body;
    console.log(reqbody);
    const reqSource = reqbody.source;
    const reqContext = reqbody.content;
    // オウム返し
    sendMsg(reqSource.accountId, new TextMessage(reqContext.text));
    // 画像送信
    //sendMsg(reqSource.accountId, new ImageMessage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Logo.png', 'https://assets-cdn.github.com/images/modules/logos_page/Octocat.png'));
    // リンクメッセージ
    //sendMsg(reqSource.accountId, new LinkMessage('link to Qiita', reqContext.text, 'http://qiita.com/'));
    return;
});

//サーバ起動
app.listen(port);

class TextMessage {
    constructor(strText) {
        this.type = 'text';
        this.text = strText || 'empty text';
    }
}

class ImageMessage {
    constructor(strPreviewUrl, strResourceUrl) {
        this.type = 'image';
        this.previewUrl = strPreviewUrl || '';
        this.resourceUrl = strResourceUrl || '';
    }
}

class LinkMessage {
    constructor(strContentText, strLinkText, strLink) {
        this.type = 'link';
        this.contentText = strContentText || '';
        this.linkText = strLinkText || '';
        this.link = strLink || '';
    }
}