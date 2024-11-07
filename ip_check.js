// 脚本名称：节点 IP 信息查询
// 脚本作者：Assistant
// 版本：1.2.0

const $ = new Env('IP Info');
const timeout = 15000; // 增加超时时间到15秒

!(async () => {
    try {
        // 获取当前节点IP
        const nodeInfo = await getNodeInfo();
        if (!nodeInfo || !nodeInfo.status) {
            throw new Error('无法获取节点IP');
        }

        const nodeIP = nodeInfo.status;
        $.log(`节点IP: ${nodeIP}`);

        // 并行请求所有信息
        const [ipApiInfo, riskInfo, ping0Info, ipv6Info] = await Promise.all([
            getIpApiInfo(nodeIP).catch(err => {
                $.log(`IP-API 请求失败: ${err}`);
                return {};
            }),
            getScamalyticsInfo(nodeIP).catch(err => {
                $.log(`Scamalytics 请求失败: ${err}`);
                return null;
            }),
            getPing0Info(nodeIP).catch(err => {
                $.log(`Ping0 请求失败: ${err}`);
                return null;
            }),
            getIPv6().catch(err => {
                $.log(`IPv6 请求失败: ${err}`);
                return 'N/A';
            })
        ]);

        // 整合所有信息
        const info = {
            ipv4: nodeIP,
            ipv6: ipv6Info,
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
    return new Promise((resolve, reject) => {
        $configuration.sendMessage({
            method: "GET",
            url: "/v1/policy_groups",
            handler: (resp) => {
                try {
                    const { error, data } = resp;
                    if (error) {
                        reject(new Error(error));
                        return;
                    }
                    const allGroup = JSON.parse(data);
                    const selectedProxy = allGroup.find(p => p.type === "static" && p.selected);
                    if (!selectedProxy) {
                        reject(new Error('未找到选中的节点'));
                        return;
                    }
                    resolve({
                        proxy_name: selectedProxy.name,
                        status: selectedProxy.status
                    });
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}

// 获取IPv6地址
async function getIPv6() {
    return new Promise((resolve, reject) => {
        $task.fetch({
            url: 'https://api64.ipify.org?format=json'
        }).then(response => {
            const data = JSON.parse(response.body);
            resolve(isIPv6(data.ip) ? data.ip : 'N/A');
        }).catch(reject);
    });
}

// 获取IP-API信息
async function getIpApiInfo(ip) {
    return new Promise((resolve, reject) => {
        $task.fetch({
            url: `http://ip-api.com/json/${ip}`
        }).then(response => {
            resolve(JSON.parse(response.body));
        }).catch(reject);
    });
}

// 获取Scamalytics风险信息
async function getScamalyticsInfo(ip) {
    return new Promise((resolve, reject) => {
        $task.fetch({
            url: `https://scamalytics.com/ip/${ip}`
        }).then(response => {
            resolve(parseIPRisk(response.body));
        }).catch(reject);
    });
}

// 获取Ping0信息
async function getPing0Info(ip) {
    return new Promise(async (resolve, reject) => {
        try {
            // 第一次请求获取window.x
            const firstResponse = await $task.fetch({
                url: `https://ping0.cc/ip/${ip}`,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
                }
            });

            const windowX = parseWindowX(firstResponse.body);
            if (!windowX) {
                reject(new Error('获取 window.x 失败'));
                return;
            }

            // 第二次请求获取详细信息
            const secondResponse = await $task.fetch({
                url: `https://ping0.cc/ip/${ip}`,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                    'Cookie': `jskey=${windowX}`
                }
            });

            resolve(parsePing0Risk(secondResponse.body));
        } catch (error) {
            reject(error);
        }
    });
}

// 其他辅助函数保持不变
function parseIPRisk(html) {
    const scoreMatch = html.match(/"score":"(.*?)"/);
    const riskMatch = html.match(/"risk":"(.*?)"/);
    return scoreMatch && riskMatch ? {
        score: scoreMatch[1],
        risk: riskMatch[1]
    } : null;
}

function parseWindowX(html) {
    const match = html.match(/window\.x\s*=\s*'([^']+)'/);
    return match ? match[1] : null;
}

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

function isIPv6(ip) {
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$/;
    return ipv6Pattern.test(ip);
}

// Env类
function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.msg = (title, subtitle, content) => $notify(title, subtitle, content);
    this.done = (value = {}) => $done(value);
}
