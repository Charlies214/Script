/*
[rewrite_local]
# 只处理订单历史记录接口
^https:\/\/speechenglish\.cn\/apple\/orderhistory url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/yyyj1.js

[mitm]
hostname = speechenglish.cn
**/


var body = $response.body;
var obj = JSON.parse(body);

// 强制改写响应体
obj = {
  "status": 200,
  "message": "success",
  "data": {
    "orders": [
      {
        "productId": "com.mango.newYearVip",
        "bundleId": "com.dream.OralEnglish",
        "purchaseDate": "2026-01-24T14:17:21.000Z",
        "expiresDate": "2099-09-09T14:17:18.000Z",
        "status": "SUCCESS",
        "type": "year", 
        "amount": 19800, // 模拟支付金额（分）
        "orderId": "FLY" + new Date().getTime(), // 随机生成一个订单号
        "originalTransactionId": "320001692332200"
      }
    ]
  }
};

// 打印日志以便在圈X中检查是否触发
console.log("成功伪造一条订单历史记录");

$done({body : JSON.stringify(obj)});
