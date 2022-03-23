/*
20 0 * * * jd_yijia_task.js
活动地址：https://mpdz-isv.isvjcloud.com/yijia/pages/home/home
 */
try {
  var { Env } = require('./Env')
} catch (e) {}
const $ = new Env('一加');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
$.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
$.helpCodes = [];
$.useInfo = {};
let cookiesArr = [];
$.appkey = `21699045`;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
let shareCode = '', max = 0;
let shareList = [
  {'code': 'FaXD4wiqHEZOfxmuuZSfyTcTImSA+wOhmUmEnU0XKWX/Arfc9auKU6+yU5isJiYW', 'max': 50},
]
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    $.index = i + 1;
    $.cookie = cookiesArr[i];
    $.isLogin = true;
    $.nickName = '';
    //await TotalBean();
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    if (!$.isLogin) {
      $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
      if ($.isNode()) {
        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
      }
      continue
    }
    await main();
    await $.wait(2000);
  }
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done();
});

async function main() {
  try {
    if ((!shareCode || Number(max) <= 0) && shareList.length > 0) {
      let oneCodeInfo = shareList[Math.floor((Math.random() * shareList.length))];
      shareCode = oneCodeInfo.code;
      max = oneCodeInfo.max;
    }
    let ua = getUA();
    $.token = '';
    await getToken();
    if (!$.token) {
      console.log(`获取Token失败`);
      return;
    }
    console.log(`Token:${$.token}`);
    $.buyerNick = '';
    let bodyInfo = {"jdToken": $.token, "method": "/yijia/activity_load"};
    if (shareCode) {
      bodyInfo['inviteNick'] = shareCode;
    }
    let mainInfo = await takePost(ua, 'activity_load', bodyInfo);
    //console.log(JSON.stringify(mainInfo));
    if (JSON.stringify(mainInfo) === '{}') {
      console.log(`获取活动异常1`);
      return;
    }
    if (mainInfo.success && mainInfo.data && mainInfo.data.status === 200) {

    } else {
      console.log(`获取活动异常2`);
      return;
    }
    mainInfo = mainInfo.data.data;
    let remainChance = mainInfo.missionCustomer.remainChance;
    console.log(`获取活动成功,当前积分：${remainChance}`);
    $.buyerNick = mainInfo.missionCustomer.buyerNick;
    console.log($.buyerNick);
    let showBarrage = await takePost(ua, 'showBarrage', {"method": "/yijia/showBarrage"});
    let showProduct = await takePost(ua, 'showProduct', {"type": "prepayGoods", "method": "/yijia/showProduct"});
    let showCards = await takePost(ua, 'showCards', {"method": "/yijia/showCards"});
    let showExchangeGoods = await takePost(ua, 'showExchangeGoods', {
      "type": "exchange",
      "method": "/yijia/showExchangeGoods"
    });
    let showProduct2 = await takePost(ua, 'showProduct', {"type": "hotSale", "method": "/yijia/showProduct"});
    let showHitNum = await takePost(ua, 'showHitNum', {"type": "hotSale", "method": "/yijia/showHitNum"});
    let taskInfo = await takePost(ua, 'mission/complete/state', {"method": "/yijia/mission/complete/state"});
    let logInfo = await takePost(ua, 'invite/log/list', {
      "missionType": "shareAct",
      "pageNo": 1,
      "pageSize": 7,
      "method": "/yijia/invite/log/list"
    });
    await $.wait(2000);
    if (mainInfo.missionCustomer.isOpenCard !== 1 && shareCode && shareCode !== $.buyerNick) {
      let bodyInfo = {
        "missionType": "openCard",
        "shopId": 1000001947,
        "type": "help",
        "method": "/yijia/complete/mission",
      }
      let taskInfo = await takePost(ua, 'complete/mission', bodyInfo);
      console.log(JSON.stringify(taskInfo));
      // console.log(`入会`);
      // $.UA = ua;
      // $.venderId = 1000001947;
      // await join($)
      bodyInfo = {"jdToken": $.token, "method": "/yijia/activity_load", "inviteNick": shareCode};
      mainInfo = await takePost(ua, 'activity_load', bodyInfo);
      mainInfo = mainInfo.data.data;
      bodyInfo = {
        "missionType": "shareAct",
        "inviterNick": shareCode,
        "realNick": mainInfo.missionCustomer.nickName,
        "headImg": mainInfo.missionCustomer.headPicUrl,
        "method": "/yijia/complete/mission",
      }
      taskInfo = await takePost(ua, 'complete/mission', bodyInfo);
      if (taskInfo && taskInfo.data && taskInfo.data.status === 200) {
        max--;
      }
      console.log(JSON.stringify(taskInfo));
    }
    await $.wait(3000);
    await doTask(ua, taskInfo.data.data);
    await $.wait(3000);
    console.log(`进行打榜`);
    let hitNewGoods = await takePost(ua, 'hitNewGoods', {"method": "/yijia/hitNewGoods"});
    console.log(JSON.stringify(hitNewGoods));
    if (remainChance < 500) {
      for (let i = 0; i < new Array(5).fill('').length; i++) {
        const res = await takePost(ua, 'draw/post', {"method": "/yijia/draw/post"});
        console.log(res);
        await $.wait(2000)
      }
    }
  } catch (e) {
    $.log(e)
  }
}

