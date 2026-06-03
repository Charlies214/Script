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
if (url.includes("/1/user/profile") && body.data) {
    
    // 1. 安全地覆盖顶层会员权限（完美避开报错）
    body.data = {
        ...body.data,
        "expireAt": 4092599349000,
        "createdAt": 1717291137217,
        "premium": true,
        "admin": true,
        "subscription": 1,
        "AIEngineActive": true,
        "stripeAIEngineActive": true,
        "stripePremiumActive": true
    };

    // 2. 只有当 quota 字段存在时，才去尝试修改深层额度
    if (body.data.quota) {
        
        if (body.data.quota.whisperx) {
            body.data.quota.whisperx.limit = 999999999;
        }
        
        if (body.data.quota.pdf) {
            body.data.quota.pdf.limit = 999999999;
        }

        // 使用展开语法安全修改 AIEngineBill
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

        // 使用展开语法安全修改 AITokens
        if (body.data.quota.AITokens) {
            body.data.quota.AITokens = {
                ...body.data.quota.AITokens,
                "limit": 999999999,
                "nextRecoveryAt": 4092599349000
            };
        }
    }
} 
// 判断是否为翻译引擎接口
else if (url.includes("/2/translator/engines") && body.data) {
    
    // 1. 安全修改引擎额度
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
    
    // 2. 安全遍历并解锁所有 AI 引擎模型
    // 确保 engines 存在并且是一个数组
    if (Array.isArray(body.data.engines)) {
        // 使用 map 重新生成包含 available: true 的新数组
        body.data.engines = body.data.engines.map(engine => {
            return {
                ...engine, // 保留引擎原有的 id、图标、名称等属性
                "available": true // 强制覆盖为可用状态
            };
        });
    }
}

// 统一返回修改后的结果
$done({
    body: JSON.stringify(body)
});
