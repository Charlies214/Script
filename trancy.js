/*************************************


使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https?:\/\/api\.trancy\.org\/1\/user\/profile url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/trancy.js

[mitm]
hostname = api.trancy.org

*************************************/

var chxm1023 = JSON.parse($response.body);

chxm1023.data.premium = true;
chxm1023.data.admin = true;
chxm1023.data.AIEngineActive = true;
chxm1023.data.stripeAIEngineActive = true;
chxm1023.data.stripePremiumActive = true;
chxm1023.data.subscription = 1;
chxm1023.data.expireAt = 4092599349000;

chxm1023.data.quota.whisperx.limit = 999999999;
chxm1023.data.quota.pdf.limit = 999999999;

var bill = chxm1023.data.quota.AIEngineBill;

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

chxm1023.data.quota.AITokens.limit = 999999999;
chxm1023.data.quota.AITokens.nextRecoveryAt = 4092599349000;

$done({
    body: JSON.stringify(chxm1023)
});
