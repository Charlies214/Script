/*************************************

项目名称：Solves
使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https?:\/\/ olegbarinov\.me\/solves\/ios\/config\.json url script-response-body https://raw.githubusercontent.com/Charlies214/Script/main/solves.js

[mitm]
hostname = olegbarinov.me

*************************************/


var chxm1023 = JSON.parse($response.body);

chxm1023.data = {
   ...chxm1023.data,
   "areDonationsEnabled" : true
}

$done({body : JSON.stringify(chxm1023)});