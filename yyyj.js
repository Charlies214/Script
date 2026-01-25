/*
[rewrite_local]
# 匹配苹果内购验证接口
^https:\/\/buy\.itunes\.apple\.com\/verifyReceipt url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/yyyj.js

# 匹配用户信息接口 (通配 ID)
^https?:\/\/lcapi\.engcorner\.cn\/1\.1\/users\/[^/]+ url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/yyyj.js

[mitm]
hostname = buy.itunes.apple.com, lcapi.engcorner.cn
**/

/*************************************
英语演讲 多功能合一脚本
- 破解内购收据 (2099过期 / 2026购买)
- 修改用户属性 (VIP/性别/钻石/等级)
*************************************/

let url = $request.url;
let body = $response.body;

if (!body) $done({});

var obj = JSON.parse(body);

// ======= 逻辑1：苹果内购收据改写 (iTunes) =======
if (url.indexOf("verifyReceipt") !== -1) {
    obj = {
        "environment": "Production",
        "receipt": {
            "receipt_type": "Production",
            "app_item_id": 6450832499,
            "bundle_id": "com.dream.OralEnglish",
            "application_version": "1",
            "download_id": 0,
            "version_external_identifier": 858380808,
            "receipt_creation_date": "2026-01-24 14:17:21 Etc/GMT",
            "receipt_creation_date_pst": "2026-01-24 06:17:21 America/Los_Angeles",
            "request_date": "2026-01-24 14:17:36 Etc/GMT",
            "request_date_pst": "2026-01-24 06:17:36 America/Los_Angeles",
            "in_app": [
                {
                    "quantity": "1",
                    "product_id": "com.mango.newYearVip",
                    "transaction_id": "320001692332200",
                    "original_transaction_id": "320001692332200",
                    "purchase_date": "2026-01-24 14:17:18 Etc/GMT",
                    "purchase_date_ms": "1769264238000",
                    "purchase_date_pst": "2026-01-24 06:17:18 America/Los_Angeles",
                    "original_purchase_date": "2026-01-24 14:17:21 Etc/GMT",
                    "original_purchase_date_ms": "1769264241000",
                    "original_purchase_date_pst": "2026-01-24 06:17:21 America/Los_Angeles",
                    "expires_date": "2099-09-09 14:17:18 Etc/GMT",
                    "expires_date_ms": "4092595200000",
                    "expires_date_pst": "2099-09-09 06:17:18 America/Los_Angeles",
                    "is_trial_period": "false",
                    "is_in_intro_offer_period": "false",
                    "in_app_ownership_type": "PURCHASED",
                    "web_order_line_item_id": "320000788106651"
                }
            ]
        },
        "latest_receipt_info": [
            {
                "quantity": "1",
                "product_id": "com.mango.newYearVip",
                "transaction_id": "320001692332200",
                "original_transaction_id": "320001692332200",
                "purchase_date": "2026-01-24 14:17:18 Etc/GMT",
                "purchase_date_ms": "1769264238000",
                "expires_date": "2099-09-09 14:17:18 Etc/GMT",
                "expires_date_ms": "4092595200000",
                "in_app_ownership_type": "PURCHASED"
            }
        ],
        "pending_renewal_info": [
            {
                "product_id": "com.mango.newYearVip",
                "auto_renew_status": "1",
                "original_transaction_id": "320001692332200"
            }
        ],
        "status": 0
    };
}

// ======= 逻辑2：用户信息接口改写 (Users API) =======
else if (url.indexOf("/users/") !== -1) {
    obj.isVip = true;
    obj.gender = "男";
    obj.diamondCount = 999999;
    obj.emailVerified = true;
    obj.mobilePhoneVerified = true;
}

$done({ body: JSON.stringify(obj) });
