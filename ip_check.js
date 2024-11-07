// 脚本名称：节点 IP 信息查询
// 版本：1.5.0

const $ = new Env('IP Info');

$notify("开始运行", "节点信息查询", "脚本开始执行");

!(async () => {
    try {
        // 开始获取节点信息
        $notify("执行中", "", "正在获取节点信息...");

        // 修改后的节点信息获取方法
        const nodeInfo = await new Promise((resolve, reject) => {
            $configuration.sendMessage({
                method: "GET",
                url: "/v1/policies",  // 改用 policies 而不是 policy_groups
                handler: (resp) => {
                    if (resp.error) {
                        $notify("错误", "", "获取策略信息失败：" + resp.error);
                        reject(new Error(resp.error));
                        return;
                    }
                    
                    try {
                        const data = JSON.parse(resp.data);
                        if (!data) {
                            $notify("错误", "", "未获取到策略信息");
                            reject(new Error("未获取到策略信息"));
                            return;
                        }

                        // 获取当前节点IP
                        const proxy = {
                            proxy_name: "当前节点",
                            status: data.proxy || data.destNode || ''
                        };

                        if (!proxy.status) {
                            $notify("错误", "", "未能获取到节点IP");
                            reject(new Error("未能获取到节点IP"));
                            return;
                        }

                        $notify("成功", "", "已获取到节点信息");
                        resolve(proxy);
                    } catch (err) {
                        $notify("错误", "", "解析节点信息失败：" + err.message);
                        reject(err);
                    }
                }
            });
        });

        if (!nodeInfo || !nodeInfo.status) {
            throw new Error('无法获取节点IP');
        }

        const nodeIP = nodeInfo.status;
        $notify("IP信息", "", `节点IP: ${nodeIP}`);

        // 获取IP基础信息
        $notify("执行中", "", "正在获取IP详细信息...");

        const ipApiResponse = await $task.fetch({
            url: `http://ip-api.com/json/${nodeIP}`,
            timeout: 5000
        });
        
        const ipInfo = JSON.parse(ipApiResponse.body);

        // 构建结果
        const title = '节点信息查询';
        const subtitle = `${nodeInfo.proxy_name} - ${nodeIP}`;
        const content = [
            `国家: ${ipInfo.country || 'N/A'}`,
            `城市: ${ipInfo.city || 'N/A'}, ${ipInfo.regionName || 'N/A'}`,
            `ISP: ${ipInfo.isp || 'N/A'}`,
            `AS: ${ipInfo.as || 'N/A'}`
        ].join('\n');

        $notify(title, subtitle, content);
        $done({
            title: title,
            subtitle: subtitle,
            content: content
        });

    } catch (err) {
        $notify('节点信息查询', '❌ 查询失败', err.message || err);
        $done();
    }
})();

function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.msg = (title, subtitle, content) => $notify(title, subtitle, content);
    this.done = (value = {}) => $done(value);
}
