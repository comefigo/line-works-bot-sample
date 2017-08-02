# 概要

LINE WORKSのトークBOTをローカルのNodeJSで実装してみました
今回は必要最低限のステップで実装することを目的にしています
とりあえずどんなものかを試したい方向けになります

[公式ドキュメント](https://developers.worksmobile.com/jp/document/1002001)で手順や仕様が丁寧に書かれていましたので、
LINE Messaging APIでBOTを実装したことがある方でしたらすんなりとできると思います

# Messaging API との違い

現時点の仕様（2017.8.2）ではMessaging APIのほうがインタラクティブなメッセージのやり取りが可能で、LINE WORKSでは企業向けということもあり、組織管理のAPIが充実しているが、残念ながらメッセージ関連のAPIは物寂しい状態（[Template Messageのようなリッチなものはない](https://devdocs.line.me/ja/#template-message)）



# 条件

- [LINE WORKS](https://line.worksmobile.com/jp/)が利用できること（体験版でもOK）
- [適切な権限](https://admin.worksmobile.com/admin/auth/list)があること（Developers権限があればOK？）


# API利用の設定

1. [Developer Console](https://developers.worksmobile.com/jp/console)にログイン
2. [API メニュー](https://developers.worksmobile.com/jp/console/openapi/main)に遷移
3. *API ID*を生成  
   .envファイルの***API_ID***に追加
4. *Server API Consumer Key*を生成  
   .envファイルの***CONSUMER_KEY***に追加
   Service APIは利用しない
5. Server List（固定IPタイプ）に自ネットワークのグローバルIPを登録  
   .envファイルの***TOKEN***に"Bearer {生成されたToken}"追加（BearerとTokenの間には半角スペース必要）  
   ※ BOTサーバをローカルに立てた場合は、自身のグローバルIPを[こちら](https://www.cman.jp/network/support/go_access.cgi)で確認できます  
   ※ BOTサーバをクラウドに立てた場合は、その環境のグローバルIPを登録  

# 実装

以下の手順はここのソースコードをもとに解説します

[公式ドキュメントの手順](https://developers.worksmobile.com/jp/document/1005001)に従って実装します

## 0. 各種ライブラリのインストール

プロジェクトのルートディレクトリで以下のコマンドを実施

```
> npm install
```

## 0.1 ポートの設定

後述でLINEメッセージの受け取り用に3000番ポートを使用します
該当のポートが使用できない場合は、予め以下のソースコードを修正してください


```javascript:ngrok.js
Ngrok.connect({
    proto: 'http',
    addr: 3000,    // ← 修正
    region: 'ap'
});
```

```javascript:app.js
'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;   // ← 修正
```


## 1. registerBot API でトーク Bot 情報を登録

BOTの登録画面はないので、APIで登録します

- {bot name}にはBOTの名前
- photoUrlはBOTの画像のURL
- responseで取得されるbotNoを.envの***BOT_NO***に追加してください(後述で使います)

```
> node ./register-bot.js
```

APIの説明は[こちら](https://developers.worksmobile.com/jp/document/1005002)です

```javascript:register-bot.js
// .envファイルに登録されている値を環境変数として読み込む
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
        "name": "{bot name}",
        "photoUrl": "https://developers.worksmobile.com/favicon.png",
        "status": 1
    }
};
request.post(options, function (error, response, body) {
    // レスポンス結果
    console.log(body);
});
```

## 2. getBotList API で登録した Bot 情報を確認

正常にBOTが登録されたかを確認

```
> node ./show-botlist.js
```

APIの説明は[こちら](https://developers.worksmobile.com/jp/document/1005006)です

```javascript:show-botlist.js
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

```

## 3. registerBotDomain API で各ドメインにトーク Bot を登録

登録したBOTが属するドメインを設定します

- 全ドメインを許可するために「0」に設定  
  個別のドメインを設定したい場合は、[組織連携](https://developers.worksmobile.com/jp/console/org/config/view)メニューで確認できます
- botNoは数値型でなければならないのでNumber()で変換している

```
> node ./register-domain-bot.js
```

APIの説明は[こちら](https://developers.worksmobile.com/jp/document/1005004)です

```javascript:register-domain-bot.js
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
```

## 4. sendMessage API を利用してメッセージ送信

登録したBOTからメッセージを送信してみる

- {account id}にLINE WORKSのアカウント名を追加
- {message text}に送信したいメッセージを追加

```
> node ./do-send-message.js
```

APIの説明は[こちら](https://developers.worksmobile.com/jp/document/1005008)です

```javascript:do-send-message.js
require('dotenv').config();
const sendMsg = require('./send-message');sendMsg

sendMsg({account id}, {
    type: 'text',
    text: {message text}
});
```

## 5. callback先の登録

callback先はhttps環境でなければならない
そのためローカルで気軽にhttpsの開発環境が整えられる***[ngrok](https://ngrok.com/)***を用います
さらにローカルのサーバをグローバル公開するためのルーティングの設定も不要になります

※BOTサーバをhttps環境下のクラウドにデプロイする場合は、ngrokの作業は不要。エンドポイントのurlを.envファイルの***CALLBACK_URL***に追加してください

ngrokの簡単な解説は[こちら](http://tech.misoca.jp/entry/2015/09/04/151451)

### ngrokからのトンネリング用urlを取得

コンソールで以下のコマンドを入力し、表示されたurlを控える
***※コンソールは閉じずにそのまま***

```
> node ./ngrok.js

https://xxxxxxx.ap.ngrok.io
```

ngrokで取得したurlを.envファイルの***CALLBACK_URL***に追加

### callback urlの登録

```
> node ./register-callback-bot.js
```

APIの説明は[こちら](https://developers.worksmobile.com/jp/document/1005010)です
現時点で修正と削除はできないのかな？

```javascript:register-callback-bot.js
require('dotenv').config();
var request = require('request');
var options = {
    uri: "https://apis.worksmobile.com/" + process.env.API_ID + "/message/setCallback/v2",
    headers: {
        "Content-type": "application/json",
        "consumerKey": process.env.CONSUMER_KEY,
        "Authorization": process.env.TOKEN
    },
    json: {
        "botNo": Number(process.env.BOT_NO),
        "callbackUrl": process.env.CALLBACK_URL,
        "callbackEventList": ["text"]
    }
};
request.post(options, function (error, response, body) {
    console.log(body);
});
```


## 6. コールバックメッセージを受けて、返す

以下のコマンドでCallback待ち受けサーバを起動し、LINE WORKSでBOTにメッセージ送信
オウム返しにメッセージが返って来たならば成功です

※もし、手順5のngrokを終了してしまった場合は、手順5から実施してください

```
> npm start
```

APIの説明は[こちら](https://developers.worksmobile.com/jp/document/1005009)です

```javascript:app.js
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
```
