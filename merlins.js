/*************************************

项目名称：Merlin
下载地址：https://arcane.getmerlin.in
更新日期：2024-01-13
脚本作者：𝓒𝓱𝓪𝓻𝓵𝓲𝓮
使用声明：⚠️仅供参考，🈲转载与售卖！

**************************************

[rewrite_local]
^https?:\/\/arcane\.getmerlin\.in\/v1\/user\/status url script-response-body https://raw.githubusercontent.com/Charlie/Rewrite/main/merlins.js

[mitm]
hostname = arcane.getmerlin.in

*************************************/

var Charlie = JSON.parse($response.body);

Charlie.data.cost = {
  "dailyUsage": {
    "usage": 0,
    "limit": 99999,
    "resetsAt": 4092599349000
  },
  "monthlyUsage": {
    "usage": 0,
    "limit": 99999,
    "resetsAt": 4092599349000
  }
};

Charlie.data.features = {
  "webImageGenerationTool": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "aiDetection": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "webPdfChatMessages": {"usage": 0, "limit": 99999999, "resetsAt": 4092599349000},
  "aiPlagiarismChecker": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "ytSummary": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "fluxAIImageGenerator": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "aiResumeBuilder": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "aiHumanizer": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "projects": {"usage": 0, "limit": 99999999, "resetsAt": 4092599349000},
  "wallflower": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "merlin": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "realtimeSerp": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "essayWriterV2": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "webImageGeneration": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "babyFaceGenerator": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000},
  "attachments": {"usage": 0, "limit": 99999999, "resetsAt": 4092599349000},
  "webPdfChat": {"usage": 0, "limit": 99999, "resetsAt": 4092599349000}
};

$done({body: JSON.stringify(Charlie)});