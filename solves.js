/*************************************
项目名称：Solves
脚本功能：解锁会员
脚本作者：𝓒𝓱𝓪𝓻𝓵𝓲𝓮
更新时间：2023-12-20
使用声明：⚠️仅供参考，🈲转载与售卖！
**************************************

[rewrite_local]
^https?:\/\/olegbarinov\.me\/solves\/ios\/config\.json url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/solves.js

[mitm]
hostname = olegbarinov.me

*************************************/

try {
    var chxm1023 = JSON.parse($response.body);
    
    // 修改关键参数
    chxm1023.areDonationsEnabled = true;
    chxm1023.isUpgradeTrialAvailable = true;
    chxm1023.upgradeTrialDuration = "999d";
    chxm1023.upgradeBadgeMinIntervalWhenPreferred = "999999d";
    chxm1023.upgradeBadgeMinIntervalWhenNotPreferred = "999999d";
    
    $done({body: JSON.stringify(chxm1023)});
} catch (err) {
    console.log('脚本运行出错: ' + err);
    $done({});
}