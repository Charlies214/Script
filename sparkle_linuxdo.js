// --- 全局常量 ---
const proxyName = "🔮 全局策略"; // 主策略组中文名称
const nodeFilterRegex = /^(?!.*(官网|套餐|流量| expiring|剩余|时间|重置|URL|到期|过期|机场|group|sub|订阅|查询|续费|观看|频道|官网|客服|M3U|车费|车友|上车|通知|公告|严禁)).*$/i;

const countryRegions = [
  { code: "HK", name: "香港", regex: /(香港|HK|Hong Kong|🇭🇰)/i },
  { code: "TW", name: "台湾", regex: /(台湾|台灣|TW|Taiwan|🇹🇼)/i },
  { code: "SG", name: "新加坡", regex: /(新加坡|狮城|SG|Singapore|🇸🇬)/i },
  { code: "JP", name: "日本", regex: /(日本|JP|Japan|东京|🇯🇵)/i },
  { code: "US", name: "美国", regex: /(美国|美國|US|USA|United States|America|🇺🇸)/i },
  { code: "DE", name: "德国", regex: /(德国|DE|Germany|🇩🇪)/i },
  { code: "KR", name: "韩国", regex: /(韩国|韓國|KR|Korea|South Korea|🇰🇷)/i },
  { code: "UK", name: "英国", regex: /(英国|UK|United Kingdom|🇬🇧)/i },
  { code: "CA", name: "加拿大", regex: /(加拿大|CA|Canada|🇨🇦)/i },
  { code: "AU", name: "澳大利亚", regex: /(澳大利亚|AU|Australia|🇦🇺)/i },
  { code: "FR", name: "法国", regex: /(法国|FR|France|🇫🇷)/i },
  { code: "NL", name: "荷兰", regex: /(荷兰|NL|Netherlands|🇳🇱)/i },
];

/**
 * 清理代理节点对象中不必要的【信息类】字段
 * @param {object} params - 完整的配置对象
 */
function cleanProxyFields(params) {
  const fieldsToDelete = [
    'remaining', 'expire', 'reset', 'total', 'upload',
    'download', 'usage', 'traffic', 'support_udp',
  ];
  params.proxies.forEach(proxy => {
    fieldsToDelete.forEach(field => {
      if (proxy.hasOwnProperty(field)) {
        delete proxy[field];
      }
    });
  });
}

// 脚本主入口
function main(params) {
  if (!params.proxies || params.proxies.length === 0) return params;
  params.proxies = params.proxies.filter(p => nodeFilterRegex.test(p.name));
  cleanProxyFields(params);
  overwriteRules(params);
  overwriteProxyGroups(params);
  overwriteDns(params);
  return params;
}

// --- 辅助函数 ---

function getTestUrlForGroup(groupName) {
  switch (groupName) {
    case "🌐 社交媒体": return "https://www.facebook.com/";
    case "📺 YouTube": return "https://www.youtube.com/";
    case "🤖 AI 服务": return "https://chat.openai.com/";
    case "🎵 Spotify": return "https://www.spotify.com/";
    case "Ⓜ️ 微软服务": return "http://msn.com/";
    default: return "http://www.gstatic.com/generate_204";
  }
}

function getIconForGroup(groupName) {
  switch (groupName) {
    case "🌐 社交媒体": return "https://fastly.jsdelivr.net/gh/Orz-3/mini@master/Color/Facebook.png";
    case "🤖 AI 服务": return "https://fastly.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/openai.png";
    case "📺 YouTube": return "https://fastly.jsdelivr.net/gh/Orz-3/mini@master/Color/YouTube.png";
    case "🎵 Spotify": return "https://fastly.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/spotify.png";
    case "🎮 游戏平台": return "https://fastly.jsdelivr.net/gh/Orz-3/mini@master/Color/Game.png";
    case "Ⓜ️ 微软服务": return "https://fastly.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/microsoft.png";
    case "🍎 苹果服务": return "https://fastly.jsdelivr.net/gh/Orz-3/mini@master/Color/Apple.png";
    case "🔒 IP 伪装": return "https://www.clashverge.dev/assets/icons/guard.svg";
    case "🍃 漏网之鱼": return "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg";
    case "🛑 广告拦截": return "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/block.svg";
    default: return "";
  }
}

// --- 核心功能函数 ---

