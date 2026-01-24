/*************************************
[rewrite_local]
^https?:\/\/lcapi\.engcorner\.cn\/1\.1\/users\/[^/]+ url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/yyyj.js

[mitm]
hostname = lcapi.engcorner.cn

*************************************/

var obj = JSON.parse($response.body);

obj.isVip = true;
obj.gender = "男";
obj.diamondCount = 999999;
obj.emailVerified = true;

$done({body : JSON.stringify(obj)});
