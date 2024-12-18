/*************************************

项目名称：多贝单词
更新日期：2024-01-22
脚本作者：𝓒𝓱𝓪𝓻𝓵𝓲𝓮
使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https?:\/\/www\.duobeidanci\.com\/Mobile(Account\/getIndex|Device\/getInfo) url script-response-body https://raw.githubusercontent.com/Charlies214/Script/master/duobeidanci.js

[mitm]
hostname = www.duobeidanci.com

*************************************/

var body = $response.body;
var url = $request.url;
var obj = JSON.parse(body);

if (url.indexOf('getIndex') != -1) {
    // 修改 getIndex 接口响应
    obj.is_vip = 1;
    obj.duobi = 999999
    obj.new_is_vip = 1;
    obj.vip_time = "2099-12-31 23:59:59";
    obj.study_amount_limit = 999999;
    
    // 修改每日数据
    obj.daily_data = {
        ...obj.daily_data,
        "target_learn_amount": 100,
        "target_spell_amount": 100,
        "target_study_duration": 100
    };

} else if (url.indexOf('getInfo') != -1) {
    // 修改 getInfo 接口响应
    obj.is_vip = 1;
    obj.vip_time = "2099-12-31 23:59:59";
    
    // 修改用户信息
    if (obj.info) {
        obj.info.is_vip = "1";
        obj.info.duobi = 999999;
    }
    
    // 保留原有用户数据
    if (obj.data) {
        obj.data = {
            ...obj.data,
            "is_del": "0"
        };
    }
}

$done({body: JSON.stringify(obj)});