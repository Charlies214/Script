/*************************************
项目名称：RevenueCat解锁
脚本功能：解锁永久订阅
脚本作者：𝓒𝓱𝓪𝓻𝓵𝓲𝓮
更新时间：2023-12-20
使用声明：⚠️仅供参考，🈲转载与售卖！
**************************************

[rewrite_local]
^https?:\/\/api\.revenuecat\.com\/v1\/(subscribers|receipts) url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/merlin.js
^https?:\/\/api\.revenuecat\.com\/v1\/(product_entitlement_mapping|subscribers\/.*\/offerings) url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/merlin.js

[mitm]
hostname = api.revenuecat.com

*************************************/

const chxm1023 = {};
const url = $request.url;

if (url.includes("/v1/subscribers/")) {
    const response = {
        request_date: new Date().toISOString(),
        request_date_ms: Date.now(),
        subscriber: {
            entitlements: {
                pro: {
                    expires_date: "2099-12-31T12:00:00Z",
                    grace_period_expires_date: null,
                    product_identifier: "lifetime",
                    purchase_date: "2023-12-20T12:00:00Z"
                }
            },
            first_seen: "2023-12-20T12:00:00Z",
            last_seen: new Date().toISOString(),
            management_url: null,
            non_subscriptions: {},
            original_app_user_id: "$RCAnonymousID:anonymous",
            original_application_version: "1.0",
            original_purchase_date: "2023-12-20T12:00:00Z",
            other_purchases: {},
            subscriptions: {
                lifetime: {
                    billing_issues_detected_at: null,
                    expires_date: null,
                    grace_period_expires_date: null,
                    is_sandbox: false,
                    original_purchase_date: "2023-12-20T12:00:00Z",
                    ownership_type: "PURCHASED",
                    period_type: "normal",
                    purchase_date: "2023-12-20T12:00:00Z",
                    store: "app_store",
                    unsubscribe_detected_at: null
                }
            }
        }
    };
    chxm1023.body = JSON.stringify(response);
}

if (url.includes("/v1/product_entitlement_mapping")) {
    const mapping = {
        product_entitlement_mapping: {
            lifetime: {
                product_identifier: "lifetime",
                entitlements: ["pro", "lifetime"]
            }
        }
    };
    chxm1023.body = JSON.stringify(mapping);
}

if (url.includes("/offerings")) {
    const offerings = {
        offerings: [
            {
                description: "lifetime",
                identifier: "lifetime",
                packages: [
                    {
                        identifier: "$rc_lifetime",
                        platform_product_identifier: "lifetime"
                    }
                ]
            }
        ],
        current_offering_id: "lifetime"
    };
    chxm1023.body = JSON.stringify(offerings);
}

$done(chxm1023);