function overwriteRules(params) {
  const rules = [
    // 应用规则
    "RULE-SET,AdBlock,🛑 广告拦截",
    "RULE-SET,OpenAI,🤖 AI 服务", "RULE-SET,Claude,🤖 AI 服务", "RULE-SET,Gemini,🤖 AI 服务",
    "RULE-SET,Copilot,🤖 AI 服务", "RULE-SET,Perplexity,🤖 AI 服务",
    "RULE-SET,Facebook,🌐 社交媒体", "RULE-SET,telegramcidr,🌐 社交媒体,no-resolve",
    "RULE-SET,YouTube,📺 YouTube", "RULE-SET,Spotify,🎵 Spotify", "RULE-SET,Game,🎮 游戏平台",
    "RULE-SET,Microsoft,Ⓜ️ 微软服务", "RULE-SET,Apple,🍎 苹果服务", "RULE-SET,AntiIPAttr,🔒 IP 伪装",
    
    // 直连规则 (已增强)
    "RULE-SET,direct,DIRECT", "RULE-SET,private,DIRECT", "RULE-SET,lancidr,DIRECT",
    "RULE-SET,cncidr,DIRECT", "RULE-SET,applications,DIRECT", "GEOIP,LAN,DIRECT,no-resolve",
    "RULE-SET,ChinaDomain,DIRECT", "RULE-SET,ChinaCompanyIp,DIRECT", "GEOIP,CN,DIRECT,no-resolve",

    // 代理规则 (三重保障)
    "RULE-SET,ProxyGFW," + proxyName,
    "RULE-SET,gfw," + proxyName,
    "RULE-SET,proxy," + proxyName,
    
    // 最终匹配
    "MATCH,🍃 漏网之鱼",
  ];
  const ruleProviders = {
    // 新增的直连和代理规则集
    direct: { type: "http", behavior: "domain", url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt", path: "./ruleset/direct.yaml", interval: 86400 },
    private: { type: "http", behavior: "domain", url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt", path: "./ruleset/private.yaml", interval: 86400 },
    lancidr: { type: "http", behavior: "ipcidr", url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt", path: "./ruleset/lancidr.yaml", interval: 86400 },
    cncidr: { type: "http", behavior: "ipcidr", url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt", path: "./ruleset/cncidr.yaml", interval: 86400 },
    applications: { type: "http", behavior: "classical", url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt", path: "./ruleset/applications.yaml", interval: 86400 },
    Facebook: { type: "http", behavior: "classical", url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Facebook/Facebook.yaml", path: "./ruleset/Facebook.yaml", interval: 86400 },
    gfw: { type: "http", behavior: "domain", url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt", path: "./ruleset/gfw.yaml", interval: 86400 },
    proxy: { type: "http", behavior: "domain", url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt", path: "./ruleset/proxy.yaml", interval: 86400 },
    
    // 原有规则集
    telegramcidr: { type: "http", behavior: "ipcidr", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt", path: "./ruleset/telegramcidr.yaml", interval: 86400 },
    OpenAI: { type: "http", behavior: "classical", url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/OpenAI/OpenAI.yaml", path: "./ruleset/OpenAI.yaml", interval: 86400 },
    Claude: { type: "http", behavior: "classical", url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Claude/Claude.yaml", path: "./ruleset/Claude.yaml", interval: 86400 },
    Gemini: { type: "http", behavior: "classical", url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Gemini/Gemini.yaml", path: "./ruleset/Gemini.yaml", interval: 86400 },
    Copilot: { type: "http", behavior: "classical", url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Copilot/Copilot.yaml", path: "./ruleset/Copilot.yaml", interval: 86400 },
    Perplexity: { type: "http", behavior: "domain", url: "https://raw.githubusercontent.com/cutethotw/ClashRule/main/Rule/Perplexity.list", path: "./ruleset/Perplexity.yaml", interval: 86400 },
    YouTube: { type: "http", behavior: "classical", url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/YouTube/YouTube.yaml", path: "./ruleset/YouTube.yaml", interval: 86400 },
    Spotify: { type: "http", behavior: "classical", url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Spotify/Spotify.yaml", path: "./ruleset/Spotify.yaml", interval: 86400 },
    Game: { type: "http", behavior: "classical", url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Game/Game.yaml", path: "./ruleset/Game.yaml", interval: 86400 },
    Microsoft: { type: "http", behavior: "classical", url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Microsoft/Microsoft.yaml", path: "./ruleset/Microsoft.yaml", interval: 86400 },
    Apple: { type: "http", behavior: "classical", url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Apple/Apple.yaml", path: "./ruleset/Apple.yaml", interval: 86400 },
    AntiIPAttr: { type: "http", behavior: "classical", url: "https://raw.githubusercontent.com/lwd-temp/anti-ip-attribution/main/generated/rule-provider.yaml", path: "./ruleset/AntiIPAttr.yaml", interval: 86400 },
    AdBlock: { type: "http", behavior: "domain", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list", path: "./ruleset/AdBlock.yaml", interval: 86400 },
    ProxyGFW: { type: "http", behavior: "domain", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list", path: "./ruleset/ProxyGFW.yaml", interval: 86400 },
    ChinaDomain: { type: "http", behavior: "domain", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list", path: "./ruleset/ChinaDomain.yaml", interval: 86400 },
    ChinaCompanyIp: { type: "http", behavior: "ipcidr", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaCompanyIp.list", path: "./ruleset/ChinaCompanyIp.yaml", interval: 86400 },
  };
  params["rule-providers"] = { ...params["rule-providers"], ...ruleProviders };
  params.rules = rules;
}

function overwriteProxyGroups(params) {
  const allProxies = params.proxies.map(p => p.name);
  const otherProxies = [];
  const availableCountryCodes = new Set();

  for (const proxyName of allProxies) {
    let matched = false;
    for (const region of countryRegions) {
      if (region.regex.test(proxyName)) {
        availableCountryCodes.add(region.code);
        matched = true;
        break;
      }
    }
    if (!matched) {
      otherProxies.push(proxyName);
    }
  }

  const regionAutoGroups = countryRegions
    .filter(r => availableCountryCodes.has(r.code))
    .map(r => ({
      name: `${r.code} - 自动选择`,
      type: 'url-test', url: 'http://www.gstatic.com/generate_204', interval: 300,
      proxies: allProxies.filter(p => r.regex.test(p)), hidden: true,
  }));

  const regionManualGroups = countryRegions
    .filter(r => availableCountryCodes.has(r.code))
    .map(r => ({
      name: `${r.name} - 手动选择`, type: 'select',
      proxies: allProxies.filter(p => r.regex.test(p)),
  }));

  const otherAutoGroup = otherProxies.length > 0 ? {
    name: 'OTHERS - 自动选择', type: 'url-test',
    url: 'http://www.gstatic.com/generate_204', interval: 300,
    proxies: otherProxies, hidden: true,
  } : null;

  const otherManualGroup = otherProxies.length > 0 ? {
    name: '其他 - 手动选择', type: 'select',
    proxies: otherProxies,
  } : null;
  
  const functionalGroupNames = [
    "🤖 AI 服务", "🌐 社交媒体", "📺 YouTube", "🎵 Spotify", "🎮 游戏平台", 
    "Ⓜ️ 微软服务", "🍎 苹果服务", "🔒 IP 伪装"
  ];

  const functionalGroups = functionalGroupNames.map(name => ({
      name: name, type: "select", icon: getIconForGroup(name), url: getTestUrlForGroup(name),
      proxies: [ proxyName, "DIRECT", "ALL - 自动选择", ...regionAutoGroups.map(g => g.name), otherAutoGroup ? otherAutoGroup.name : null, ].filter(Boolean),
  }));

  const groups = [
    { name: proxyName, type: "select", proxies: ["♻️ 自动选择", "手动选择", "⚠️ 故障转移", "DIRECT"] },
    { name: "手动选择", type: "select", proxies: allProxies },
    { name: "♻️ 自动选择", type: "select", proxies: ["ALL - 自动选择", ...regionAutoGroups.map(g => g.name), otherAutoGroup ? otherAutoGroup.name : null, ].filter(Boolean) },
    { name: "⚠️ 故障转移", type: 'fallback', url: 'http://www.gstatic.com/generate_204', interval: 300, proxies: allProxies },
    { name: "ALL - 自动选择", type: "url-test", url: 'http://www.gstatic.com/generate_204', interval: 300, proxies: allProxies, hidden: true },
    ...functionalGroups,
    { name: "🍃 漏网之鱼", type: "select", icon: getIconForGroup("🍃 漏网之鱼"), proxies: [proxyName, "DIRECT"] },
    { name: "🛑 广告拦截", type: "select", icon: getIconForGroup("🛑 广告拦截"), proxies: ["REJECT", "DIRECT"] },
    ...regionAutoGroups, ...regionManualGroups,
    otherAutoGroup, otherManualGroup,
  ].filter(Boolean);
  
  params["proxy-groups"] = groups;
}

function overwriteDns(params) {
  const cnDnsList = [ "https://223.5.5.5/dns-query", "https://1.12.12.12/dns-query" ];
  const trustDnsList = [ "https://1.0.0.1/dns-query", "https://1.1.1.1/dns-query" ];
  const dnsOptions = {
    enable: true, "prefer-h3": true, "default-nameserver": cnDnsList,
    nameserver: trustDnsList, "nameserver-policy": { "geosite:cn": cnDnsList, "geoip:cn": cnDnsList, },
    "enhanced-mode": "redir-host", "fake-ip-range": "198.18.0.0/16", "use-hosts": true,
  };
  const otherOptions = {
    "unified-delay": false, "tcp-concurrent": true, profile: { "store-selected": true, "store-fake-ip": true },
    sniffer: { enable: true, sniff: { TLS: { ports: [443, 8443] }, HTTP: { ports: [80, "8080-8880"], "override-destination": true } } },
    "geodata-mode": true,
    "geox-url": {
        geoip: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat",
        geosite: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat",
        mmdb: "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb",
    },
  };
  params.dns = { ...params.dns, ...dnsOptions };
  Object.assign(params, otherOptions);
}