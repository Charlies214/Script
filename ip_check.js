// 脚本名称：节点 IP 信息查询
// 版本：2.0.0

const $ = new Env('IP Info');

!(async () => {
    try {
        // 1. 获取当前节点IP
        const nodeInfo = await new Promise((resolve, reject) => {
            $configuration.sendMessage({
                method: "GET",
                url: "/v1/policies",
                handler: (resp) => {
                    if (resp.error) {
                        reject(new Error(resp.error));
                        return;
                    }
                    try {
                        const data = JSON.parse(resp.data);
                        resolve(data.proxy || data.destNode);
                    } catch (err) {
                        reject(err);
                    }
                }
            });
        });

        if (!nodeInfo) {
            throw new Error('无法获取节点IP');
        }

        const currentIP = nodeInfo;
        console.log(`当前节点IP: ${currentIP}`);

        // 2. 获取 ip-api 基础信息
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

        // 构建完整信息
        const title = 'IP 信息查询';
        const subtitle = `${currentIP}`;
        const content = [
            `IPv4: ${currentIP}`,
            `风险评分: ${riskInfo ? riskInfo.score : 'N/A'}`,
            `风险类型: ${riskInfo ? riskInfo.risk : 'N/A'}`,
            `Ping0风险值: ${ping0Info ? ping0Info.riskValue : 'N/A'}`,
            `IP类型: ${ping0Info ? ping0Info.ipType : 'N/A'}`,
            `原生IP: ${ping0Info ? ping0Info.nativeIP : 'N/A'}`,
            `城市: ${ipApiInfo.city || 'N/A'}, ${ipApiInfo.regionName || 'N/A'}`,
            `邮编: ${ipApiInfo.zip || 'N/A'}`,
            `国家: ${ipApiInfo.country || 'N/A'}`,
            `ISP: ${ipApiInfo.isp || 'N/A'}`,
            `AS: ${ipApiInfo.as || 'N/A'}`
        ].join('\n');

        $notify(title, subtitle, content);
        $done();

    } catch (err) {
        console.log("错误详情:", err);
        $notify('IP信息查询', '❌ 查询失败', err.message || err);
        $done();
    }
})();

// 解析IP风险信息
function parseIPRisk(html) {
    try {
        const scoreMatch = html.match(/(?:"score"|'score'):\s*["']([^"']+)["']/);
        const riskMatch = html.match(/(?:"risk"|'risk'):\s*["']([^"']+)["']/);
        return scoreMatch && riskMatch ? {
            score: scoreMatch[1],
            risk: riskMatch[1]
        } : null;
    } catch (error) {
        return null;
    }
}

// 获取 Ping0 信息
async function getPing0Info(ip) {
    try {
        // 第一次请求获取 window.x
        const firstResponse = await $task.fetch({
            url: `https://ping0.cc/ip/${ip}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
            }
        });

        const windowX = parseWindowX(firstResponse.body);
        if (!windowX) return null;

        // 第二次请求获取详细信息
        const secondResponse = await $task.fetch({
            url: `https://ping0.cc/ip/${ip}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                'Cookie': `jskey=${windowX}`
            }
        });

        return parsePing0Risk(secondResponse.body);
    } catch (error) {
        console.log("Ping0 请求错误:", error);
        return null;
    }
}

// 解析 window.x
function parseWindowX(html) {
    try {
        const match = html.match(/window\.x\s*=\s*['"]([^'"]+)['"]/);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}

// 解析 Ping0 风险信息
function parsePing0Risk(html) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const getXPathValue = (xpath) => {
            try {
                return doc.evaluate(
                    xpath,
                    doc,
                    null,
                    XPathResult.STRING_TYPE,
                    null
                ).stringValue.trim();
            } catch (e) {
                return '';
            }
        };

        return {
            riskValue: getXPathValue("/html/body/div[2]/div[2]/div[1]/div[2]/div[9]/div[2]/span"),
            ipType: getXPathValue("/html/body/div[2]/div[2]/div[1]/div[2]/div[8]/div[2]/span"),
            nativeIP: getXPathValue("/html/body/div[2]/div[2]/div[1]/div[2]/div[11]/div[2]/span")
        };
    } catch (error) {
        console.log("解析 Ping0 响应错误:", error);
        return null;
    }
}

function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.msg = (title, subtitle, content) => $notify(title, subtitle, content);
    this.done = (value = {}) => $done();  // 修改这里，不传递任何值
}
