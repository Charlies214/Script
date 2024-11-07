// 脚本名称：节点 IP 信息查询
// 脚本作者：Assistant
// 版本：1.0.0
// 功能：查询节点 IP 的国家、风控值、IP类型等信息

const $ = new Env('IP Info');

// 主函数
!(async () => {
    try {
        const proxy = await httpAPI("/v1/policy_groups");
        const { proxy_name: nodeName, status: nodeIP } = await getSelectedProxy(proxy);
        
        $.log(`节点名称: ${nodeName}`);
        $.log(`节点IP: ${nodeIP}`);

        // 第一次请求获取 window.x
        const firstResponse = await $.http.get({
            url: `https://ping0.cc/ip/${nodeIP}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
            }
        });

        // 解析 window.x
        const windowX = parseWindowX(firstResponse.body);
        if (!windowX) {
            throw new Error('获取 window.x 失败');
        }

        // 第二次请求获取详细信息
        const secondResponse = await $.http.get({
            url: `https://ping0.cc/ip/${nodeIP}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                'Cookie': `jskey=${windowX}`
            }
        });

        // 解析 IP 信息
        const ipInfo = parseIPInfo(secondResponse.body);
        
        // 构建通知内容
        const title = '节点 IP 信息';
        const subtitle = `${nodeName} - ${nodeIP}`;
        const content = [
            `国家/地区：${ipInfo.country || '未知'}`,
            `风控值：${ipInfo.riskValue || '未知'}`,
            `IP类型：${ipInfo.ipType || '未知'}`,
            `原生IP：${ipInfo.nativeIP || '未知'}`
        ].join('\n');

        // 发送通知
        $.msg(title, subtitle, content);
        
        // 持久化数据
        $.done({
            title: title,
            subtitle: subtitle,
            content: content
        });
    } catch (err) {
        $.log(`❌ 错误: ${err.message || err}`);
        $.msg('IP 信息查询', '❌ 出现错误', err.message || err);
        $.done();
    }
})();

// 解析 window.x
function parseWindowX(html) {
    const match = html.match(/window\.x\s*=\s*'([^']+)'/);
    return match ? match[1] : null;
}

// 解析 IP 信息
function parseIPInfo(html) {
    const getValueByXPath = (content, xpath) => {
        const regex = new RegExp(xpath.replace(/\//g, '\\/') + '([^<]+)');
        const match = content.match(regex);
        return match ? match[1].trim() : '';
    };

    return {
        riskValue: getValueByXPath(html, '/html/body/div[2]/div[2]/div[1]/div[2]/div[9]/div[2]/span>'),
        ipType: getValueByXPath(html, '/html/body/div[2]/div[2]/div[1]/div[2]/div[8]/div[2]/span>'),
        nativeIP: getValueByXPath(html, '/html/body/div[2]/div[2]/div[1]/div[2]/div[11]/div[2]/span>'),
        country: getValueByXPath(html, '/html/body/div[2]/div[2]/div[1]/div[2]/div[2]/div[2]/span>')
    };
}

// 获取当前选中的代理节点
function getSelectedProxy(proxies) {
    return new Promise((resolve, reject) => {
        const allGroup = JSON.parse(proxies);
        const selectedProxy = allGroup.find(p => p.type === "static" && p.selected);
        if (!selectedProxy) {
            reject(new Error('未找到选中的节点'));
            return;
        }
        resolve({
            proxy_name: selectedProxy.name,
            status: selectedProxy.status
        });
    });
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

// Env 类
function Env(name) {
    // 实现必要的 Env 类方法
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
