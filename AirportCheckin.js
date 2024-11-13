/*
脚本功能：机场签到V3.5版本
账号密码登录签到
【BoxJs】https://raw.githubusercontent.com/Charlies214/Script/refs/heads/master/AirportCheckinConfig.json

⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"}};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:a,headers:r,rawBody:i}=t,o=this.encoding;e(null,{status:s,statusCode:a,headers:r,rawBody:i,body:o?this.got.stringToBytes(i).toString(o):i.toString()},o?this.got.stringToBytes(i).toString(o):i.toString())},t=>{const{message:s,response:a}=t;e(s,a,a&&a.body)}))}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){this.initGotEnv(t);const{url:a,...r}=t;this.got[s](a,r).then(t=>{const{statusCode:s,statusCode:a,headers:r,rawBody:i}=t,o=this.encoding;e(null,{status:s,statusCode:a,headers:r,rawBody:i,body:o?this.got.stringToBytes(i).toString(o):i.toString()},o?this.got.stringToBytes(i).toString(o):i.toString())},t=>{const{message:s,response:a}=t;e(s,a,a&&a.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}msg(e=t,s="",a="",r){const i=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,a,i(r)):this.isQuanX()&&$notify(e,s,a,i(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

const $ = new Env("机场签到");

const url = $.getdata("airportUrl") || "";
const email = $.getdata("airportEmail") || "";
const password = $.getdata("airportPassword") || "";

let sessionCookie = '';

function initRequest(path) {
    const baseUrl = url.replace(/(auth|user)\/login(.php)*/g, "");
    return {
        url: baseUrl + path,
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
    };
}

async function login() {
    if (!url || !email || !password) {
        const msg = "请先在 BoxJs 中配置：\n• 机场URL\n• 登录邮箱\n• 登录密码";
        $.msg("机场签到", "配置错误 ❌", msg);
        return false;
    }

    return new Promise((resolve) => {
        const loginPath = url.indexOf("auth/login") != -1 ? "auth/login" : "user/_login.php";
        const request = initRequest(loginPath);
        request.body = `email=${encodeURIComponent(email)}&passwd=${encodeURIComponent(password)}&remember_me=week`;

        console.log("=================== 登录信息 ===================");
        console.log(`登录地址：${request.url}`);
        console.log(`登录邮箱：${email}`);
        
        $.post(request, (error, response, data) => {
            if (error) {
                console.log(`请求异常：${error}`);
                $.msg("机场签到", "登录失败 ❌", error);
                resolve(false);
                return;
            }

            try {
                console.log("=================== 登录结果 ===================");
                console.log(`响应数据：${data}`);
                
                const body = JSON.parse(data);
                
                if (body.ret === 1 && body.msg === "登录成功") {
                    console.log("登录状态：成功 ✅");
                    
                    // 构建Cookie信息
                    const cookieInfo = {
                        uid: body.uid,
                        email: encodeURIComponent(email),
                        key: body.key,
                        ip: body.ip,
                        expire_in: body.expire_in
                    };
                    
                    console.log("=================== Cookie信息 ===================");
                    Object.entries(cookieInfo).forEach(([key, value]) => {
                        console.log(`${key}: ${value}`);
                    });
                    
                    // 构建Cookie字符串
                    const cookieParts = Object.entries(cookieInfo)
                        .filter(([_, value]) => value)
                        .map(([key, value]) => `${key}=${value}`);
                    
                    if (cookieParts.length > 0) {
                        sessionCookie = cookieParts.join(';');
                        console.log("\nCookie构建成功 ✅");
                        console.log(`完整Cookie：${sessionCookie}`);
                        
                        // 发送Cookie通知
                        const cookieMsg = [
                            "登录成功，已获取Cookie：",
                            ...cookieParts
                        ].join('\n');
                        $.msg("机场签到", "Cookie获取成功 ✅", cookieMsg);
                        
                        resolve(true);
                    } else {
                        console.log("\nCookie构建失败 ❌");
                        $.msg("机场签到", "Cookie获取失败 ❌", "无法从登录响应构建Cookie");
                        resolve(false);
                    }
                } else {
                    console.log(`登录失败：${body.msg}`);
                    $.msg("机场签到", "登录失败 ❌", body.msg || "登录返回数据异常");
                    resolve(false);
                }
            } catch (e) {
                console.log(`解析异常：${e}`);
                $.msg("机场签到", "登录异常 ❌", `响应解析失败：${e.message}`);
                resolve(false);
            }
        });
    });
}

async function checkin() {
    if (!sessionCookie) {
        console.log("签到终止：未获取到Cookie");
        return null;
    }

    return new Promise((resolve) => {
        const checkinPath = url.indexOf("auth/login") != -1 ? "user/checkin" : "user/_checkin.php";
        const request = initRequest(checkinPath);
        request.headers.Cookie = sessionCookie;

        console.log("=================== 签到信息 ===================");
        console.log(`签到地址：${request.url}`);
        console.log(`使用Cookie：${sessionCookie}`);

        $.post(request, (error, response, data) => {
            if (error) {
                console.log(`签到异常：${error}`);
                $.msg("机场签到", "签到失败 ❌", `请求异常：${error}`);
                resolve(null);
                return;
            }

            console.log("=================== 签到结果 ===================");
            console.log(`响应数据：${data}`);

            try {
                if (data.includes('<!DOCTYPE html>') || data.includes('<html>')) {
                    console.log("签到失败：返回了HTML页面");
                    $.msg("机场签到", "签到失败 ❌", "Cookie无效或已过期");
                    resolve(null);
                    return;
                }

                const result = JSON.parse(data);
                if (result.ret === 1 || result.status === 'success') {
                    console.log("签到状态：成功 ✅");
                    resolve(result);
                } else {
                    console.log(`签到失败：${result.msg}`);
                    const msg = result.msg?.includes('已经签到') ? 
                        "今日已签到 ⚠️" : "签到失败 ❌";
                    $.msg("机场签到", msg, result.msg || "未知错误");
                    resolve(null);
                }
            } catch (e) {
                console.log(`解析异常：${e}`);
                $.msg("机场签到", "签到异常 ❌", `响应解析失败：${e.message}`);
                resolve(null);
            }
        });
    });
}

async function main() {
    console.log("=================== 开始执行 ===================");
    
    const loginSuccess = await login();
    if (!loginSuccess) {
        return;
    }
    
    const checkinResult = await checkin();
    if (!checkinResult) {
        return;
    }
    
    const trafficInfo = checkinResult.trafficInfo;
    if (trafficInfo) {
        const infoMsg = [
            `✨ ${checkinResult.msg}`,
            `📊 今日已用：${trafficInfo.todayUsedTraffic}`,
            `📅 上次使用：${trafficInfo.lastUsedTraffic}`,
            `💎 剩余流量：${trafficInfo.unUsedTraffic}`
        ].join('\n');
        
        $.msg("机场签到", "签到成功 ✅", infoMsg);
    } else {
        $.msg("机场签到", "签到成功 ✅", checkinResult.msg);
    }
}

main().then(() => $.done());
