const url = "https://example.com/api/signin"; // 签到接口的 URL
const method = "POST"; // 请求方法（根据实际情况调整）
const headers = {
  "Cookie": "your_cookie_here", // 使用获取到的 Cookie 值
  "User-Agent": "Mozilla/5.0" // 伪装的浏览器标识，部分接口需要
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
    // 请求成功，处理返回的数据
    const result = JSON.parse(response.body);
    console.log("签到成功:", result);
    $notify("机场签到", "签到成功", "获得奖励：" + result.reward);
  } else {
    // 请求失败，记录错误
    console.log("签到失败，状态码：" + response.statusCode);
    $notify("机场签到", "签到失败", "请检查脚本配置");
  }
}).catch(error => {
  console.error("请求异常:", error);
  $notify("机场签到", "签到异常", "详细信息请查看日志");
});