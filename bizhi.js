[mitm]
hostname = cardwords-d2ge9e6goa1946987.api.tcloudbasegateway.com

[rewrite_local]
^https:\/\/cardwords-d2ge9e6goa1946987\.api\.tcloudbasegateway\.com\/v1\/database\/instances\/.*\/collections\/wpf_account\/documents\/.* url script-response-body https://raw.githubusercontent.com/Charlies214/Script/refs/heads/master/bizhi.js

/***********************************************
> 应用名称: 对应壁纸/会员系统安全测试脚本
> 目标接口: tcloudbasegateway.com wpf_account 数据库文档查询
**********************************************/

var body = JSON.parse($response.body);
const accountReg = /wpf_account\/documents/;

if (accountReg.test($request.url)) {
  if (body && body.doc) {
    // 修改 VIP 与 SVIP 状态为 1
    body.doc.isVIP = { "$numberInt": "1" };
    body.doc.isSVIP = { "$numberInt": "1" };
    
    // 修改会员类型
    body.doc.vipType = "svip";
    body.doc.svipType = "svip";
    
    // 修改到期时间戳（2147483647 对应 2038年，或设为更远时间）
    body.doc.vipEndTime = { "$numberInt": "2147483647" };
    body.doc.svipEndTime = { "$numberInt": "2147483647" };
    
    // 修改格式化时间字符串
    body.doc.vipEndTimeFormat = "2099-12-31";
    body.doc.svipEndTimeFormat = "2099-12-31";
  }
}

$done({ body: JSON.stringify(body) });
