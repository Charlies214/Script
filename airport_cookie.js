const $ = new Env("机场Cookie获取");

// 获取当前配置
let configs = $.getjson('airportConfigs') || [];

if ($request.headers) {
  const cookie = $request.headers.Cookie || $request.headers.cookie;
  const url = $request.url.split('?')[0].replace('/user', '/user/checkin');
  
  // 检查是否已存在该域名配置
  const domain = url.split('/')[2];
  const existingIndex = configs.findIndex(config => config.url.includes(domain));
  
  if (existingIndex === -1) {
    // 添加新配置
    configs.push({
      name: `机场${configs.length + 1}`,
      url: url,
      cookie: cookie
    });
  } else {
    // 更新已存在的配置
    configs[existingIndex].cookie = cookie;
  }
  
  $.setjson(configs, 'airportConfigs');
  $.notify("机场Cookie获取", "", `成功更新配置：${domain}`);
}

$.done();
