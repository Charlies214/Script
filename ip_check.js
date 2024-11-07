// 脚本名称：IP 信息查询
// 版本：3.1.0

const $ = new Env('IP Info');

!(async () => {
    try {
        $notify("开始执行", "IP信息查询", "正在获取信息...");
        console.log("开始获取IP信息");

        // 1. 获取当前IP
        const ipResponse = await $task.fetch({
            url: 'https://api.ipify.org?format=json',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const ipInfo = JSON.parse(ipResponse.body);
        const currentIP = ipInfo.ip;

        console.log("获取到IP:", currentIP);
        $notify("IP获取成功", "", `当前IP: ${currentIP}`);

        // 2. 获取 Scamalytics 风险信息
        const scamResponse = await $task.fetch({
            url: `https://scamalytics.com/ip/${currentIP}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const riskInfo = parseScamalyticsInfo(scamResponse.body);
        console.log("风险信息:", riskInfo);

        // 3. 获取 Ping0 信息（两步请求）
        // 3.1 第一次请求获取 window.x
        const ping0FirstResponse = await $task.fetch({
            url: `https://ping0.cc/ip/${currentIP}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const windowX = parseWindowX(ping0FirstResponse.body);
        console.log("获取到 window.x:", windowX);

        // 3.2 第二次请求获取详细信息
        const ping0SecondResponse = await $task.fetch({
            url: `https://ping0.cc/ip/${currentIP}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': `jskey=${windowX}`
            }
        });

        const ping0Info = parsePing0Info(ping0SecondResponse.body);
        console.log("Ping0信息:", ping0Info);

        // 4. 获取 ip-api 基础信息
        const ipApiResponse = await $task.fetch({
            url: `http://ip-api.com/json/${currentIP}`,
            headers: {
                'Accept': 'application/json'
            }
        });

        const ipApiInfo = JSON.parse(ipApiResponse.body);
        console.log("IP-API信息:", ipApiInfo);

        // 整合所有信息
        const content = [
            `IPv4: ${currentIP}`,
            `风险评分: ${riskInfo.score || 'N/A'}`,
            `风险类型: ${riskInfo.risk || 'N/A'}`,
            `Ping0风险值: ${ping0Info.riskValue || 'N/A'}`,
            `IP类型: ${ping0Info.ipType || 'N/A'}`,
            `原生IP: ${ping0Info.nativeIP || 'N/A'}`,
            `城市: ${ipApiInfo.city || 'N/A'}, ${ipApiInfo.regionName || 'N/A'}`,
            `国家: ${ipApiInfo.country || 'N/A'}`,
            `ISP: ${ipApiInfo.isp || 'N/A'}`,
            `AS: ${ipApiInfo.as || 'N/A'}`
        ].join('\n');

        $notify('IP 信息查询结果', currentIP, content);

    } catch (err) {
        console.log('错误:', err);
        $notify('IP信息查询', '❌ 查询失败', err.message || err);
    } finally {
        $done();
    }
})();

// 解析 Scamalytics 风险信息
function parseScamalyticsInfo(html) {
    try {
        const scoreMatch = html.match(/"score":"([^"]+)"/);
        const riskMatch = html.match(/"risk":"([^"]+)"/);
        return {
            score: scoreMatch ? scoreMatch[1] : null,
            risk: riskMatch ? riskMatch[1] : null
        };
    } catch (error) {
        console.log("解析风险信息错误:", error);
        return {};
    }
}

// 解析 window.x
function parseWindowX(html) {
    try {
        const match = html.match(/window\.x\s*=\s*'([^']+)'/);
        return match ? match[1] : null;
    } catch (error) {
        console.log("解析window.x错误:", error);
        return null;
    }
}

// 解析 Ping0 信息
function parsePing0Info(html) {
    try {
        const getValueByXPath = (content, xpath) => {
            const regex = new RegExp(xpath.replace(/\//g, '\\/') + '([^<]+)');
            const match = content.match(regex);
            return match ? match[1].trim() : '';
        };

        return {
            riskValue: getValueByXPath(html, '/html/body/div[2]/div[2]/div[1]/div[2]/div[9]/div[2]/span>'),
            ipType: getValueByXPath(html, '/html/body/div[2]/div[2]/div[1]/div[2]/div[8]/div[2]/span>'),
            nativeIP: getValueByXPath(html, '/html/body/div[2]/div[2]/div[1]/div[2]/div[11]/div[2]/span>')
        };
    } catch (error) {
        console.log("解析Ping0信息错误:", error);
        return {};
    }
}

function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.msg = (title, subtitle, content) => $notify(title, subtitle, content);
    this.done = () => $done();
}
