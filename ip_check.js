// 脚本名称：IP 信息查询
// 版本：3.2.0

const $ = new Env('IP Info');

!(async () => {
    try {
        $notify("开始执行", "IP信息查询", "正在获取信息...");
        console.log("开始获取IP信息");

        // 1. 获取当前IP (改用纯文本格式)
        const ipResponse = await $task.fetch({
            url: 'https://api.ipify.org',  // 移除 format=json
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const currentIP = ipResponse.body.trim();
        console.log("获取到IP:", currentIP);

        if (!currentIP || !/^\d+\.\d+\.\d+\.\d+$/.test(currentIP)) {
            throw new Error('获取IP失败');
        }

        $notify("IP获取成功", "", `当前IP: ${currentIP}`);

        // 2. 获取 Scamalytics 风险信息
        const scamResponse = await $task.fetch({
            url: `https://scamalytics.com/ip/${currentIP}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const riskInfo = parseScamalyticsInfo(scamResponse.body);
        console.log("风险信息:", JSON.stringify(riskInfo));

        // 3. 获取 Ping0 信息
        const ping0Info = await getPing0Info(currentIP);
        console.log("Ping0信息:", JSON.stringify(ping0Info));

        // 4. 获取 ip-api 基础信息
        const ipApiResponse = await $task.fetch({
            url: `http://ip-api.com/json/${currentIP}`,
            headers: {
                'Accept': 'application/json'
            }
        });

        let ipApiInfo;
        try {
            ipApiInfo = JSON.parse(ipApiResponse.body);
            console.log("IP-API信息:", JSON.stringify(ipApiInfo));
        } catch (e) {
            console.log("IP-API响应解析失败:", ipApiResponse.body);
            ipApiInfo = {};
        }

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
        $done({});  // 添加空对象作为参数
    }
})();

// 获取 Ping0 信息的完整流程
async function getPing0Info(ip) {
    try {
        // 第一次请求获取 window.x
        const firstResponse = await $task.fetch({
            url: `https://ping0.cc/ip/${ip}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const windowX = parseWindowX(firstResponse.body);
        console.log("window.x:", windowX);

        if (!windowX) {
            console.log("无法获取window.x");
            return {};
        }

        // 第二次请求获取详细信息
        const secondResponse = await $task.fetch({
            url: `https://ping0.cc/ip/${ip}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': `jskey=${windowX}`
            }
        });

        return parsePing0Info(secondResponse.body);
    } catch (error) {
        console.log("Ping0请求错误:", error);
        return {};
    }
}

// 解析 Scamalytics 风险信息
function parseScamalyticsInfo(html) {
    try {
        const scoreMatch = html.match(/(?:"score"|'score'):\s*["']([^"']+)["']/);
        const riskMatch = html.match(/(?:"risk"|'risk'):\s*["']([^"']+)["']/);
        return {
            score: scoreMatch ? scoreMatch[1] : 'N/A',
            risk: riskMatch ? riskMatch[1] : 'N/A'
        };
    } catch (error) {
        console.log("解析风险信息错误:", error);
        return {
            score: 'N/A',
            risk: 'N/A'
        };
    }
}

// 解析 window.x
function parseWindowX(html) {
    try {
        const match = html.match(/window\.x\s*=\s*['"]([^'"]+)['"]/);
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
            return match ? match[1].trim() : 'N/A';
        };

        return {
            riskValue: getValueByXPath(html, '/html/body/div[2]/div[2]/div[1]/div[2]/div[9]/div[2]/span>'),
            ipType: getValueByXPath(html, '/html/body/div[2]/div[2]/div[1]/div[2]/div[8]/div[2]/span>'),
            nativeIP: getValueByXPath(html, '/html/body/div[2]/div[2]/div[1]/div[2]/div[11]/div[2]/span>')
        };
    } catch (error) {
        console.log("解析Ping0信息错误:", error);
        return {
            riskValue: 'N/A',
            ipType: 'N/A',
            nativeIP: 'N/A'
        };
    }
}

function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.msg = (title, subtitle, content) => $notify(title, subtitle, content);
    this.done = (value = {}) => $done(value);
}
