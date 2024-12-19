/*************************************
项目名称：RevenueCat & Firebase Token解锁
脚本功能：解锁永久订阅及保持登录态
脚本作者：Charlie (优化版)
更新时间：2024-01-20
使用声明：⚠️仅供参考，🈲转载与售卖！
**************************************

[rewrite_local]
^https:\/\/api\.revenuecat\.com\/v1\/subscribers\/(.+) url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/Merlin.js

[mitm]
hostname = api.revenuecat.com


*************************************/

var body = {
    "request_date_ms": 1703434343000,
    "subscriber": {
        "non_subscriptions": {
            "lifetime": {
                "expires_date": "2099-09-09T09:09:09Z",
                "purchase_date": "2024-09-09T09:09:09Z"
            }
        },
        "subscriptions": {
            "lifetime": {
                "is_sandbox": false,
                "ownership_type": "PURCHASED",
                "expires_date": "2099-09-09T09:09:09Z",
                "original_purchase_date": "2024-09-09T09:09:09Z",
                "store_transaction_id": "490001314520000",
                "purchase_date": "2024-09-09T09:09:09Z",
                "store": "app_store"
            }
        },
        "entitlements": {
            "lifetime": {
                "expires_date": "2099-09-09T09:09:09Z",
                "product_identifier": "lifetime",
                "purchase_date": "2024-09-09T09:09:09Z"
            }
        },
        "original_app_user_id": "6mvf8868pr@privaterelay.appleid.com",
        "last_seen": "2024-12-18T15:13:13Z"
    }
}

$done({body: JSON.stringify(body)});