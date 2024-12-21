/*************************************

使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https?:\/\/pay\.myoland\.com\/api\/checkout\/payment-solutions url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/Miraa.js

[mitm]
hostname = pay.myoland.com

*************************************/

const body = JSON.parse($response.body);

if (body && Array.isArray(body) && body.length > 0) {
    let firstObject = body[0];
    if (firstObject) {
         firstObject.id = "18D77853-611F-4442-9230-C081FCF174AD";
         firstObject.identifier = "pro-yearly";
         firstObject.description = "Yearly Pro Plan";
       
    }
    $done({ body: JSON.stringify(body) });

} else {
    $done({ body: $response.body }); // 返回原始响应体 如果 body 不符合预期格式
}
