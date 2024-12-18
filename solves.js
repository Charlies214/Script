/*************************************
项目名称：Solves
脚本功能：Solves解锁
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
    // 解析响应体
    var chxm1023 = JSON.parse($response.body);
    
    // 确保data对象存在
    if (!chxm1023.data) {
        chxm1023.data = {};
    }
    
    // 修改响应数据
    chxm1023.data = {
        ...chxm1023.data,
        "areDonationsEnabled": true
    };
    
    // 发送修改后的数据
    $done({
        body: JSON.stringify(chxm1023)
    });
    
} catch (err) {
    // 错误处理
    console.log('脚本运行出错: ' + err);
    $done({});
}
