/*************************************


使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https?:\/\/api\.trancy\.org\/(1\/user\/profile|2\/translator\/engines) url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/trancy.js

[mitm]
hostname = api.trancy.org

*************************************/

var body = JSON.parse($response.body);
var url = $request.url;

// 判断是否为用户信息接口
if (url.includes("/1/user/profile")) {
    body.data.premium = true;
    body.data.admin = true;
    body.data.AIEngineActive = true;
    body.data.stripeAIEngineActive = true;
    body.data.stripePremiumActive = true;
    body.data.subscription = 1;
    body.data.expireAt = 4092599349000;

    body.data.quota.whisperx.limit = 999999999;
    body.data.quota.pdf.limit = 999999999;

    var bill = body.data.quota.AIEngineBill;
    bill.Anthropic = 999999999;
    bill.AIEngineExpired = 4092599349000;
    bill.amount = 999999999;
    bill.DeepL = 999999999;
    bill.DeepSeek = 999999999;
    bill.balance = 999999999;
    bill.Google = 999999999;
    bill.GLM = 999999999;
    bill.OpenAI = 999999999;
    bill.tokens = 999999999;
    bill.premiumExpired = 4092599349000;
    bill.Meta = 999999999;

    body.data.quota.AITokens.limit = 999999999;
    body.data.quota.AITokens.nextRecoveryAt = 4092599349000;
} 
// 判断是否为翻译引擎接口
else if (url.includes("/2/translator/engines")) {
    if (body.data) {
        // 1. 修改额度和过期时间
        if (body.data.quota) {
            body.data.quota.Anthropic = 999999999;
            body.data.quota.AIEngineExpired = 4092599349000;
            body.data.quota.amount = 999999999;
            body.data.quota.DeepL = 999999999;
            body.data.quota.DeepSeek = 999999999;
            body.data.quota.balance = 999999999;
            body.data.quota.Google = 999999999;
            body.data.quota.GLM = 999999999;
            body.data.quota.OpenAI = 999999999;
            body.data.quota.tokens = 999999999;
            body.data.quota.premiumExpired = 4092599349000;
            body.data.quota.Meta = 999999999;
        }
        
        // 2. 遍历并解锁所有 AI 引擎
        if (body.data.engines && Array.isArray(body.data.engines)) {
            for (let i = 0; i < body.data.engines.length; i++) {
                body.data.engines[i].available = true;
                body.data.engines[i].role = 1;
            }
        }
    }
}

$done({
    body: JSON.stringify(body)
});
