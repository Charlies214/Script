/*************************************


使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
# 匹配 api.trancy.org 或 service.trancy.org 下的相关接口
^https?:\/\/(api|service)\.trancy\.org\/(1\/user\/profile|2\/translator\/engines) url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/trancy.js

[mitm]
# 必须将两个域名都加入 MITM 列表
hostname = api.trancy.org, service.trancy.org


*************************************/
var body = JSON.parse($response.body);
var url = $request.url;

// 1. 匹配任何域名的用户信息接口 (api.trancy.org 或 service.trancy.org)
if (url.includes("/1/user/profile") && body.data) {
    
    // 安全地覆盖顶层会员权限，保留用户原有的 id、email、name、token 等关键字段
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

    // 只有当旧接口的 quota 字段存在时，才去修改深层额度（防止新接口没有 quota 导致脚本崩溃）
    if (body.data.quota) {
        
        if (body.data.quota.whisperx) {
            body.data.quota.whisperx.limit = 999999999;
        }
        
        if (body.data.quota.pdf) {
            body.data.quota.pdf.limit = 999999999;
        }

        if (body.data.quota.AIEngineBill) {
            body.data.quota.AIEngineBill = {
                ...body.data.quota.AIEngineBill,
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
                "Meta": 999999999
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
// 2. 判断是否为翻译引擎接口
else if (url.includes("/2/translator/engines") && body.data) {
    
    if (body.data.quota) {
        body.data.quota = {
            ...body.data.quota,
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
            "cost": 0
        };
    }
    
    if (Array.isArray(body.data.engines)) {
        body.data.engines = body.data.engines.map(engine => {
            return {
                ...engine,
                "available": true
            };
        });
    }
}

// 统一返回修改后的结果
$done({
    body: JSON.stringify(body)
});

