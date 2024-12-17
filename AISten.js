/*************************************

项目名称：AISten Pro 解锁会员
使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https:\/\/api\.rc-backup\.com\/v1\/(subscribers|receipts|product_entitlement_mapping) url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/AISten.js

[mitm]
hostname = api.rc-backup.com

*************************************/


var body = $response.body;
var url = $request.url;
var status = $response.status;
var headers = $request.headers;

// 构造基础时间信息
const now = new Date();
const baseTime = "2024-01-01T00:00:00Z";

// 构造完整的entitlements对象
const fullEntitlements = {
    "pro": {
        "grace_period_expires_date": null,
        "purchase_date": baseTime,
        "product_identifier": "aisten_pro",
        "expires_date": null
    },
    "pro_discount": {
        "grace_period_expires_date": null,
        "purchase_date": baseTime,
        "product_identifier": "aisten_pro_discount",
        "expires_date": null
    },
    "annual": {
        "grace_period_expires_date": null,
        "purchase_date": baseTime,
        "product_identifier": "aisten_pro_annual",
        "expires_date": null
    },
    "monthly": {
        "grace_period_expires_date": null,
        "purchase_date": baseTime,
        "product_identifier": "aisten_pro_monthly",
        "expires_date": null
    }
};

// 处理304状态或空响应
if (status === 304 || !body || body === '') {
    body = JSON.stringify({
        "request_date_ms": now.getTime(),
        "request_date": now.toISOString()
    });
}

let obj = JSON.parse(body);

if (url.includes('subscribers')) {
    if (url.includes('offerings')) {
        obj = {
            "placements": {
                "fallback_offering_id": "lifetime"
            },
            "offerings": [
                {
                    "metadata": null,
                    "description": "only lifetime",
                    "identifier": "lifetime",
                    "packages": [
                        {
                            "platform_product_identifier": "aisten_pro",
                            "identifier": "$rc_lifetime"
                        },
                        {
                            "platform_product_identifier": "aisten_pro_monthly",
                            "identifier": "$rc_monthly"
                        },
                        {
                            "platform_product_identifier": "aisten_pro_annual",
                            "identifier": "$rc_annual"
                        }
                    ]
                },
                {
                    "metadata": null,
                    "description": "only lifetime",
                    "identifier": "lifetime",
                    "packages": [
                        {
                            "platform_product_identifier": "aisten_pro",
                            "identifier": "$rc_lifetime"
                        }
                    ]
                }
            ],
            "current_offering_id": "lifetime"
        };
    } else {
        // 保持原有的用户ID和时间信息
        const originalId = obj.subscriber?.original_app_user_id || "$RCAnonymousID:276d31ac18c64e5a960349238da3dd2c";
        const firstSeen = obj.subscriber?.first_seen || baseTime;
        const originalPurchaseDate = obj.subscriber?.original_purchase_date || baseTime;
        
        obj.subscriber = {
            "non_subscriptions": {
                "aisten_pro": [{
                    "id": "lifetime_pro",
                    "is_sandbox": false,
                    "purchase_date": baseTime,
                    "original_purchase_date": baseTime,
                    "store": "app_store"
                }]
            },
            "first_seen": firstSeen,
            "original_application_version": "14",
            "other_purchases": {},
            "management_url": null,
            "subscriptions": {},
            "entitlements": fullEntitlements,
            "original_purchase_date": originalPurchaseDate,
            "original_app_user_id": originalId,
            "last_seen": now.toISOString()
        };
    }
} else if (url.includes('receipts')) {
    obj = {
        "request_date_ms": now.getTime(),
        "request_date": now.toISOString(),
        "subscriber": {
            "non_subscriptions": {
                "aisten_pro": [{
                    "id": "lifetime_pro",
                    "is_sandbox": false,
                    "purchase_date": baseTime,
                    "original_purchase_date": baseTime,
                    "store": "app_store"
                }]
            },
            "first_seen": baseTime,
            "original_application_version": "14",
            "other_purchases": {},
            "management_url": null,
            "subscriptions": {},
            "entitlements": fullEntitlements,
            "original_purchase_date": baseTime,
            "original_app_user_id": "$RCAnonymousID:276d31ac18c64e5a960349238da3dd2c",
            "last_seen": now.toISOString()
        }
    };
} else if (url.includes('product_entitlement_mapping')) {
    obj = {
        "product_entitlement_mapping": {
            "aisten_pro_discount": {
                "product_identifier": "aisten_pro_discount",
                "entitlements": ["pro_discount"]
            },
            "aisten_pro": {
                "product_identifier": "aisten_pro",
                "entitlements": ["pro"]
            },
            "aisten_pro_annual": {
                "product_identifier": "aisten_pro_annual",
                "entitlements": ["annual"]
            },
            "aisten_pro_monthly": {
                "product_identifier": "aisten_pro_monthly",
                "entitlements": ["monthly"]
            }
        }
    };
}

$done({body: JSON.stringify(obj), status: 200});
