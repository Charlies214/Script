// 脚本名称：IP 信息查询
// 版本：3.0.0

const $ = new Env('IP Info');
const IPAPI_KEY = ''; // 如果需要，可以添加 ip-api.com 的 API key
const IPINFO_TOKEN = ''; // 如果需要，可以添加 ipinfo.io 的 token

!(async () => {
    try {
        $notify("开始执行", "IP信息查询", "正在获取信息...");
        console.log("开始获取IP信息");

        // 1. 获取基本IP信息
        const ipResponse = await $task.fetch({
            url: 'https://ipinfo.io/json',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const ipInfo = JSON.parse(ipResponse.body);
        const currentIP = ipInfo.ip;

        console.log("获取到IP:", currentIP);
        $notify("IP获取成功", "", `当前IP: ${currentIP}`);

        // 2. 获取详细信息
        const detailResponse = await $task.fetch({
            url: `http://ip-api.com/json/${currentIP}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,proxy,hosting,query`,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const details = JSON.parse(detailResponse.body);

        // 3. 获取威胁情报信息
        const threatResponse = await $task.fetch({
            url: `https://ipapi.co/${currentIP}/json/`,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const threatInfo = JSON.parse(threatResponse.body);

        // 整合信息
        const content = [
            `IPv4: ${currentIP}`,
            `IP类型: ${details.proxy ? "代理" : details.hosting ? "主机" : "普通"}`,
            `风险类型: ${threatInfo.security ? threatInfo.security.threat_level : "低"}`,
            `ISP: ${details.isp || 'N/A'}`,
            `AS编号: ${details.as || 'N/A'}`,
            `组织: ${details.org || 'N/A'}`,
            `位置: ${details.city || 'N/A'}, ${details.regionName || 'N/A'}, ${details.country || 'N/A'}`,
            `时区: ${details.timezone || 'N/A'}`
        ].join('\n');

        $notify(
            'IP 信息查询结果', 
            currentIP,
            content
        );

    } catch (err) {
        console.log('错误:', err);
        $notify('IP信息查询', '❌ 查询失败', err.message || err);
    } finally {
        $done();
    }
})();

function Env(name) {
    this.name = name;
    this.log = (msg) => console.log(`[${name}] ${msg}`);
    this.msg = (title, subtitle, content) => $notify(title, subtitle, content);
    this.done = () => $done();
}