async function doTask(ua, taskList) {
  let doTaskType = ['sendBarrageDaily', 'watchLiveDisposable', 'collectShop', 'collectCommodityDisposable', 'addCarCommodityDisposable']
  for (let i = 0; i < taskList.length; i++) {
    let oneTask = taskList[i];
    if (oneTask.isComplete) {
      console.log(`任务：${oneTask.missionName},已完成`);
      continue;
    }
    if (doTaskType.indexOf(oneTask.type) !== -1) {
      console.log(`任务：${oneTask.missionName},去执行`);
      let taskInfo = await takePost(ua, 'complete/mission', {
        "missionType": oneTask.type,
        "method": "/yijia/complete/mission",
      });
      console.log(JSON.stringify(taskInfo));
      await $.wait(3000);
    }
  }


}

async function takePost(ua, functionId, bodyInfo) {
  let signInfo = getSign();
  let body = {
    "jsonRpc": "2.0",
    "params": {
      "commonParameter": {
        "appkey": "21699045",
        "m": "POST",
        "sign": signInfo.sign.toString(),
        "timestamp": signInfo.timeStamp,
        "userId": 1000001947
      },
      "admJson": {
        "actId": 1,
        "userId": 1000001947,
        "buyerNick": $.buyerNick,
        ...bodyInfo
      }
    }
  }
  let url = `https://mpdz-isv.isvjcloud.com/dm/front/yijia/${functionId}?open_id=&mix_nick=${$.buyerNick}&bizExtString=&user_id=1000001947`
  let options = {
    url: url,
    body: JSON.stringify(body),
    headers: {
      "Host": "mpdz-isv.isvjcloud.com",
      "Connection": "keep-alive",
      "Accept": "application/json",
      'X-Requested-With': 'XMLHttpRequest',
      "User-Agent": ua,
      "Content-Type": "application/json; charset=UTF-8",
      "Origin": "https://mpdz-isv.isvjcloud.com",
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'Referer': 'https://mpdz-isv.isvjcloud.com/yijia/pages/home/home',
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      'Cookie': $.cookie,
    }
  }
  return new Promise(resolve => {
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          $.err = true;
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data || {});
      }
    })
  })
}


async function getToken() {
  return new Promise(async (resolve) => {
    let options = {
      url: 'https://api.m.jd.com/client.action?functionId=isvObfuscator',
      body: `body=%7B%22url%22%3A%22https%3A//mpdz-isv.isvjcloud.com/yijia/pages/home/home%3Fsid%3D%26un_area%3D%22%2C%22id%22%3A%22%22%7D&uuid=cc00682ba4cb46d483a3596d0ef2cbae&ep=%7B%22hdid%22%3A%22%22%2C%22ts%22%3A%221645879159000%22%2C%22ridx%22%3A-1%2C%22cipher%22%3A%7B%22uuid%22%3A%22Y2CmCNY4CwTrDQDsDNZuDNqzYJC1EJZuCQVwCwDsYWU%3D%22%2C%22osVersion%22%3A%22CJCkDG%3D%3D%22%7D%2C%22ciphertype%22%3A5%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%7D&ef=1&client=android&clientVersion=10.4.0&st=1645879159000&sv=111&sign=a2c815646f98852b77b0a171db6aeb8b`,
      headers: {
        "Host": "api.m.jd.com",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Cookie": $.cookie,
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        const reust = JSON.parse(data);
        if (reust.errcode === 0) {
          $.token = reust.token;
        } else {
          $.log(data)
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getSign() {
  var n = Date.now(),
      l = "21699045admjsonappkey21699045timestamp" + n + "20ee7d6400dda1c9622699123af2c2c8";
  return {sign: $.CryptoJS.MD5(l.toLowerCase()), timeStamp: n}
}

function getUA() {
  $.UUID = randomString(40)
  const buildMap = {
    "167814": `10.1.4`,
    "167841": `10.1.6`,
  }
  $.osVersion = `${randomNum(12, 14)}.${randomNum(0, 6)}`
  let network = `network/${['4g', '5g', 'wifi'][randomNum(0, 2)]}`
  $.mobile = `iPhone${randomNum(9, 13)},${randomNum(1, 3)}`
  $.build = ["167814", "167841", "167894"][randomNum(0, 1)]
  $.appVersion = buildMap[$.build]
  return `jdapp;iPhone;${$.appVersion};${$.osVersion};${$.UUID};${network};model/${$.mobile};addressid/${randomNum(1e9)};appBuild/${$.build};jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS ${$.osVersion.replace(/\./g, "_")} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`
}

function randomString(min, max = 0) {
  var str = "", range = min, arr = [...Array(35).keys()].map(k => k.toString(36));
  if (max) {
    range = Math.floor(Math.random() * (max - min + 1) + min);
  }
  for (let i = 0; i < range;) {
    let randomString = Math.random().toString(16).substring(2)
    if ((range - i) > randomString.length) {
      str += randomString
      i += randomString.length
    } else {
      str += randomString.slice(i - range)
      i += randomString.length
    }
  }
  return str;
}

function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
