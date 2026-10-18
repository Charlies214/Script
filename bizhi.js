[mitm]
hostname = cardwords-d2ge9e6goa1946987.api.tcloudbasegateway.com

[rewrite_local]
# 1. 原有的单文档查询接口
^https:\/\/cardwords-d2ge9e6goa1946987\.api\.tcloudbasegateway\.com\/v1\/database\/instances\/.*\/collections\/wpf_account\/documents\/.* url script-response-body https://raw.githubusercontent.com/Charlies214/Script/refs/heads/master/bizhi.js

# 2. 新增的列表查询接口（带 query 参数）
^https:\/\/cardwords-d2ge9e6goa1946987\.api\.tcloudbasegateway\.com\/v1\/database\/instances\/.*\/collections\/wpf_account\/documents\?.* url script-response-body https://raw.githubusercontent.com/Charlies214/Script/refs/heads/master/bizhi.js

/***********************************************
> 应用名称: 对应壁纸/会员系统安全测试脚本
> 目标接口: tcloudbasegateway.com wpf_account 数据库（单文档与列表查询）
**********************************************/

var body = JSON.parse($response.body);

// 封装一个修改用户权益的公共方法
function modifyAccount(item) {
  if (item) {
    item.isVIP = { "$numberInt": "1" };
    item.isSVIP = { "$numberInt": "1" };
    item.vipType = "svip";
    item.svipType = "svip";
    item.vipEndTime = { "$numberInt": "2147483647" };
    item.svipEndTime = { "$numberInt": "2147483647" };
    item.vipEndTimeFormat = "2099-12-31";
    item.svipEndTimeFormat = "2099-12-31";
  }
}

// 1. 适配单文档查询响应结构 (doc)
if (body && body.doc) {
  modifyAccount(body.doc);
}

// 2. 适配列表查询响应结构 (list 数组)
if (body && Array.isArray(body.list)) {
  body.list.forEach(item => {
    modifyAccount(item);
  });
}

$done({ body: JSON.stringify(body) });

