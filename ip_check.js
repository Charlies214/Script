// 脚本名称：节点 IP 信息查询
// 版本：1.3.0

const $ = new Env('IP Info');

!(async () => {
    try {
        // 1. 获取当前节点IP
        const nodeInfo = await getNodeInfo();
        $.log('节点信息获取成功');
        
        if (!nodeInfo || !nodeInfo.status) {
            throw new Error('无法获取节点IP');
        }

        const nodeIP = nodeInfo.status;
        $.log(`当前节点IP: ${nodeIP}`);

        // 2. 获取IP基础信息
        const ipApiResponse = await $task.fetch({
            url: `http://ip-api.com/json/${nodeIP}`
        });
        
        const ipInfo = JSON.parse(ipApiResponse.body);
        $.log('IP-API信息获取成功');

        // 3. 构建基础信息显示
        const title = '节点信息查询';
        const subtitle = `${nodeInfo.proxy_name} - ${nodeIP}`;
        const content = [
            `国家: ${ipInfo.country || 'N/A'}`,
            `城市: ${ipInfo.city || 'N/A'}, ${ipInfo.regionName || 'N/A'}`,
            `ISP: ${ipInfo.isp || 'N/A'}`,
            `AS: ${ipInfo.as || 'N/A'}`
        ].join('\n');

        // 4. 显示结果
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
function getNodeInfo() {
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

// Env类
function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.msg = (title, subtitle, content) => $notify(title, subtitle, content);
    this.done = (value = {}) => $done(value);
}
