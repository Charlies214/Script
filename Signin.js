const $ = new Env("机场签到");

// 从 BoxJs 读取 `url` 和 `cookie` 变量
const url = $.getdata("airportUrl") || "https://vicoak.com/user/checkin"; // 默认 URL
const cookie = $.getdata("airportCookie") || ""; // 从 BoxJs 中读取的 Cookie

// 请求方法和 headers 设置
const method = "POST";
const headers = {
  "Cookie": cookie,
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
};

// 创建请求
const request = {
  url: url,
  method: method,
  headers: headers
};

// 发送请求
$task.fetch(request).then(response => {
  if (response.statusCode === 200) {
    try {
      // 解析返回的 JSON 数据
      const result = JSON.parse(response.body);

      if (result.ret === 1) {
        const rewardMessage = result.msg;
        const todayUsedTraffic = result.trafficInfo.todayUsedTraffic;
        const lastUsedTraffic = result.trafficInfo.lastUsedTraffic;
        const unUsedTraffic = result.trafficInfo.unUsedTraffic;

        console.log("签到成功:", result);
        $notify("机场签到", "签到成功", `奖励：${rewardMessage}\n今日已用流量：${todayUsedTraffic}\n上次使用流量：${lastUsedTraffic}\n剩余流量：${unUsedTraffic}`);
      } else if (result.ret === 0) {
        console.log("已经签到:", result.msg);
        $notify("机场签到", "签到结果", result.msg);
      } else {
        console.log("签到失败:", result.msg);
        $notify("机场签到", "签到失败", `原因：${result.msg}`);
      }
    } catch (error) {
      console.error("JSON 解析异常:", error);
      $notify("机场签到", "签到异常", "返回数据格式有误，无法解析");
    }
  } else {
    console.log("签到失败，状态码：" + response.statusCode);
    $notify("机场签到", "签到失败", "请检查脚本配置，状态码：" + response.statusCode);
  }
}).catch(error => {
  console.error("请求异常:", error);
  $notify("机场签到", "签到异常", "详细信息请查看日志");
});
$.done();
