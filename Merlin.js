/*************************************
项目名称：RevenueCat & Firebase Token解锁
脚本功能：解锁永久订阅及保持登录态
脚本作者：Charlie (优化版)
更新时间：2024-01-20
使用声明：⚠️仅供参考，🈲转载与售卖！
**************************************

[rewrite_local]
^https?:\/\/api\.revenuecat\.com\/v1\/(subscribers|receipts) url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/Merlin.js
^https?:\/\/api\.revenuecat\.com\/v1\/(product_entitlement_mapping|subscribers\/.*\/offerings) url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/Merlin.js
^https?:\/\/securetoken\.googleapis\.com\/v1\/token url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/Merlin.js

[mitm]
hostname = api.revenuecat.com, securetoken.googleapis.com

*************************************/

const chxm1023 = {};
const url = $request.url;

// Firebase Token处理
if (url.includes("securetoken.googleapis.com/v1/token")) {
    const tokenResponse = {
        token_type: "Bearer",
        refresh_token: "AMf-vByiuhC_MAg6JiiPVQdlDJdXlIp-9Ei--fmoGZqiucYHLdGGdQjUOdEL9M-n5qR8ymjSjLDd3im1aJlaC-szPV6_IS7dCuZGc6hcsUu8ewnlzpYyqfVpMnL2acHMtS7gPzxO_rB9oT7-2BcSE7vnCtK5xT9wnsWGQzdUqFOmiWwxMYB1SPFHCBon5KX5m_PavVQI4sYW9BrPkva7lSnp3xzmS6QB0z9ZaAm099tknWtclnhX1nuFeQgxeUKMrx8D5vD1Amc7JRBsKe20hBbTjtpBP0hTrD7HjcpFW-ca7MarzZKKeSk",
        user_id: "Bz7GMYkXSXYs6fqstmcksk5VAe42",
        project_id: "312050491589",
        access_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhYWMyNzEwOTkwNDljMGRmYzA1OGUwNjEyZjA4ZDA2YzMwYTA0MTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZm95ZXItd29yayIsImF1ZCI6ImZveWVyLXdvcmsiLCJhdXRoX3RpbWUiOjE3MzQ1MzQ3ODQsInVzZXJfaWQiOiJCejdHTVlrWFNYWXM2ZnFzdG1ja3NrNVZBZTQyIiwic3ViIjoiQno3R01Za1hTWFlzNmZxc3RtY2tzazVWQWU0MiIsImlhdCI6MTczNDUzNDk1NywiZXhwIjoxNzM0NTM4NTU3LCJlbWFpbCI6IjZtdmY4ODY4cHJAcHJpdmF0ZXJlbGF5LmFwcGxlaWQuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiYXBwbGUuY29tIjpbIjAwMTExNy45MDU1ZDE1MzVhYWM0ZTEyOWIyZjExZjNjOWZiYjViOS4xNTEzIl0sImVtYWlsIjpbIjZtdmY4ODY4cHJAcHJpdmF0ZXJlbGF5LmFwcGxlaWQuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiYXBwbGUuY29tIn19.JE0ReEf0gS_277Zgk2sUWVd6RqoxyIsnxyUbRjYr-Ex3IiZ72dqyuKxRpUE4-wpsNsyLhW_imRMtrUgTremkbc_Xhg3poHDm_OOOCJGNP6LaQEqnLheJcXb2LK_Ul2Xi-iA2KgVJRuGvTkulkNGAaFAMp2q-v_Pdj4IjZZ29Zqf4jz29TkjGy3hBbzvP1cDKZDBxNMBQDDwPXdNYE-fTOwX4qO0yx2JpuNtDbxGsah-jcttgWQ5Gp7_md78J2TbLEODqYXvbHv-8P8FnwgYa6O1W8zfrLfof0r9Fjk-1YtE7I6AVmeCP5IdG2Z_mwPSvchpEVgrLKunxqSE99hEhiA",
        id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhYWMyNzEwOTkwNDljMGRmYzA1OGUwNjEyZjA4ZDA2YzMwYTA0MTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZm95ZXItd29yayIsImF1ZCI6ImZveWVyLXdvcmsiLCJhdXRoX3RpbWUiOjE3MzQ1MzQ3ODQsInVzZXJfaWQiOiJCejdHTVlrWFNYWXM2ZnFzdG1ja3NrNVZBZTQyIiwic3ViIjoiQno3R01Za1hTWFlzNmZxc3RtY2tzazVWQWU0MiIsImlhdCI6MTczNDUzNDk1NywiZXhwIjoxNzM0NTM4NTU3LCJlbWFpbCI6IjZtdmY4ODY4cHJAcHJpdmF0ZXJlbGF5LmFwcGxlaWQuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiYXBwbGUuY29tIjpbIjAwMTExNy45MDU1ZDE1MzVhYWM0ZTEyOWIyZjExZjNjOWZiYjViOS4xNTEzIl0sImVtYWlsIjpbIjZtdmY4ODY4cHJAcHJpdmF0ZXJlbGF5LmFwcGxlaWQuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiYXBwbGUuY29tIn19.JE0ReEf0gS_277Zgk2sUWVd6RqoxyIsnxyUbRjYr-Ex3IiZ72dqyuKxRpUE4-wpsNsyLhW_imRMtrUgTremkbc_Xhg3poHDm_OOOCJGNP6LaQEqnLheJcXb2LK_Ul2Xi-iA2KgVJRuGvTkulkNGAaFAMp2q-v_Pdj4IjZZ29Zqf4jz29TkjGy3hBbzvP1cDKZDBxNMBQDDwPXdNYE-fTOwX4qO0yx2JpuNtDbxGsah-jcttgWQ5Gp7_md78J2TbLEODqYXvbHv-8P8FnwgYa6O1W8zfrLfof0r9Fjk-1YtE7I6AVmeCP5IdG2Z_mwPSvchpEVgrLKunxqSE99hEhiA",
        expires_in: "3600"
    };
    chxm1023.body = JSON.stringify(tokenResponse);
}

// RevenueCat订阅处理
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
