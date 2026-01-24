/*************************************
[rewrite_local]
^https?:\/\/lcapi\.engcorner\.cn\/1.1\/users\/5fba3b883a05a407c48d5d82 url script-response-body https://raw.githubusercontent.com/Charlies214/Script/main/yyyj.js

[mitm]
hostname = lcapi.engcorner.cn

*************************************/


var chxm1023 = JSON.parse($response.body);

chxm1023.data = {
   ...chxm1023.data,
   "isVip" : true
}

$done({body : JSON.stringify(chxm1023)});
