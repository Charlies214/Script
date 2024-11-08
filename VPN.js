// 定时任务配置: 0 0 * * * beesvpn.js
const $ = new Env('BeesVPN订阅合并');

// 工具函数
function uuid_a() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array(8).fill(0).map(() => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

function generateDeviceId() {
    const hex = '0123456789abcdef';
    return '001168.' + Array(32).fill(0).map(() => hex.charAt(Math.floor(Math.random() * hex.length))).join('');
}

// 主要逻辑封装
async function loginAndGetToken() {
    const url = 'https://94.74.97.241/api/v1/passport/auth/loginByDeviceId';
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'BeesVPN/2 CFNetwork/1568.100.1 Darwin/24.0.0'
    };
    const payload = {
        invite_token: "",
        device_id: generateDeviceId()
    };

    try {
        const response = await $.http.post({
            url: url,
            headers: headers,
            body: JSON.stringify(payload)
        });
        const data = JSON.parse(response.body);
        return data.data?.token;
    } catch (e) {
        $.log('登录失败: ' + e);
        return null;
    }
}

async function fetchAndProcessSubscription(token) {
    const url = `https://94.74.97.241/api/v1/client/appSubscribe?token=${token}`;
    $.log("🎉你的beesvpn订阅：" + url);
    
    try {
        const response = await $.http.get({
            url: url,
            headers: {
                'User-Agent': 'BeesVPN/2 CFNetwork/1568.100.1 Darwin/24.0.0'
            }
        });
        const data = JSON.parse(response.body).data || [];
        return data.flatMap(item => 
            (item.list || [])
                .filter(sub => sub.url)
                .map(sub => sub.url.replace('vless:\\/\\/', 'vless://'))
        );
    } catch (e) {
        $.log('获取订阅失败: ' + e);
        return null;
    }
}

async function postToDpaste(content) {
    try {
        const response = await $.http.post({
            url: "https://dpaste.com/api/",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `expiry_days=3&content=${encodeURIComponent(content)}`
        });
        const dpasteUrl = response.body.trim() + ".txt";
        $.log("🎉恭喜你成功获得合并订阅：" + dpasteUrl);
    } catch (e) {
        $.log("上传失败: " + e);
    }
}

// 主函数
async function main() {
    // 注册
    const email = `${uuid_a()}@163.com`;
    const registerUrl = "https://www.otcopusapp.cc/lx3af288h5i8pz380/api/v1/passport/auth/register";
    const registerHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    
    try {
        // 注册请求
        const registerResponse = await $.http.post({
            url: registerUrl,
            headers: registerHeaders,
            body: `email=${email}&password=123123123&invite_code=e0duFfft&email_code=`
        });
        const registerData = JSON.parse(registerResponse.body);
        const registerToken = registerData.data?.token;

        if (registerToken) {
            // 登录请求
            const loginResponse = await $.http.post({
                url: "https://www.otcopusapp.cc/lx3af288h5i8pz380/api/v1/passport/auth/login",
                headers: registerHeaders,
                body: `email=${email}&password=123123123`
            });
            const loginData = JSON.parse(loginResponse.body);
            const loginToken = loginData.data?.token;

            // 获取八爪鱼订阅
            const subscribeUrl = `https://www.otcopusapp.cc/lx3af288h5i8pz380/api/v1/client/subscribe?token=${loginToken}`;
            $.log("⚠️两个订阅中的节点会合并到一个订阅当中，请等待运行完毕。");
            $.log("🎉你的八爪鱼订阅：" + subscribeUrl);

            const subscribeResponse = await $.http.get({
                url: subscribeUrl,
                headers: registerHeaders
            });

            // Base64解码
            const decodedContent = Buffer.from(subscribeResponse.body, 'base64').toString('utf-8');

            // 获取BeesVPN订阅
            const deviceToken = await loginAndGetToken();
            if (deviceToken) {
                const subscriptions = await fetchAndProcessSubscription(deviceToken);
                if (subscriptions) {
                    // 合并并编码
                    const combinedContent = decodedContent + "\n" + subscriptions.join("\n");
                    const encodedContent = Buffer.from(combinedContent).toString('base64');
                    
                    // 上传到dpaste
                    await postToDpaste(encodedContent);
                }
            }
        }
    } catch (e) {
        $.log("请求失败: " + e);
    }
}

// 执行主函数
!(async () => {
    await main();
})()
.catch((e) => $.log('❌ 错误:', e))
.finally(() => $.done());

// Env函数实现（简化版本）
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",Object.assign(this,e)}log(...t){}}(t,e)}
