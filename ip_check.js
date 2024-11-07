// 脚本名称：节点 IP 信息查询
// 版本：2.1.0

const $ = new Env('IP Info');
console.log('脚本开始执行');
$notify("开始执行", "节点信息查询", "正在获取节点信息...");

!(async () => {
    try {
        // 1. 获取当前节点IP
        console.log('开始获取节点IP');
        const nodeIP = await new Promise((resolve, reject) => {
            $configuration.sendMessage({
                method: "GET",
                url: "/v1/outbound",  // 改用 outbound 接口
                handler: function (resp) {
                    console.log('收到节点响应');
                    if (resp.error) {
                        console.log('节点响应错误:', resp.error);
                        reject(new Error(resp.error));
                        return;
                    }
                    console.log('节点响应数据:', resp.data);
                    resolve(resp.data);
                }
            });
        });

        console.log('节点IP:', nodeIP);
        $notify("节点信息", "", `当前节点IP: ${nodeIP}`);

        // 2. 获取基础信息
        console.log('开始获取IP详细信息');
        const ipApiResponse = await $task.fetch({
            url: `http://ip-api.com/json/${nodeIP}`,
            timeout: 5000
        });
        
        console.log('IP-API响应:', ipApiResponse.body);
        const ipApiInfo = JSON.parse(ipApiResponse.body);

        // 构建结果
        const title = 'IP 信息查询';
        const subtitle = `${nodeIP}`;
        const content = [
            `IPv4: ${nodeIP}`,
            `城市: ${ipApiInfo.city || 'N/A'}, ${ipApiInfo.regionName || 'N/A'}`,
            `国家: ${ipApiInfo.country || 'N/A'}`,
            `ISP: ${ipApiInfo.isp || 'N/A'}`,
            `AS: ${ipApiInfo.as || 'N/A'}`
        ].join('\n');

        console.log('发送最终通知');
        $notify(title, subtitle, content);

    } catch (err) {
        console.log('发生错误:', err);
        $notify('IP信息查询', '❌ 查询失败', err.message || err);
    } finally {
        console.log('脚本执行完成');
        $done();
    }
})();

function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.msg = (title, subtitle, content) => $notify(title, subtitle, content);
    this.done = () => $done();
}
