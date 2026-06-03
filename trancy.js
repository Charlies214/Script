/*************************************

项目名称：Trancy
下载地址：https://t.cn/A6H8h54O
更新日期：2024-06-02
脚本作者：chxm1023
电报频道：https://t.me/chxm1023
使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https?:\/\/api\.trancy\.org\/1\/user\/profile url script-response-body https://raw.githubusercontent.com/chxm1023/Rewrite/main/trancy.js

[mitm]
hostname = api.trancy.org

*************************************/

var chxm1023 = JSON.parse($response.body);

chxm1023.data = {
    ...chxm1023.data,
    "premium": true,
    "admin": true,
    "AIEngineActive": true,
    "stripeAIEngineActive": true,
    "stripePremiumActive": true,
    "subscription": 1,
    "expireAt": 4092599349000
};

chxm1023.data.quota = {
    ...chxm1023.data.quota,

    "whisperx": {
        "used": 0,
        "limit": 999999999
    },

    "pdf": {
        "used": 0,
        "limit": 999999999
    },

    "AIEngineBill": {
        ...chxm1023.data.quota.AIEngineBill,

        "Anthropic": 999999999,
        "AIEngineExpired": 4092599349000,
        "amount": 999999999,
        "DeepL": 999999999,
        "DeepSeek": 999999999,
        "balance": 999999999,
        "Google": 999999999,
        "GLM": 999999999,
        "OpenAI": 999999999,
        "tokens": 999999999,
        "premiumExpired": 4092599349000,
        "Meta": 999999999,
        "cost": 0,
        "lastUpdateAt": "4092599349000"
    },

    "AITokens": {
        "used": 0,
        "limit": 999999999,
        "nextRecoveryAt": 4092599349000
    }
};

$response.body = JSON.stringify(chxm1023);
