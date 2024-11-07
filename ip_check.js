const $ = new Env('IP Info');

!(async () => {
    try {
        $notify("开始执行", "IP信息查询", "正在获取信息...");
        console.log("开始获取IP信息");

        // 1. 获取当前节点IP
        const currentIP = await getCurrentNodeIP();
        if (!currentIP) {
            throw new Error('无法获取节点IP');
        }

        console.log("获取到节点IP:", currentIP);
        $notify("IP获取成功", "", `当前节点IP: ${currentIP}`);

        // 2. 获取 Ping0 信息
        console.log("开始获取Ping0信息");
        const ping0Info = await getPing0Info(currentIP);
        console.log("Ping0信息:", JSON.stringify(ping0Info));

        // 3. 获取 ip-api 基础信息
        console.log("开始获取IP-API信息");
        const ipApiResponse = await $task.fetch({
            url: `http://ip-api.com/json/${currentIP}`,
            headers: {
                'Accept': 'application/json'
            }
        });

        let ipApiInfo;
        try {
            ipApiInfo = JSON.parse(ipApiResponse.body);
            console.log("IP-API信息:", JSON.stringify(ipApiInfo));
        } catch (e) {
            console.log("IP-API响应解析失败:", ipApiResponse.body);
            ipApiInfo = {};
        }

        // 整合所有信息
        const content = [
            `IPv4: ${currentIP}`,
            `Ping0风险值: ${ping0Info.riskValue || 'N/A'}`,
            `IP类型: ${ping0Info.ipType || 'N/A'}`,
            `原生IP: ${ping0Info.nativeIP || 'N/A'}`,
            `城市: ${ipApiInfo.city || 'N/A'}, ${ipApiInfo.regionName || 'N/A'}`,
            `国家: ${ipApiInfo.country || 'N/A'}`,
            `ISP: ${ipApiInfo.isp || 'N/A'}`,
            `AS: ${ipApiInfo.as || 'N/A'}`
        ].join('\n');

        $notify('IP 信息查询结果', currentIP, content);

    } catch (err) {
        console.log('错误:', err);
        $notify('IP信息查询', '❌ 查询失败', err.message || err);
    } finally {
        $done({});
    }
})();

// 获取当前节点IP
function getCurrentNodeIP() {
    return new Promise((resolve, reject) => {
        $configuration.sendMessage({
            method: "GET",
            url: "/v1/outbound-ip"
        }, (resp) => {
            if (resp.error) {
                console.log("获取节点IP错误:", resp.error);
                reject(new Error(resp.error));
                return;
            }
            if (!resp.data) {
                console.log("未获取到节点IP");
                reject(new Error("未获取到节点IP"));
                return;
            }
            resolve(resp.data.trim());
        });
    });
}

// 获取 Ping0 信息
async function getPing0Info(ip) {
    try {
        console.log("开始Ping0请求");
        const response = await $task.fetch({
            url: `https://ping0.cc/ip/${ip}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive
