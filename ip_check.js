// 脚本名称：节点 IP 信息查询
// 版本：1.6.0

const $ = new Env('IP Info');

$notify("开始运行", "节点信息查询", "脚本开始执行");

!(async () => {
    try {
        // 1. 首先获取 IPv4 地址
        $notify("执行中", "", "正在获取IP地址...");
        
        const ipv4Response = await $task.fetch({
            url: 'https://api.ipify.org?format=json',
            timeout: 5000
        });
        
        const ipv4Info = JSON.parse(ipv4Response.body);
        const currentIP = ipv4Info.ip;
        
        $notify("IP获取成功", "", `当前IP: ${currentIP}`);

        // 2. 获取基础信息 (ip-api)
        const ipApiResponse = await $task.fetch({
            url: `http://ip-api.com/json/${currentIP}`,
            timeout: 5000
        });
        
        const ipApiInfo = JSON.parse(ipApiResponse.body);
        
        // 3. 获取风险信息 (scamalytics)
        const scamResponse = await $task.fetch({
            url: `https://scamalytics.com/ip/${currentIP}`,
            timeout: 5000
        });
        
        const riskInfo = parseIPRisk(scamResponse.body);

        // 4. 获取 Ping0 信息
        const ping0Info = await getPing0Info(currentIP);

        // 整合所有信息
        const title = 'IP 信息查询';
        const subtitle = `${currentIP}`;
        const content = [
            `IPv4: ${currentIP}`,
            `城市: ${ipApiInfo.city || 'N/A'}, ${ipApiInfo.regionName || 'N/A'}`,
            `邮编: ${ipApiInfo.zip || 'N/A'}`,
            `国家: ${ipApiInfo.country || 'N/A'}`,
            `ISP: ${ipApiInfo.isp || 'N/A'}`,
            `AS: ${ipApiInfo.as || 'N/A'}`,
            `风险评分: ${riskInfo ? riskInfo.score : 'N/A'}`,
            `风险类型: ${riskInfo ? riskInfo.risk : 'N/A'}`,
            `Ping0风险值: ${ping0Info ? ping0Info.riskValue : 'N/A'}`,
            `IP类型: ${ping0Info ? ping0Info.ipType : 'N/A'}`,
            `原生IP: ${ping0Info ? ping0Info.nativeIP : 'N/A'}`
        ].join('\n');

        $notify(title, subtitle, content);
        $done({
            title: title,
            subtitle: subtitle,
            content: content
        });

    } catch (err) {
        $notify('IP信息查询', '❌ 查询失败', err.message || err);
        $done();
    }
})();

// 解析IP风险信息
function parseIPRisk(html) {
    const scoreMatch = html.match(/"score":"(.*?)"/);
    const riskMatch = html.match(/"risk":"(.*?)"/);
    return scoreMatch && riskMatch ? {
        score: scoreMatch[1],
        risk: riskMatch[1]
    } : null;
}

// 获取 Ping0 信息
async function getPing0Info(ip) {
    try {
        // 第一次请求获取 window.x
        const firstResponse = await $task.fetch({
            url: `https://ping0.cc/ip/${ip}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
            },
            timeout: 5000
        });

        const windowX = parseWindowX(firstResponse.body);
        if (!windowX) {
            return null;
        }

        // 第二次请求获取详细信息
        const secondResponse = await $task.fetch({
            url: `https://ping0.cc/ip/${ip}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                'Cookie': `jskey=${windowX}`
            },
            timeout: 5000
        });

        return parsePing0Risk(secondResponse.body);
    } catch (error) {
        return null;
    }
}

// 解析 window.x
function parseWindowX(html) {
    const match = html.match(/window\.x\s*=\s*'([^']+)'/);
    return match ? match[1] : null;
}

// 解析 Ping0 风险信息
function parsePing0Risk(html) {
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
}

function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.msg = (title, subtitle, content) => $notify(title, subtitle, content);
    this.done = (value = {}) => $done(value);
}
