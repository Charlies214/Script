// 脚本名称：节点 IP 信息查询
// 版本：1.4.0

const $ = new Env('IP Info');

$notify("开始运行", "节点信息查询", "脚本开始执行");
console.log("脚本开始执行");

!(async () => {
    try {
        // 开始获取节点信息
        $notify("执行中", "", "正在获取节点信息...");
        console.log("正在获取节点信息...");

        const nodeInfo = await new Promise((resolve, reject) => {
            console.log("发送configuration请求");
            $configuration.sendMessage({
                method: "GET",
                url: "/v1/policy_groups",
                handler: (resp) => {
                    console.log("收到configuration响应");
                    try {
                        const { error, data } = resp;
                        if (error) {
                            console.log("configuration错误:", error);
                            reject(new Error(error));
                            return;
                        }
                        console.log("解析数据:", data);
                        const allGroup = JSON.parse(data);
                        const selectedProxy = allGroup.find(p => p.type === "static" && p.selected);
                        if (!selectedProxy) {
                            console.log("未找到选中节点");
                            reject(new Error('未找到选中的节点'));
                            return;
                        }
                        console.log("找到节点:", selectedProxy);
                        resolve({
                            proxy_name: selectedProxy.name,
                            status: selectedProxy.status
                        });
                    } catch (err) {
                        console.log("处理数据错误:", err);
                        reject(err);
                    }
                }
            });
        });

        $notify("节点信息", "", `成功获取节点信息: ${nodeInfo.proxy_name}`);
        console.log("节点信息:", nodeInfo);

        if (!nodeInfo || !nodeInfo.status) {
            throw new Error('无法获取节点IP');
        }

        const nodeIP = nodeInfo.status;
        $notify("IP信息", "", `节点IP: ${nodeIP}`);
        console.log("节点IP:", nodeIP);

        // 获取IP基础信息
        $notify("执行中", "", "正在获取IP详细信息...");
        console.log("开始获取IP-API信息");

        const ipApiResponse = await $task.fetch({
            url: `http://ip-api.com/json/${nodeIP}`
        });
        
        console.log("IP-API响应:", ipApiResponse.body);
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

        // 显示结果
        $notify(title, subtitle, content);
        console.log("完整结果:", {title, subtitle, content});

        $done({
            title: title,
            subtitle: subtitle,
            content: content
        });

    } catch (err) {
        console.log("发生错误:", err);
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
