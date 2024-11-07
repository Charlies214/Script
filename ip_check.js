// 脚本名称：节点 IP 信息查询
// 版本：1.8.0

const $ = new Env('IP Info');

$notify("开始运行", "节点信息查询", "脚本开始执行");

!(async () => {
    try {
        // 1. 获取 IPv4 地址
        $notify("执行中", "", "正在获取IP地址...");
        
        const ipv4Response = await $task.fetch({
            url: 'https://api.ipify.org',  // 移除 format=json
            timeout: 5000
        });
        
        const currentIP = ipv4Response.body.trim();
        console.log("获取到IP:", currentIP);
        
        if (!currentIP || !/^\d+\.\d+\.\d+\.\d+$/.test(currentIP)) {
            throw new Error('未能获取到有效的IP地址');
        }

        $notify("IP获取成功", "", `当前IP: ${currentIP}`);

        // 2. 获取 ip-api 信息
        console.log("正在获取IP详细信息...");
        const ipApiResponse = await $task.fetch({
            url: `http://ip-api.com/json/${currentIP}`,
            timeout: 5000
        });

        console.log("ip-api响应:", ipApiResponse.body);
        
        let ipApiInfo;
        try {
            ipApiInfo = JSON.parse(ipApiResponse.body);
        } catch (e) {
            throw new Error(`解析ip-api响应失败: ${ipApiResponse.body}`);
        }

        if (ipApiInfo.status === 'fail') {
            throw new Error('IP-API 查询失败');
        }

        // 构建基础信息
        const title = 'IP 信息查询';
        const subtitle = `${currentIP}`;
        const content = [
            `IPv4: ${currentIP}`,
            `城市: ${ipApiInfo.city || 'N/A'}, ${ipApiInfo.regionName || 'N/A'}`,
            `国家: ${ipApiInfo.country || 'N/A'}`,
            `ISP: ${ipApiInfo.isp || 'N/A'}`,
            `AS: ${ipApiInfo.as || 'N/A'}`
        ].join('\n');

        $notify(title, subtitle, content);
        $done({
            title: title,
            subtitle: subtitle,
            content: content
        });

    } catch (err) {
        console.log("错误详情:", err);
        $notify('IP信息查询', '❌ 查询失败', err.message || err);
        $done();
    }
})();

function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.msg = (title, subtitle, content) => $notify(title, subtitle, content);
    this.done = (value = {}) => $done(value);
}
