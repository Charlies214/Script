/*************************************

使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https?:\/\/(api|service)\.trancy\.org\/(1\/user\/profile|2\/translator\/engines|1\/wordbooks) url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/trancy.js

[mitm]
hostname = api.trancy.org, service.trancy.org

*************************************/

var body = JSON.parse($response.body);
var url = $request.url;

// 1. 处理用户信息接口 (Profile)
if (url.includes("/1/user/profile") && body.data) {
    body.data = {
        ...body.data,
        "expireAt": 4092599349000,
        "createdAt": body.data.createdAt || 1717291137217,
        "premium": true,
        "admin": true,
        "subscription": 1,
        "AIEngineActive": true,
        "stripeAIEngineActive": true,
        "stripePremiumActive": true
    };

    // 强行向 profile 的 books 数组中注入雅思核心与全量词汇书
    body.data.books = [
        {
            "source": "https://static.trancy.org/wordbook/IELTS_core.json?v=1728718747006",
            "target": "en",
            "title": "IELTS_core",
            "count": 3575,
            "updatedAt": 1728718747006,
            "cover": "https://static.trancy.org/cms/wordbookimg/ielts.png?v=1728718747006",
            "name": "IELTS_core"
        },
        {
            "source": "https://static.trancy.org/wordbook/IELTS.json?v=1728718747006",
            "target": "en",
            "title": "IELTS",
            "count": 9388,
            "updatedAt": 1728718747006,
            "cover": "https://static.trancy.org/cms/wordbookimg/ielts.png?v=1728718747006",
            "name": "IELTS"
        }
    ];

    if (body.data.quota) {
        if (body.data.quota.whisperx) body.data.quota.whisperx.limit = 999999999;
        if (body.data.quota.pdf) body.data.quota.pdf.limit = 999999999;

        if (body.data.quota.AIEngineBill) {
            body.data.quota.AIEngineBill = {
                ...body.data.quota.AIEngineBill,
                "Anthropic": 999999999, "AIEngineExpired": 4092599349000,
                "amount": 999999999, "DeepL": 999999999,
                "DeepSeek": 999999999, "balance": 999999999,
                "Google": 999999999, "GLM": 999999999,
                "OpenAI": 999999999, "tokens": 999999999,
                "premiumExpired": 4092599349000, "Meta": 999999999
            };
        }

        if (body.data.quota.AITokens) {
            body.data.quota.AITokens = {
                ...body.data.quota.AITokens,
                "limit": 999999999,
                "nextRecoveryAt": 4092599349000
            };
        }
    }
} 
// 2. 处理翻译引擎接口 (Engines)
else if (url.includes("/2/translator/engines") && body.data) {
    if (body.data.quota) {
        body.data.quota = {
            ...body.data.quota,
            "Anthropic": 999999999, "AIEngineExpired": 4092599349000,
            "amount": 999999999, "DeepL": 999999999,
            "DeepSeek": 999999999, "balance": 999999999,
            "Google": 999999999, "GLM": 999999999,
            "OpenAI": 999999999, "tokens": 999999999,
            "premiumExpired": 4092599349000, "Meta": 999999999,
            "cost": 0
        };
    }
    
    if (Array.isArray(body.data.engines)) {
        body.data.engines = body.data.engines.map(engine => {
            return { ...engine, "available": true };
        });
    }
}
// 3. 处理单词本接口 (Wordbooks) - 兼容 api 和 service 双端
else if (url.includes("/1/wordbooks") && body.data) {
    if (Array.isArray(body.data.books)) {
        // 自动提取所有雅思相关的词书加入到我的列表
        body.data.myBooks = body.data.books.filter(book => book.name.includes("IELTS"));
    }
}

$done({
    body: JSON.stringify(body)
});
