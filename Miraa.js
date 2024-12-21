/*************************************

使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https?:\/\/(pay\.myoland\.com\/api\/checkout\/payment-solutions|api\.myoland\.com\/users\/email_account) url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/Miraa.js

[mitm]
hostname = pay.myoland.com, api.myoland.com

*************************************/

const url = $request.url;
const body = JSON.parse($response.body);

if (url.includes("pay.myoland.com/api/checkout/payment-solutions")) {
  // 处理支付方案 API 响应
  if (body && Array.isArray(body) && body.length > 0) {
    let firstObject = body[0];
    if (firstObject) {
      firstObject.id = "18D77853-611F-4442-9230-C081FCF174AD";
      firstObject.identifier = "pro-yearly";
      firstObject.description = "Yearly Pro Plan";
    }
    $done({ body: JSON.stringify(body) });
  } else {
    $done({ body: $response.body });
  }
} else if (url.includes("api.myoland.com/users/email_account")) {
  // 处理用户账户 API 响应
  if (body && body.memberships) {
    const newMembership = {
      id: "18D77853-611F-4442-9230-C081FCF174AD",
      description: "Yearly Pro Plan",
      identifier: "pro-yearly",
      products: [
        {
          name: "Miraa Pro Yearly",
          id: "0DA7ABD9-97A6-4794-A77B-A920F9226C0A",
          type: "subscription",
          identifier: "miraa_pro_yearly",
          platform: "apple",
        },
        {
          name: "Miraa Pro Yearly",
          id: "628ED5C8-A9DB-441D-BB91-E458FB526D4E",
          googleIdentifier: {
            basePlanID: "miraa-pro-yearly",
            subscription: "miraa_pro",
          },
          type: "subscription",
          identifier: "miraa_pro:miraa-pro-yearly",
          platform: "google",
        },
        {
          name: "Miraa Pro Yearly",
          id: "5CAB5D61-E939-4C13-B6E3-3173D1056601",
          validateTime: 31557600,
          type: "subscription",
          identifier: "prod_Q5MsZEMz1d2RlG",
          platform: "stripe",
        },
      ],
    };
    body.memberships.push(newMembership);
    $done({ body: JSON.stringify(body) });
  } else {
    $done({ body: $response.body });
  }
} else {
  // 对于其他 URL，返回原始响应体
  $done({ body: $response.body });
}
