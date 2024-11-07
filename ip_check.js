// 脚本名称：节点 IP 信息查询
// 脚本作者：Assistant
// 版本：1.1.0

const $ = new Env('IP Info');
const timeout = 10000; // 设置超时时间为10秒

!(async () => {
    try {
        // 获取当前节点IP
        const nodeInfo = await Promise.race([
            getNodeInfo(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('获取节点信息超时')), timeout)
            )
        ]);
        
        if (!nodeInfo || !nodeInfo.status) {
            throw new Error('无法获取节点IP');
        }

        const nodeIP = nodeInfo.status;
        $.log(`节点IP: ${nodeIP}`);

        // 获取基础IP信息
        const ipApiInfo = await getIpApiInfo(nodeIP);
        if (!ipApiInfo) {
            throw new Error('获取IP基础信息失败');
        }

        // 获取风险信息
        const riskInfo = await getScamalyticsInfo(nodeIP);
        
        // 获取Ping0信息
        const ping0Info = await getPing0Info(nodeIP);

        // 整合所有信息
        const info = {
            ipv4: nodeIP,
            ipv6: await getIPv6(),
            city: `${ipApiInfo.city || 'N/A'}, ${ipApiInfo.regionName || 'N/A'}`,
            zip: ipApiInfo.zip || 'N/A',
            country: ipApiInfo.country || 'N/A',
            isp: ipApiInfo.isp || 'N/A',
            as: ipApiInfo.as || 'N/A',
            riskScore: riskInfo ? riskInfo.score : 'N/A',
            riskType: riskInfo ? riskInfo.risk : 'N/A',
            ping0Risk: ping0Info ? ping0Info.riskValue : 'N/A',
            ipType: ping0Info ? ping0Info.ipType : 'N/A',
            nativeIP: ping0Info ? ping0Info.nativeIP : 'N/A'
        };

        // 构建通知内容
        const title = '节点信息查询';
        const subtitle = `${nodeInfo.proxy_name || 'Unknown Node'}`;
        const content = [
            `IPv4: ${info.ipv4}`,
            `IPv6: ${info.ipv6}`,
            `城市: ${info.city}`,
            `邮编: ${info.zip}`,
            `国家: ${info.country}`,
            `ISP: ${info.isp}`,
            `AS: ${info.as}`,
            `风险评分: ${info.riskScore}`,
            `风险类型: ${info.riskType}`,
            `Ping0风险值: ${info.ping0Risk}`,
            `IP类型: ${info.ipType}`,
            `原生IP: ${info.nativeIP}`
        ].join('\n');

        $.msg(title, subtitle, content);
        $.done({
            title: title,
            subtitle: subtitle,
            content: content
        });
    } catch (err) {
        $.log(`❌ 错误: ${err.message || err}`);
        $.msg('节点信息查询', '❌ 查询失败', err.message || err);
        $.done();
    }
})();

// 获取节点信息
async function getNodeInfo() {
    const proxy = await httpAPI("/v1/policy_groups");
    const allGroup = JSON.parse(proxy);
    const selectedProxy = allGroup.find(p => p.type === "static" && p.selected);
    if (!selectedProxy) {
        throw new Error('未找到选中的节点');
    }
    return {
        proxy_name: selectedProxy.name,
        status: selectedProxy.status
    };
}

// 获取IPv6地址
async function getIPv6() {
    try {
        const response = await $.http.get({
            url: 'https://api64.ipify.org?format=json',
            timeout: timeout
        });
        const ipInfo = JSON.parse(response.body);
        return isIPv6(ipInfo.ip) ? ipInfo.ip : 'N/A';
    } catch (error) {
        return 'N/A';
    }
}

// 获取IP-API信息
async function getIpApiInfo(ip) {
    try {
        const response = await $.http.get({
            url: `http://ip-api.com/json/${ip}`,
            timeout: timeout
        });
        return JSON.parse(response.body);
    } catch (error) {
        throw new Error('IP-API 查询失败');
    }
}

// 获取Scamalytics风险信息
async function getScamalyticsInfo(ip) {
    try {
        const response = await $.http.get({
            url: `https://scamalytics.com/ip/${ip}`,
            timeout: timeout
        });
        return parseIPRisk(response.body);
    } catch (error) {
        return null;
    }
}

// 获取Ping0信息
async function getPing0Info(ip) {
    try {
        // 第一次请求获取window.x
        const firstResponse = await $.http.get({
            url: `https://ping0.cc/ip/${ip}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
            },
            timeout: timeout
        });
        
        const windowX = parseWindowX(firstResponse.body);
        if (!windowX) {
            throw new Error('获取 window.x 失败');
        }

        // 第二次请求获取详细信息
        const secondResponse = await $.http.get({
            url: `https://ping0.cc/ip/${ip}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                'Cookie': `jskey=${windowX}`
            },
            timeout: timeout
        });

        return parsePing0Risk(secondResponse.body);
    } catch (error) {
        return null;
    }
}

// 解析IP风险信息
function parseIPRisk(html) {
    const scoreMatch = html.match(/"score":"(.*?)"/);
    const riskMatch = html.match(/"risk":"(.*?)"/);
    return scoreMatch && riskMatch ? {
        score: scoreMatch[1],
        risk: riskMatch[1]
    } : null;
}

// 解析window.x
function parseWindowX(html) {
    const match = html.match(/window\.x\s*=\s*'([^']+)'/);
    return match ? match[1] : null;
}

// 解析Ping0风险信息
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

// 检查是否为IPv6
function isIPv6(ip) {
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$/;
    return ipv6Pattern.test(ip);
}

// HTTP API
function httpAPI(path = "", method = "GET", body = null) {
    return new Promise((resolve) => {
        $configuration.sendMessage({
            method: method,
            url: path,
            body: body,
            handler: (resp) => {
                try {
                    const { error, data } = resp;
                    if (error) {
                        throw new Error(error);
                    }
                    resolve(data);
                } catch (err) {
                    throw err;
                }
            },
        });
    });
}

// Env类
function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.msg = (title, subtitle, content) => $notify(title, subtitle, content);
    this.done = (value = {}) => $done(value);
    this.http = {
        get: (options) => {
            return new Promise((resolve, reject) => {
                $task.fetch(options).then(
                    (response) => resolve(response),
                    (reason) => reject(reason)
                );
            });
        }
    };
}
