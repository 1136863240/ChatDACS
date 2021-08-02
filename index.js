/* Giftina：https://giftia.moe
ChatDACS：一个无需服务器，可私有化部署、可独立运行于内网的H5聊天工具

初次使用请看:
  首先去 https://nodejs.org/zh-cn/ 安装长期支持版Node.js
  接着启动cmd或powershell,进入代码根目录运行:
    npm install -g cnpm --registry=https://registry.npm.taobao.org
  等待进度完成后运行:
    cnpm install
  等待进度完成后运行:
    node index.js
  也可在Node.js安装完毕后双击目录下的 init.bat 一键部署
  部署完毕后会自动启动，之后可双击 run.bat 启动
  或使用pm2守护神启动:
    pm2 start index.js
  访问127.0.0.1即可体验,有公网或穿透那更好,尽情使用吧~

  若出现
    c:\users\travis\build\yanyiwu\nodejieba\deps\cppjieba\dicttrie.hpp:203 FATAL exp: [ifs.is_open()] false. open C:\snapshot\web\node_modules\nodejieba/dict/jieba.dict.utf8 failed.
  这样的问题，请执行
    npm install nodejieba --registry=https://registry.npm.taobao.org --nodejieba_binary_host_mirror=https://npm.taobao.org/mirrors/nodejieba

  若使用pm2守护神启动:
  隐藏界面请按:  Ctrl + C
  查看监视器请运行:  pm2 monit
  完全关闭请运行:  pm2 kill

  另外，若想使用更完善的功能，请访问以下申请地址，申请自己的接口密钥后，修改 /config/config.json文件：
  -- 天行接口，用于 随机昵称 与 舔狗 功能，申请地址 https://www.tianapi.com/
  -- 卡特实验室接口，用于 随机买家秀 功能，申请地址 https://api.sumt.cn/

  目录下的 userdicy.txt 是自定义分词表，用于提高聊天智能
  修改时请注意，一个关键词占一行，每一行按顺序分为三部分：词语、词频（省略则交给分词器自动计算）、词性（可省略），以空格隔开

  每当次版本号迭代,如 1.1.0 --> 1.2.0,意味着需要更新依赖,请运行:  ncu -u  ,等待进度完成后运行:  cnpm install
  出现任何缺失的依赖包请运行:  cnpm install 缺失的包名
  版本号的改变规律,如 1.2.3-45,形如 A.B.C-D:
    A 大版本号,当整端重构或出现不向后兼容的改变时增加A,更新代码需要更新依赖,且需要重载数据库
    B 次版本号,功能更新,当功能增加、修改或删除时增加B,更新代码需要更新依赖
    C 尾版本号,表示小修改,如修复一些重要bug时增加C,更新代码可以不更新依赖
    D 迭代号,表示最小修改版本,用于体现该版本稳定性

    致谢（排名不分先后）：https://niconi.co.ni/、https://www.layui.com/、https://lceda.cn/、https://www.dnspod.cn/、Daisy_Liu、http://blog.luckly-mjw.cn/tool-show/iconfont-preview/index.html、https://ihateregex.io/、https://www.maoken.com/、https://www.ngrok.cc/、https://uptimerobot.com/、https://shields.io/、https://ctf.bugku.com/、https://blog.squix.org/、https://hostker.com/、https://www.tianapi.com/、https://api.sumt.cn/、https://github.com/Mrs4s/go-cqhttp、https://colorhunt.co/、https://github.com/、https://gitee.com/、https://github.com/windrises/dialogue.moe、还有我的朋友们，以及倾心分享知识的各位
*/

//系统配置和开关，根据你的需要改动
const version = "ChatDACS 3.0.2-Dev"; //版本号，会显示在浏览器tab与标题栏
const chat_swich = 1; //web端自动聊天开关，需数据库中配置聊天表，自带的数据库已经配置好小夜嘴臭语录，开箱即用
const news_swich = 0; //web端首屏新闻开关
const conn_go_cqhttp = 1; //qqBot小夜开关，需要自行配置以接入go-cqhttp，反向 HTTP POST 于 127.0.0.1:80/bot
const Now_On_Live = 0; //接入哔哩哔哩直播聊天开关
const html = "/static/index.html"; //前端页面路径，old.html为旧版前端

//web端配置
const help =
  "主人你好，我是小夜。欢迎使用沙雕Ai聊天系统 ChatDACS (Chatbot : shaDiao Ai Chat System)。在这里，你可以与经过 2w+用户调教养成的人工智能机器人小夜实时聊天，它有着令人激动的、实用的在线涩图功能，还可以和在线的其他人分享你的图片、视频与文件。现在就试试使用在聊天框下方的便捷功能栏吧，功能栏往右拖动还有更多功能。";
const thanks =
  "致谢（排名不分先后）：https://niconi.co.ni/、https://www.layui.com/、https://lceda.cn/、https://www.dnspod.cn/、Daisy_Liu、http://blog.luckly-mjw.cn/tool-show/iconfont-preview/index.html、https://ihateregex.io/、https://www.maoken.com/、https://www.ngrok.cc/、https://uptimerobot.com/、https://shields.io/、https://ctf.bugku.com/、https://blog.squix.org/、https://hostker.com/、https://www.tianapi.com/、https://api.sumt.cn/、https://github.com/Mrs4s/go-cqhttp、https://colorhunt.co/、https://github.com/、https://gitee.com/、https://github.com/windrises/dialogue.moe、还有我的朋友们，以及倾心分享知识的各位";
const updatelog = `<h1>3.0.2-Dev<br/>测试击鼓传雷</h1><br/><ul style="text-align:left"><li>· 正在测试击鼓传雷啦，这个版本不要用噢；</li></ul>`;

//qqBot配置
const topN = 5; //限制分词权重数量，设置得越低，更侧重大意，回复更贴近重点，但容易重复相同的回复；设置得越高，回复会更随意、更沙雕，但更容易答非所问
let reply_probability = 1; //qqBot小夜回复几率，单位是%，可通过 /admin_change_reply_probability 指令更改
let fudu_probability = 1; //qqBot小夜复读几率，单位是%，可通过 /admin_change_fudu_probability 指令更改
let chaos_probability = 0; //qqBot小夜抽风几率，随机抽风舔狗，单位是‰
const req_setu_list = [
  "来点色图",
  "色图",
  "开车",
  "车来",
  "好康的",
  "随机色图",
  "随机cos",
  "/随机cos",
  "色图！",
  "图来",
  "图来！",
  "ghs",
  "搞黄色",
  "车来！",
  "不够色！",
  "涩图",
  "发点色图",
  "来点涩图",
]; //色图指令列表
const req_fuliji_list = ["福利姬", "买家秀"]; //福利姬指令列表
const req_ECY_list = ["来点二次元", "二次元"]; //二次元图指令列表
const req_no_trap_list = ["今日不带套", "今日不戴套", "今天不带套", "今天不戴套"]; //今日不带套指令列表
let black_list_words; //教学系统敏感词池
let qq_admin_list; //qqBot小夜的管理员列表
const qqimg_to_web = 0; //qq侧接收到的图片保存与转发开关，虽然经常可以收到一些好康的图，但是非常占硬盘空间
const max_mine_count = 3; //最大共存地雷数

//杂项配置
const blive_room_id = "49148"; //哔哩哔哩直播间id
let cos_total_count = 50; //初始化随机cos上限，50个应该比较保守，使用随机cos功能后会自动更新为最新值

/*
 *
 *好了！以上就是系统的基本配置，如果没有必要，请不要再往下继续编辑了。请保存本文件。祝使用愉快！
 *
 */

//模块依赖和底层配置
const compression = require("compression"); //用于gzip压缩
const express = require("express"); //轻巧的express框架
const app = require("express")();
app.use(compression()); //对express所有路由启用gzip
app.use(express.static("static")); //静态文件引入
app.use(express.json()); //解析post
app.use(express.urlencoded({ extended: false })); //解析post
const multer = require("multer"); //用于文件上传
const upload = multer({ dest: "static/uploads/" }); //用户上传目录
const cookie = require("cookie");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const request = require("request");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("db.db"); //数据库位置，默认与index.js同目录
const colors = require("colors");
const fs = require("fs");
const path = require("path");
const jieba = require("nodejieba"); //中文分词器
jieba.load({
  dict: jieba.DEFAULT_DICT,
  hmmDict: jieba.DEFAULT_HMM_DICT,
  userDict: `${__dirname}/config/userDict.txt`, //加载自定义分词库
  idfDict: jieba.DEFAULT_IDF_DICT,
  stopWordDict: `${__dirname}/config/stopWordDict.txt`, //加载分词库黑名单
});
const AipSpeech = require("baidu-aip-sdk").speech; //百度语音sdk
const crypto = require("crypto"); //编码库，用于sha1生成文件名
const voiceplayer = require("play-sound")((opts = { player: `${__dirname}/plugins/cmdmp3win.exe` })); //mp3静默播放工具，用于直播时播放语音
const { createCanvas, loadImage } = require("canvas"); //用于绘制文字图像，迫害p图
const { resolve } = require("path");

//错误捕获
process.on("uncaughtException", (err) => {
  io.emit("system message", `@未捕获的异常：${err}`);
  console.log(`未捕获的异常，错误：${err}`.error);
});

//promise错误捕获
process.on("unhandledRejection", (err) => {
  io.emit("system message", `@未捕获的promise异常：${err}`);
  console.log(`未捕获的promise异常：${err}`.error);
});

//固定变量
let onlineusers = 0;
let Tiankey, sumtkey, baidu_app_id, baidu_api_key, baidu_secret_key;
let last_danmu_timeline;
var boom_timer; //60s计时器

//声明TTS调用接口
let SpeechClient;

//载入配置
ReadConfig()
  .then((resolve) => {
    Tiankey = resolve.Tiankey; //天行接口key
    sumtkey = resolve.sumtkey; //卡特实验室接口key
    baidu_app_id = resolve.baidu_app_id; //百度应用id
    baidu_api_key = resolve.baidu_api_key; //百度接口key
    baidu_secret_key = resolve.baidu_secret_key; //百度接口密钥
    SpeechClient = new AipSpeech(baidu_app_id, baidu_api_key, baidu_secret_key); //建立TTS调用接口
    black_list_words = resolve.black_list_words; //教学系统的黑名单
    qq_admin_list = resolve.qq_admin_list; //qqBot小夜的管理员列表
  })
  .catch((reject) => {
    console.log(`载入api接口密钥文件错误，错误信息：${reject}`.error);
  });

//debug颜色配置
colors.setTheme({
  ver: "inverse",
  random: "random",
  on: "magenta",
  off: "green",
  warn: "yellow",
  error: "red",
  log: "blue",
});

//正则
const rename_reg = new RegExp("^/rename [\u4e00-\u9fa5a-z0-9]{1,10}$"); //允许1-10长度的数英汉昵称
const bv2av_reg = new RegExp("^[a-zA-Z0-9]{10,12}$"); //匹配bv号
const isImage_reg = new RegExp("\\[CQ:image,file="); //匹配qqBot图片
const xiaoye_ated = new RegExp("\\[CQ:at,qq=1648468212\\]"); //匹配小夜被@
const change_reply_probability_reg = new RegExp("^/admin_change_reply_probability [0-9]*"); //匹配修改qqBot小夜回复率
const change_fudu_probability_reg = new RegExp("^/admin_change_fudu_probability [0-9]*"); //匹配修改qqBot小夜复读率
const img_url_reg = new RegExp("https(.*term=3)"); //匹配图片地址
const isVideo_reg = new RegExp("^\\[CQ:video,file="); //匹配qqBot图片
const video_url_reg = new RegExp("http(.*term=unknow)"); //匹配视频地址
const yap_reg = new RegExp("^\\/吠 (.*)"); //匹配请求语音
const come_yap_reg = new RegExp("^\\/嘴臭 (.*)"); //匹配对话语音
const teach_reg = new RegExp("^问：(.*)答：(.*)"); //匹配教学指令
const prpr_reg = new RegExp("^\\/prpr (.*)"); //匹配prpr
const pohai_reg = new RegExp("^\\/迫害 (.*)"); //匹配迫害p图
const teach_balabala_reg = new RegExp("^\\/说不出话 (.*)"); //匹配balabala教学
const hand_grenade_reg = new RegExp("^一个手雷(.*)"); //匹配一个手雷
const mine_reg = new RegExp("埋地雷"); //匹配埋地雷
const fuck_mine_reg = new RegExp("踩地雷"); //匹配踩地雷
const hope_flower_reg = new RegExp("^希望的花(.*)"); //匹配希望的花
const loop_bomb_reg = new RegExp("^击鼓传雷(.*)"); //匹配击鼓传雷
const is_qq_reg = new RegExp("^[1-9][0-9]{4,9}$"); //校验是否是合法的qq号
const has_qq_reg = new RegExp("\\[CQ:at,qq=(.*)\\]"); //匹配是否有@

console.log(version.ver);

if (chat_swich) {
  console.log("系统配置：web端自动聊天开启".on);
} else {
  console.log("系统配置：web端自动聊天关闭".off);
}

if (news_swich) {
  console.log("系统配置：web端首屏新闻开启".on);
} else {
  console.log("系统配置：web端首屏新闻关闭".off);
}

if (conn_go_cqhttp) {
  console.log(`系统配置：qqBot小夜开启，请确认 plugins/go-cqhttp 文件夹内的 config.yml 是否配置正确并启动go-cqhttp`.on);
} else {
  console.log("系统配置：qqBot小夜关闭".off);
}

if (Now_On_Live) {
  console.log(`系统配置：小夜直播对线开启，请确认哔哩哔哩直播间id是否为 ${blive_room_id}`.on);
} else {
  console.log("系统配置：小夜直播对线关闭".off);
}

http.listen(80, () => {
  console.log(`${Curentyyyymmdd()}${CurentTime()} 系统启动，访问 127.0.0.1 即可使用`.log);
});

/*
 *
 *下面是三大核心功能和实现：web端、qq端、直播间端
 *
 */

//web端核心代码，socket事件处理
io.on("connection", (socket) => {
  socket.emit("getcookie");
  let CID = cookie.parse(socket.request.headers.cookie || "").ChatdacsID;
  if (CID === undefined) {
    socket.emit("getcookie");
    return 0;
  }
  socket.emit("version", version);
  io.emit("onlineusers", ++onlineusers);

  //开始获取用户信息并处理
  GetUserData(CID)
    .then(([nickname, logintimes, lastlogintime]) => {
      console.log(`${Curentyyyymmdd() + CurentTime()}用户 ${nickname}(${CID}) 已连接`.log);

      UpdateLogintimes(CID)
        .then((resolve) => {
          console.log(`update successfully, ${resolve}`);
        })
        .catch((reject) => {
          console.log(`err, ${reject}`);
        });

      UpdateLastLogintime(CID)
        .then((resolve) => {
          console.log(`update successfully, ${resolve}`);
        })
        .catch((reject) => {
          console.log(`err, ${reject}`);
        });

      socket.username = nickname;

      io.emit("system message", `@欢迎回来，${socket.username}(${CID}) 。这是你第${logintimes}次访问。上次访问时间：${lastlogintime}`);
    })
    //若无法获取该用户信息，则应该是其第一次访问，接下来是新增用户操作：
    .catch((reject) => {
      let CID = cookie.parse(socket.request.headers.cookie || "").ChatdacsID;
      console.log(`GetUserData(): rejected, and err:${reject}`.error);
      console.log(`${Curentyyyymmdd() + CurentTime()}新用户 ${CID} 已连接`.log);
      RandomNickname()
        .then((resolve) => {
          db.run(`INSERT INTO users VALUES('${resolve}', '${CID}', '2', '${Curentyyyymmdd()}${CurentTime()}')`);
          socket.username = resolve;
          io.emit("system message", `@新用户 ${CID} 已连接。小夜帮你取了一个随机昵称：「${socket.username}」，请前往 更多-设置 来更改昵称`);
          socket.emit("chat message", {
            CID: "0",
            msg: help,
          });
        })
        .catch((reject) => {
          console.log(`随机昵称错误：${reject}`.error);
        });
    });

  if (news_swich) {
    Getnews()
      .then((resolve) => {
        io.emit("system message", resolve); //过于影响新UI的聊天界面，改为在系统消息显示
      })
      .catch((reject) => {
        console.log(`Getnews(): rejected, and err:${reject}`.error);
        socket.emit("system message", `Getnews() err:${reject}`);
      });
  }

  socket.on("disconnect", () => {
    onlineusers--;
    io.emit("onlineusers", onlineusers);
    console.log(`${Curentyyyymmdd()}${CurentTime()} 用户 ${socket.username} 已断开连接`.log);
    io.emit("system message", "@用户 " + socket.username + " 已断开连接");
  });

  socket.on("typing", () => {
    io.emit("typing", `${socket.username} 正在输入...`);
  });

  socket.on("typing_over", () => {
    io.emit("typing", "");
  });

  //用户设置
  socket.on("getsettings", () => {
    let CID = cookie.parse(socket.request.headers.cookie || "").ChatdacsID;
    socket.emit("settings", { CID: CID, name: socket.username });
  });

  //更新日志
  socket.on("getupdatelog", () => {
    socket.emit("updatelog", updatelog);
  });

  //致谢列表
  socket.on("thanks", () => {
    socket.emit("thanks", thanks);
  });

  //web端最核心代码，聊天处理
  socket.on("chat message", (msg) => {
    let CID = cookie.parse(socket.request.headers.cookie || "").ChatdacsID;
    var msg = msg.msg;
    msg = msg.replace(/'/g, "[非法字符]"); //防爆
    msg = msg.replace(/</g, "[非法字符]"); //防爆
    msg = msg.replace(/>/g, "[非法字符]"); //防爆
    console.log(`${Curentyyyymmdd() + CurentTime()}收到用户 ${socket.username}(${CID}) 的消息: ${msg}`.warn);
    db.run(`INSERT INTO messages VALUES('${Curentyyyymmdd()}', '${CurentTime()}', '${CID}', '${msg}')`);

    io.emit("chat message", { CID: CID, name: socket.username, msg: msg }); //用户广播

    //开始if地狱
    if (rename_reg.test(msg)) {
      db.run(`UPDATE users SET nickname = '${msg.slice(8)}' WHERE CID ='${CID}'`);
      io.emit("chat message", {
        CID: "0",
        msg: `@昵称重命名完毕，小夜现在会称呼你为 ${msg.slice(8)} 啦`,
      });
    } else if (msg === "/log_view") {
      db.all("SELECT yyyymmdd, COUNT(*) As count FROM messages Group by yyyymmdd", (e, sql) => {
        var data = [];
        if (!e) {
          for (let i = 0; i < sql.length; i++) {
            data.push([sql[i].yyyymmdd, sql[i].count]);
          }
          console.log(data).log;
          io.emit("chart message", data);
        } else {
          console.log(`/log_view错误：${e}`.error);
          io.emit("chat message", { CID: "0", msg: `@${e}` });
        }
      });
    } else if (bv2av_reg.test(msg)) {
      msg = msg.replace(" ", "");
      Bv2Av(msg)
        .then((resolve) => {
          io.emit("chat message", { CID: "0", msg: resolve });
        })
        .catch((reject) => {
          console.log(`Bv2Av(): rejected, and err:${reject}`.error);
          io.emit("system message", `@Bv2Av() err:${reject}`);
        });
    } else if (msg === "/reload") {
      io.emit("reload");
    } else if (msg === "/帮助") {
      io.emit("chat message", { CID: "0", msg: `@${help}` });
    } else if (msg === "/随机cos") {
      RandomCos()
        .then((resolve) => {
          io.emit("pic message", resolve);
        })
        .catch((reject) => {
          console.log(`RandomCos(): rejected, and err:${reject}`.error);
          io.emit("system message", `@RandomCos() err:${reject}`);
        });
    } else if (msg === "/随机买家秀") {
      RandomTbshow()
        .then((resolve) => {
          io.emit("pic message", resolve);
        })
        .catch((reject) => {
          console.log(`RandomTbshow(): rejected, and err:${reject}`.error);
          io.emit("system message", `@RandomTbshow() err:${reject}`);
        });
    } else if (msg === "/随机冷知识") {
      RandomHomeword()
        .then((resolve) => {
          io.emit("chat message", { CID: "0", msg: `@${resolve}` });
        })
        .catch((reject) => {
          console.log(`RandomHomeword(): rejected, and err:${reject}`.error);
          io.emit("system message", `@RandomHomeword() err:${reject}`);
        });
    } else if (msg === "/随机二次元图") {
      RandomECY()
        .then((resolve) => {
          io.emit("pic message", resolve);
        })
        .catch((reject) => {
          console.log(`RandomECY(): rejected, and err:${reject}`.error);
          io.emit("system message", `@RandomECY() err:${reject}`);
        });
      //更改qqBot小夜回复率
    } else if (change_reply_probability_reg.test(msg)) {
      msg = msg.replace("/admin_change_reply_probability ", "");
      reply_probability = msg;
      socket.emit("system message", `qqBot小夜回复率已修改为${msg}%`);
      //更改qqBot小夜复读率
    } else if (change_fudu_probability_reg.test(msg)) {
      msg = msg.replace("/admin_change_fudu_probability ", "");
      fudu_probability = msg;
      socket.emit("system message", `qqBot小夜复读率已修改为${msg}%`);
      //吠
    } else if (yap_reg.test(msg)) {
      msg = msg.replace("/吠 ", "");
      BetterTTS(msg)
        .then((resolve) => {
          io.emit("audio message", resolve);
        })
        .catch((reject) => {
          console.log(`TTS错误：${reject}`.error);
          io.emit("system message", `@TTS错误：${reject}`);
        });
    } //教学系统，抄板于虹原翼版小夜v3
    else if (teach_reg.test(msg)) {
      msg = msg.substr(2).split("答：");
      if (msg.length !== 2) {
        console.log(`教学指令：分割有误，退出教学`.error);
        io.emit("system message", `@你教的姿势不对噢qwq`);
        return 0;
      }
      let ask = msg[0].trim(),
        ans = msg[1].trim();
      if (ask == "" || ans == "") {
        console.log(`问/答为空，退出教学`.error);
        io.emit("system message", `@你教的姿势不对噢qwq`);
        return 0;
      }
      if (ask.indexOf(/\r?\n/g) !== -1) {
        console.log(`教学指令：关键词换行了，退出教学`.error);
        io.emit("system message", `@关键词不能换行啦qwq`);
        return 0;
      }
      console.log(`web端 ${socket.username} 想要教给小夜：问：${ask} 答：${ans}，现在开始检测合法性`.log);
      for (let i in black_list_words) {
        if (
          ask.toLowerCase().indexOf(black_list_words[i].toLowerCase()) !== -1 ||
          ans.toLowerCase().indexOf(black_list_words[i].toLowerCase()) !== -1
        ) {
          console.log(`教学指令：检测到不允许的词：${black_list_words[i]}，退出教学`.error);
          io.emit("system message", `@你教的内容里有主人不允许小夜学习的词qwq`);
          return 0;
        }
      }
      if (Buffer.from(ask).length < 4) {
        //关键词最低长度：4个英文或2个汉字
        console.log(`教学指令：关键词太短，退出教学`.error);
        io.emit("system message", `@关键词太短了啦qwq，至少要4个字节啦`);
        return 0;
      }
      if (ask.length > 350 || ans.length > 350) {
        //图片长度差不多是350左右
        console.log(`教学指令：教的太长了，退出教学`.error);
        io.emit("system message", `@你教的内容太长了，小夜要坏掉了qwq，不要呀`);
        return 0;
      }
      //到这里都没有出错的话就视为没有问题，可以让小夜学了
      console.log(`教学指令：没有检测到问题，可以学习`.log);
      db.run(`INSERT INTO chat VALUES('${ask}', '${ans}')`);
      console.log(`教学指令：学习成功`.log);
      io.emit("system message", `@哇！小夜学会啦！对我说：${ask} 试试吧，小夜有可能会回复 ${ans} 噢`);
      return 0;
    } else {
      if (chat_swich) {
        //交给聊天函数处理
        ChatProcess(msg)
          .then((resolve) => {
            io.emit("chat message", {
              CID: "0",
              msg: resolve,
            });
          })
          .catch((reject) => {
            //如果没有匹配到回复，那就让舔狗来回复
            console.log(`${reject}，交给舔狗回复`.warn);
            PrprDoge()
              .then((resolve) => {
                console.log(`舔狗回复：${resolve}`.log);
                io.emit("chat message", {
                  CID: "0",
                  msg: resolve,
                });
              })
              .catch((reject) => {
                console.log(`随机舔狗错误：${reject}`.error);
              });
          });
      } else {
        return 0;
      }
    }
  });
});

//qqBot小夜核心代码，对接go-cqhttp
if (conn_go_cqhttp) {
  app.post("/bot", (req, res) => {
    if (req.body.message) {
      let notify;
      switch (req.body.message_type) {
        case "private":
          notify = `qqBot小夜收到 ${req.body.user_id} (${req.body.sender.nickname}) 发来的消息：${req.body.message}`;
          break;
        case "group":
          notify = `qqBot小夜收到群 ${req.body.group_id} 的 ${req.body.user_id} (${req.body.sender.nickname}) 发来的消息：${req.body.message}`;
          break;
        default:
          res.send();
          break;
      }
      console.log(notify);
      io.emit("system message", `@${notify}`);

      //转发图片到web端，按需启用
      if (qqimg_to_web) {
        if (isImage_reg.test(req.body.message)) {
          let url = img_url_reg.exec(req.body.message);
          SaveQQimg(url)
            .then((resolve) => {
              io.emit("qqpic message", resolve);
            })
            .catch((reject) => {
              console.log(reject.error);
            });
          res.send();
          return 0;
        }
      }

      //转发视频到web端
      if (isVideo_reg.test(req.body.message)) {
        let url = video_url_reg.exec(req.body.message)[0];
        io.emit("qqvideo message", { file: url, filename: "qq视频" });
        res.send();
        return 0;
      }

      //群服务开关判断
      if (req.body.message_type === "group") {
        //服务启用开关
        if (req.body.message === "张菊") {
          //查询请求者是否是管理员，只有管理员才可以让小夜张菊，该操作优先度最高
          request(
            `http://127.0.0.1:5700/get_group_member_info?group_id=${req.body.group_id}&user_id=${req.body.user_id}`,
            function (_error, _response, body) {
              body = JSON.parse(body);
              if (body.data.role === "owner" || body.data.role === "admin") {
                console.log(`群 ${req.body.group_id} 启用了小夜服务`.log);
                db.run(`UPDATE qq_group SET talk_enabled = '1' WHERE group_id ='${req.body.group_id}'`);
                res.send({ reply: "小夜的菊花被管理员张开了，小夜在本群的所有服务已经启用，要停用请发 闭菊" });
                return 0;
                //不是管理，再看看是不是qqBot管理员
              } else {
                for (let i in qq_admin_list) {
                  if (req.body.user_id == qq_admin_list[i]) {
                    console.log(`群 ${req.body.group_id} 启用了小夜服务`.log);
                    db.run(`UPDATE qq_group SET talk_enabled = '1' WHERE group_id ='${req.body.group_id}'`);
                    res.send({ reply: "小夜的菊花被主人张开了，小夜在本群的所有服务已经启用，要停用请发 闭菊" });
                    return 0;
                  }
                }
                //看来真不是管理员呢
                res.send({ reply: "你不是群管理呢，小夜不张，张菊需要让管理员来帮忙张噢" });
                return 0;
              }
            }
          );
        }
        //在收到群消息的时候搜索群是否存在于qq_group表，判断聊天开关
        else {
          db.all(`SELECT * FROM qq_group WHERE group_id = '${req.body.group_id}'`, (err, sql) => {
            if (!err && sql[0]) {
              //群存在于qq_group表则判断聊天开关 talk_enabled，闭嘴了就无视掉所有消息
              if (sql[0].talk_enabled === 0) {
                console.log(`群 ${req.body.group_id} 服务已停用，无视群所有消息`.error);
                res.send();
                return 0;
              } else {
                //服务启用了，允许进入后续的指令系统

                /*                                                                    群指令系统                                                                  */

                //地雷爆炸判断，先判断这条消息是否引爆，再从数据库取来群地雷数组，引爆后删除地雷，原先的地雷是用随机数生成被炸前最大回复作为引信，现在换一种思路，用更简单的随机数引爆
                let boom_flag = Math.floor(Math.random() * 100); //踩中flag
                //如果判定踩中，检查该群是否有雷
                if (boom_flag < 10) {
                  db.all(`SELECT * FROM mine WHERE group_id = '${req.body.group_id}'`, (err, sql) => {
                    if (!err && sql[0]) {
                      //有则判断是否哑雷
                      let unboom = Math.floor(Math.random() * 100); //是否哑雷
                      if (unboom < 30) {
                        //是哑雷，直接删除地雷
                        console.log(`${sql[0].placed_qq} 在群 ${sql[0].group_id} 埋的地雷被踩中，但这是一颗哑雷`.log);
                        db.run(`DELETE FROM mine WHERE mine_id = '${sql[0].mine_id}' `);
                        res.send({
                          reply: `[CQ:at,qq=${req.body.user_id}]恭喜你躲过一劫，[CQ:at,qq=${sql[0].placed_qq}]埋的地雷掺了沙子，是哑雷，炸了，但没有完全炸`,
                        });
                        //成功引爆并删除地雷
                      } else {
                        let boom_time = Math.floor(Math.random() * 60 * 2); //造成伤害时间
                        request(
                          `http://127.0.0.1:5700/set_group_ban?group_id=${req.body.group_id}&user_id=${req.body.user_id}&duration=${boom_time}`,
                          function (error, _response, _body) {
                            if (!error) {
                              console.log(`${sql[0].placed_qq} 在群 ${sql[0].group_id} 埋的地雷被引爆，雷已经被删除`.log);
                              db.run(`DELETE FROM mine WHERE mine_id = '${sql[0].mine_id}' `);
                              res.send({
                                reply: `[CQ:at,qq=${req.body.user_id}]恭喜你，被[CQ:at,qq=${sql[0].placed_qq}]所埋地雷炸伤，休养生息${boom_time}秒！`,
                              });
                            } else {
                              console.log("请求127.0.0.1:5700/set_group_whole_ban错误：", error);
                              res.send({ reply: `日忒娘，怎么又出错了` });
                            }
                          }
                        );
                      }
                    }
                  });
                  return 0; //如果return 0的话会出现埋了就炸的效果，如果注释掉会出现和指令同时响应的情况
                }

                //服务停用开关
                if (req.body.message === "闭菊") {
                  console.log(`群 ${req.body.group_id} 停止了小夜服务`.error);
                  db.run(`UPDATE qq_group SET talk_enabled = '0' WHERE group_id ='${req.body.group_id}'`);
                  res.send({ reply: "小夜的菊花闭上了，小夜在本群的所有服务已经停用，取消请发 张菊" });
                  return 0;
                }

                //测试指令
                if (req.body.message === "/ping") {
                  console.log("Pong!".log);
                  res.send({ reply: "Pong!" });
                  return 0;
                }

                //教学系统，抄板于虹原翼版小夜v3
                if (teach_reg.test(req.body.message)) {
                  let msg = req.body.message;
                  msg = msg.replace(/'/g, "[非法字符]"); //防爆
                  msg = msg.replace(/</g, "[非法字符]"); //防爆
                  msg = msg.replace(/>/g, "[非法字符]"); //防爆
                  msg = msg.substr(2).split("答：");
                  if (msg.length !== 2) {
                    console.log(`教学指令：分割有误，退出教学`.error);
                    res.send({ reply: "你教的姿势不对噢qwq" });
                    return 0;
                  }
                  let ask = msg[0].trim(),
                    ans = msg[1].trim();
                  if (ask == "" || ans == "") {
                    console.log(`问/答为空，退出教学`.error);
                    res.send({ reply: "你教的姿势不对噢qwq" });
                    return 0;
                  }
                  if (ask.indexOf(/\r?\n/g) !== -1) {
                    console.log(`教学指令：关键词换行了，退出教学`.error);
                    res.send({ reply: "关键词不能换行啦qwq" });
                    return 0;
                  }
                  console.log(`${req.body.user_id}(${req.body.sender.nickname}) 想要教给小夜：问：${ask} 答：${ans}，现在开始检测合法性`.log);
                  for (let i in black_list_words) {
                    if (
                      ask.toLowerCase().indexOf(black_list_words[i].toLowerCase()) !== -1 ||
                      ans.toLowerCase().indexOf(black_list_words[i].toLowerCase()) !== -1
                    ) {
                      console.log(`教学指令：检测到不允许的词：${black_list_words[i]}，退出教学`.error);
                      res.send({ reply: `你教的内容里有主人不允许小夜学习的词：${black_list_words[i]} qwq` });
                      return 0;
                    }
                  }
                  if (Buffer.from(ask).length < 4) {
                    //关键词最低长度：4个英文或2个汉字
                    console.log(`教学指令：关键词太短，退出教学`.error);
                    res.send({ reply: "关键词太短了啦qwq，至少要4个字节啦" });
                    return 0;
                  }
                  if (ask.length > 350 || ans.length > 350) {
                    //图片长度差不多是350左右
                    console.log(`教学指令：教的太长了，退出教学`.error);
                    res.send({ reply: "你教的内容太长了，小夜要坏掉了qwq，不要呀" });
                    return 0;
                  }
                  //到这里都没有出错的话就视为没有问题，可以让小夜学了
                  console.log(`教学指令：没有检测到问题，可以学习`.log);
                  db.run(`INSERT INTO chat VALUES('${ask}', '${ans}')`);
                  console.log(`教学指令：学习成功`.log);
                  res.send({ reply: `哇！小夜学会啦！对我说：${ask} 试试吧，小夜有可能会回复 ${ans} 噢` });
                  return 0;
                }

                //balabala教学，对于一些难以回复的对话，小夜的词库中没有搜索到回复的时候，小夜会随机回复这些回复
                if (teach_balabala_reg.test(req.body.message)) {
                  let msg = req.body.message;
                  msg = msg.replace(/'/g, "[非法字符]"); //防爆
                  msg = msg.replace(/</g, "[非法字符]"); //防爆
                  msg = msg.replace(/>/g, "[非法字符]"); //防爆
                  msg = msg.replace("/说不出话 ", "");
                  console.log(`${req.body.user_id}(${req.body.sender.nickname}) 想要教给小夜balabala：${msg}，现在开始检测合法性`.log);
                  for (let i in black_list_words) {
                    if (
                      msg.toLowerCase().indexOf(black_list_words[i].toLowerCase()) !== -1 ||
                      msg.toLowerCase().indexOf(black_list_words[i].toLowerCase()) !== -1
                    ) {
                      console.log(`balabala教学：检测到不允许的词：${black_list_words[i]}，退出教学`.error);
                      res.send({ reply: "你教的内容里有主人不允许小夜学习的词qwq" });
                      return 0;
                    }
                  }
                  console.log(`balabala教学：没有检测到问题，可以学习`.log);
                  db.run(`INSERT INTO balabala VALUES('${msg}')`);
                  console.log(`balabala教学：学习成功`.log);
                  res.send({ reply: `哇！小夜学会啦！小夜可能在说不出话的时候说 ${msg} 噢` });
                }

                //色图
                for (let i in req_setu_list) {
                  if (req.body.message === req_setu_list[i]) {
                    RandomCos()
                      .then((resolve) => {
                        let setu_file = `http://127.0.0.1/${resolve.replace(/\//g, "\\")}`;
                        res.send({
                          reply: `[CQ:image,file=${setu_file},url=${setu_file}]`,
                        });
                      })
                      .catch((reject) => {
                        console.log(`RandomCos(): rejected, and err:${reject}`.error);
                        res.send({ reply: `你要的色图发送失败啦：${reject}` });
                      });
                    return 0;
                  }
                }

                //福利姬
                for (let i in req_fuliji_list) {
                  if (req.body.message === req_fuliji_list[i]) {
                    RandomTbshow()
                      .then((resolve) => {
                        res.send({
                          reply: `[CQ:image,file=${resolve},url=${resolve}]`,
                        });
                      })
                      .catch((reject) => {
                        console.log(`RandomCos(): rejected, and err:${reject}`.error);
                        res.send({ reply: `你要的福利姬色图发送失败啦：${reject}` });
                      });
                    return 0;
                  }
                }

                //来点二次元
                for (let i in req_ECY_list) {
                  if (req.body.message === req_ECY_list[i]) {
                    RandomECY()
                      .then((resolve) => {
                        res.send({
                          reply: `[CQ:image,file=${resolve},url=${resolve}]`,
                        });
                      })
                      .catch((reject) => {
                        console.log(`RandomCos(): rejected, and err:${reject}`.error);
                        res.send({ reply: `你要的二次元色图发送失败啦：${reject}` });
                      });
                    return 0;
                  }
                }

                //舔我
                if (req.body.message === "/舔我") {
                  PrprDoge()
                    .then((resolve) => {
                      console.log(`舔狗舔了一口：${resolve}`.log);
                      res.send({ reply: resolve });
                    })
                    .catch((reject) => {
                      console.log(`随机舔狗错误：${reject}`.error);
                    });
                  return 0;
                }

                //吠，直接把文字转化为语音
                if (yap_reg.test(req.body.message)) {
                  let tex = req.body.message;
                  tex = tex.replace("/吠 ", "");
                  BetterTTS(tex)
                    .then((resolve) => {
                      let tts_file = `[CQ:record,file=http://127.0.0.1${resolve.file},url=http://127.0.0.1${resolve.file}]`;
                      res.send({ reply: tts_file });
                    })
                    .catch((reject) => {
                      console.log(`TTS错误：${reject}`.error);
                    });
                  return 0;
                }

                //嘴臭，小夜的回复转化为语音
                if (come_yap_reg.test(req.body.message)) {
                  let message = req.body.message;
                  message = message.replace("/嘴臭 ", "");
                  console.log(`有人对线说 ${message}，小夜要嘴臭了`.log);
                  io.emit("sysrem message", `@有人对线说 ${message}，小夜要嘴臭了`);
                  ChatProcess(message)
                    .then((resolve) => {
                      let reply = resolve;
                      BetterTTS(reply)
                        .then((resolve) => {
                          let tts_file = `[CQ:record,file=http://127.0.0.1${resolve.file},url=http://127.0.0.1${resolve.file}]`;
                          res.send({ reply: tts_file });
                        })
                        .catch((reject) => {
                          console.log(`TTS错误：${reject}`.error);
                        });
                    })
                    .catch((reject) => {
                      //如果没有匹配到回复，那就回复一句默认语音
                      console.log(`${reject}，语音没有回复`.warn);
                      BetterTTS()
                        .then((resolve) => {
                          let tts_file = `[CQ:record,file=http://127.0.0.1${resolve.file},url=http://127.0.0.1${resolve.file}]`;
                          res.send({ reply: tts_file });
                        })
                        .catch((reject) => {
                          console.log(`TTS错误：${reject}`.error);
                        });
                    });
                  return 0;
                }

                //prpr，来自jjbot的功能
                if (prpr_reg.test(req.body.message)) {
                  let bodyPart = [
                    "手掌",
                    "双脚",
                    "熊脸",
                    "脸蛋",
                    "鼻子",
                    "小嘴",
                    "咪咪",
                    "大雕",
                    "蛋蛋",
                    "大× [不忍直视]",
                    "双眼",
                    "脖子",
                    "胸口",
                    "大腿",
                    "脚踝",
                    "那里 >////<",
                    "腋下",
                    "耳朵",
                    "小腿",
                    "袜子",
                    "臭脚",
                  ];
                  let msg = req.body.message;
                  let who = req.body.sender.nickname;
                  if (!who) who = "小夜";
                  prpr_who = msg.replace("/prpr ", "");
                  if (!prpr_who || prpr_who === "/prpr") {
                    prpr_who = prpr_who.replace("/prpr", "");
                    prpr_who = "自己";
                  }
                  let random_bodyPart = bodyPart[Math.floor(Math.random() * bodyPart.length)];
                  let final = `${who} 舔了舔 ${prpr_who} 的 ${random_bodyPart}，我好兴奋啊！`;
                  console.log(`prpr指令：${final} `.log);
                  res.send({ reply: final });
                  return 0;
                }

                //今日不带套
                for (let i in req_no_trap_list) {
                  if (req.body.message === req_no_trap_list[i]) {
                    let now = new Date();
                    let year = now.getFullYear();
                    let month = now.getMonth() + 1;
                    let day = now.getDate();
                    if (month > 2) {
                      year++;
                    }
                    let star_set_name = "魔羯水瓶双鱼牡羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯";
                    let star_set_days = [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22];
                    let star_set_result = star_set_name.substr(month * 2 - (day < star_set_days[month - 1] ? 2 : 0), 2);
                    let shenxiao = ["猴", "鸡", "狗", "猪", "鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊"];
                    let shenxiao_result = /^\d{4}$/.test(year) ? shenxiao[year % 12] : false;
                    let final = `小夜温馨提示您：今日不戴套，孩子${star_set_result}座，属${shenxiao_result}，${year + 18}年高考，一本机率约${parseInt(
                      Math.random() * (99 - 20 + 1) + 20,
                      10
                    )}`;
                    console.log(`今日不带套指令：${final} `.log);
                    res.send({ reply: final });
                    return 0;
                  }
                }

                //avg模板，可以写简单的随机小说
                if (req.body.message === "/画师算命") {
                  let paintstyle = ["厚涂", "美式", "韩风", "迪士尼风格", "日系赛璐璐", "日系平涂", "国风"];
                  let like = [
                    "机械",
                    "大腿",
                    "美少年",
                    "美少女",
                    "奶子",
                    "兄贵",
                    "屁股",
                    "脸蛋",
                    "大屌",
                    "给佬",
                    "幼女",
                    "JK",
                    "黑丝",
                    "胖次",
                    "白丝",
                    "小手",
                    "【不可描述】",
                  ];
                  let andthen = [
                    "有了一些同好",
                    "被人骗稿多次",
                    "找不到工作",
                    "只能做外包",
                    "出了很多本子",
                    "被人骗炮",
                    "做了自由职业者",
                    "当了某大项目主美",
                    "经常被抄袭",
                    "在某站成名",
                    "每天混吃等死",
                  ];
                  let buthen = [
                    "被请喝茶",
                    "被人寄刀片",
                    "被举报",
                    "本子卖到爆炸",
                    "被人吐槽",
                    "被人骗炮",
                    "突然爆红",
                    "被人抄袭",
                    "在街角被蜀黍强暴",
                  ];
                  let atlast = [
                    "因为画得不行转而卖艺，竟然变成了偶像",
                    "做了一辈子社畜",
                    "名垂青史但是变成了时代眼泪",
                    "也没有出人头地，转行做了别的行业",
                    "赚够了钱去了幻想乡",
                    "因为断连载被愤怒的读者高呼飞出地球",
                    "舒舒服服退休回老家结婚",
                    "一直活跃在最前线，活到老画到老",
                    "成为了魔法少女",
                  ];
                  let who = req.body.sender.nickname;
                  if (!who) who = "小夜";
                  let random_paintstyle = paintstyle[Math.floor(Math.random() * paintstyle.length)];
                  let random_like = like[Math.floor(Math.random() * like.length)];
                  let random_andthen = andthen[Math.floor(Math.random() * andthen.length)];
                  let random_buthen = buthen[Math.floor(Math.random() * buthen.length)];
                  let random_atlast = atlast[Math.floor(Math.random() * atlast.length)];
                  let final = `${who}是一名${random_paintstyle}画师，最喜欢画${random_like}，而且${random_andthen}，然而因为画得太过和谐而${random_buthen}，还因为这件事在微博上有了${(
                    Math.random() * (1000000 - 1) +
                    1
                  ).toFixed(0)}个粉丝，做了${(Math.random() * (100 - 1).toFixed(0) + 1).toFixed(0)}年画师，最后${random_atlast}。`;
                  console.log(`画师算命指令：${final} `.log);
                  res.send({ reply: final });
                  return 0;
                }

                //迫害，p图，这里需要重写复用
                if (pohai_reg.test(req.body.message)) {
                  let pohai_list = ["唐可可", "上原步梦", "猛男狗", "令和", "鸭鸭"]; //迫害名单
                  let pohai_pic_list = ["coco_echo.jpg", "ayumu_qaq.jpg", "doge.jpg", "nianhao.jpg", "yaya.gif"]; //迫害图片列表
                  let pohai_pic = "coco_echo.jpg"; //迫害图片，如果被迫害人不在迫害名单里，那么默认迫害唐可可
                  let tex_config_list = {
                    唐可可: ["390", "160", "-0.19", "8"],
                    上原步梦: ["227", "440", "0", "26"],
                    猛男狗: ["170", "100", "0", "0"],
                    令和: ["130", "110", "-0.05", "1"],
                    鸭鸭: ["30", "30", "0", "2"],
                  }; //迫害文字位置，left、top、rotate、多少字换行
                  let tex_config = tex_config_list.唐可可; //默认迫害文字位置是唐可可的
                  let msg = req.body.message + " "; //结尾加一个空格防爆

                  msg = msg.substr(3).split(" ");
                  let pohai_who = msg[1].trim(), //迫害谁
                    pohai_tex = msg[2].trim(); //迫害文字

                  //先搜索被迫害人是否在迫害名单里
                  for (let i in pohai_list) {
                    if (pohai_who === pohai_list[i]) {
                      //被迫害人发现
                      pohai_pic = pohai_pic_list[i];
                      tex_config = tex_config_list[pohai_who];
                      console.log(`被迫害人 ${pohai_who} 发现，使用迫害图 ${pohai_pic_list[i]}`.log);
                    }
                  }

                  //如果没有迫害文字的话，应该是省略了被迫害人，如 /迫害 迫害文字 这样，所以迫害文字是第一个参数
                  if (!pohai_tex) {
                    pohai_tex = msg[1].trim();
                  }

                  //如果迫害文字里有@某人，将[CQ:at,qq=QQ号]转为昵称
                  if (has_qq_reg.test(pohai_tex)) {
                    console.log(`存在@内容，将替换为昵称`.log);
                    let at_start = pohai_tex.indexOf("[CQ:at,qq="); //取@开始
                    let at_end = pohai_tex.indexOf("]"); //取@结束
                    let tex_top = pohai_tex.substr(0, at_start); //取除了@外的字符串头
                    let tex_bottom = pohai_tex.substr(at_end + 1); //取除了@外的字符串尾
                    //获取qq
                    let qq_id = pohai_tex.replace("[CQ:at,qq=", "");
                    qq_id = qq_id.replace("]", "");
                    qq_id = qq_id.trim();
                    //如果是正确的qq号则替换
                    if (is_qq_reg.test(qq_id)) {
                      //获取qq号在群内的昵称
                      request(
                        `http://127.0.0.1:5700/get_group_member_info?group_id=${req.body.group_id}&user_id=${qq_id}&no_cache=0`,
                        function (error, _response, body) {
                          //这一步实在是太慢了啊实在不想异步了
                          if (!error) {
                            body = JSON.parse(body);
                            pohai_tex = `${tex_top}${body.data.nickname}${tex_bottom}`; //拼接为完整的迫害tex
                            //如果需要换行，按 tex_config[3] 来换行
                            if (pohai_tex.length > tex_config[3]) {
                              let enter = tex_config[3];
                              let new_pohai_tex = "";
                              for (let i = 0, j = 1; i < pohai_tex.length; i++, j++) {
                                if (j && j % enter == 0) {
                                  new_pohai_tex += pohai_tex[i] + "\n";
                                } else {
                                  new_pohai_tex += pohai_tex[i];
                                }
                              }
                              pohai_tex = new_pohai_tex;
                            }
                            //开始p图
                            let sources = `${__dirname}\\static\\xiaoye\\ps\\${pohai_pic}`; //载入迫害图
                            loadImage(sources).then((image) => {
                              let canvas = createCanvas(parseInt(image.width), parseInt(image.height)); //根据迫害图尺寸创建画布
                              let ctx = canvas.getContext("2d");
                              ctx.drawImage(image, 0, 0);
                              ctx.font = "30px Sans";
                              ctx.textAlign = "center";
                              ctx.rotate(tex_config[2]);
                              //ctx.fillStyle = "#00ff00";
                              let tex_width = Math.floor(ctx.measureText(pohai_tex).width);
                              console.log(`文字宽度：${tex_width}`.log);
                              ctx.fillText(pohai_tex, tex_config[0], tex_config[1]);
                              let file_local = `${__dirname}\\static\\xiaoye\\images\\${sha1(canvas.toBuffer())}.jpg`;
                              fs.writeFileSync(file_local, canvas.toBuffer());
                              let file_online = `http://127.0.0.1/xiaoye/images/${sha1(canvas.toBuffer())}.jpg`;
                              console.log(`迫害成功，图片发送：${file_local}`.log);
                              res.send({
                                reply: `[CQ:image,file=${file_online},url=${file_online}]`,
                              });
                            });
                          } else {
                            console.log("请求127.0.0.1:5700//get_group_member_info错误：", error);
                            res.send({ reply: `日忒娘，怎么又出错了` });
                          }
                        }
                      );
                    }
                  } else {
                    //如果需要换行，按 tex_config[3] 来换行
                    if (pohai_tex.length > tex_config[3]) {
                      let enter = tex_config[3];
                      let new_pohai_tex = "";
                      for (let i = 0, j = 1; i < pohai_tex.length; i++, j++) {
                        if (j && j % enter == 0) {
                          new_pohai_tex += pohai_tex[i] + "\n";
                        } else {
                          new_pohai_tex += pohai_tex[i];
                        }
                      }
                      pohai_tex = new_pohai_tex;
                    }
                    //开始p图
                    let sources = `${__dirname}\\static\\xiaoye\\ps\\${pohai_pic}`; //载入迫害图
                    loadImage(sources).then((image) => {
                      let canvas = createCanvas(parseInt(image.width), parseInt(image.height)); //根据迫害图尺寸创建画布
                      let ctx = canvas.getContext("2d");
                      ctx.drawImage(image, 0, 0);
                      ctx.font = "30px Sans";
                      ctx.textAlign = "center";
                      ctx.rotate(tex_config[2]);
                      //ctx.fillStyle = "#00ff00";
                      let tex_width = Math.floor(ctx.measureText(pohai_tex).width);
                      console.log(`文字宽度：${tex_width}`.log);
                      ctx.fillText(pohai_tex, tex_config[0], tex_config[1]);
                      let file_local = `${__dirname}\\static\\xiaoye\\images\\${sha1(canvas.toBuffer())}.jpg`;
                      fs.writeFileSync(file_local, canvas.toBuffer());
                      let file_online = `http://127.0.0.1/xiaoye/images/${sha1(canvas.toBuffer())}.jpg`;
                      console.log(`迫害成功，图片发送：${file_local}`.log);
                      res.send({
                        reply: `[CQ:image,file=${file_online},url=${file_online}]`,
                      });
                    });
                  }
                  return 0;
                }

                //一个手雷
                if (hand_grenade_reg.test(req.body.message)) {
                  let who;
                  let holly_hand_grenade = Math.floor(Math.random() * 1000); //丢一个骰子，判断手雷是否变成神圣手雷
                  let success_flag = Math.floor(Math.random() * 100); //丢一个骰子，判断手雷是否成功丢出
                  let boom_time = Math.floor(Math.random() * 60 * 2); //造成伤害时间
                  if (holly_hand_grenade < 1) {
                    //1‰几率变成神圣手雷
                    request(`http://127.0.0.1:5700/set_group_whole_ban?group_id=${req.body.group_id}&enable=1`, function (error, _response, _body) {
                      if (!error) {
                        console.log(`触发了神圣手雷，群 ${req.body.group_id} 被全体禁言`.error);
                        res.send({
                          reply: `噢，该死，我的上帝啊，真是不敢相信，瞧瞧我发现了什么，我发誓我没有看错，这竟然是一颗出现率为千分之一的神圣手雷！我是说，这是一颗毁天灭地的神圣手雷啊！哈利路亚！麻烦管理员解除一下`,
                        });
                      } else {
                        console.log("请求127.0.0.1:5700/set_group_whole_ban错误：", error);
                        res.send({ reply: `日忒娘，怎么又出错了` });
                      }
                    });
                    return 0;
                  } else {
                    if (req.body.message === "一个手雷") {
                      who = req.body.user_id; //如果没有要求炸谁，那就是炸自己
                      console.log(`群 ${req.body.group_id} 的群员 ${req.body.user_id} 朝自己丢出一颗手雷`.log);
                    } else {
                      who = req.body.message;
                      who = who.replace("一个手雷 ", "");
                      who = who.replace("一个手雷", "");
                      who = who.replace("[CQ:at,qq=", "");
                      who = who.replace("]", "");
                      who = who.trim();
                      if (is_qq_reg.test(who)) {
                        console.log(`群 ${req.body.group_id} 的 群员 ${req.body.user_id} 尝试向 ${who} 丢出一颗手雷`.log);
                      } else {
                        //目标不是qq号
                        res.send({ reply: `你想丢给谁手雷啊，目标不可以是${who}，不要乱丢` });
                        return 0;
                      }
                    }
                    if (success_flag < 50 || who === req.body.user_id) {
                      //50%几率被自己炸伤
                      request(
                        `http://127.0.0.1:5700/set_group_ban?group_id=${req.body.group_id}&user_id=${req.body.user_id}&duration=${boom_time}`,
                        function (error, _response, _body) {
                          if (!error) {
                            console.log(`群 ${req.body.group_id} 的 群员 ${req.body.user_id} 的手雷炸到了自己`.log);
                            res.send({
                              reply: `[CQ:at,qq=${req.body.user_id}] 小手一滑，被自己丢出的手雷炸伤，造成了${boom_time}秒的伤害，苍天有轮回，害人终害己，祝你下次好运`,
                            });
                          } else {
                            console.log("请求127.0.0.1:5700/set_group_ban错误：", error);
                            res.send({ reply: `日忒娘，怎么又出错了` });
                          }
                        }
                      );
                    } else {
                      //成功丢出手雷
                      request(
                        `http://127.0.0.1:5700/set_group_ban?group_id=${req.body.group_id}&user_id=${who}&duration=${boom_time}`,
                        function (error, _response, _body) {
                          if (!error) {
                            console.log(`群 ${req.body.group_id} 的 群员 ${req.body.user_id} 的手雷炸到了 ${who}`.log);
                            res.send({
                              reply: `恭喜[CQ:at,qq=${who}]被[CQ:at,qq=${req.body.user_id}]丢出的手雷炸伤，造成了${boom_time}秒的伤害，祝你下次好运`,
                            });
                          } else {
                            console.log("请求127.0.0.1:5700/set_group_ban错误：", error);
                            res.send({ reply: `日忒娘，怎么又出错了` });
                          }
                        }
                      );
                    }
                  }
                  return 0;
                }

                //埋地雷
                if (mine_reg.test(req.body.message)) {
                  //获取该群是否已经达到最大共存地雷数
                  db.all(`SELECT * FROM mine WHERE group_id = '${req.body.group_id}'`, (err, sql) => {
                    if (!err) {
                      let length = 0;
                      try {
                        length = sql.length;
                      } catch (err) {
                        console.log(`地雷为空`.log);
                      }
                      if (length < max_mine_count) {
                        //地雷还没满，先获取自增ID最新值sql.seq，随后mine表增加群地雷
                        db.all(`Select seq From sqlite_sequence Where name = 'mine'`, (err, sql) => {
                          if (!err && sql[0]) {
                            db.run(`INSERT INTO mine VALUES('${sql[0].seq + 1}', '${req.body.group_id}', '${req.body.user_id}')`);
                            console.log(`${req.body.user_id} 在群 ${req.body.group_id} 埋了一颗地雷`.log);
                            res.send({
                              reply: `大伙注意啦！[CQ:at,qq=${req.body.user_id}]埋雷干坏事啦！`,
                            });
                          } else {
                            console.log(`埋地雷出错了：${err}，${sql}`.error);
                          }
                        });
                      } else {
                        console.log(`群 ${req.body.group_id} 的地雷满了`.log);
                        res.send({
                          reply: `[CQ:at,qq=${req.body.user_id}] 这个群的地雷已经塞满啦，等有幸运群友踩中地雷之后再来埋吧`,
                        });
                      }
                    } else {
                      console.log(`获取该群地雷出错了：${err}，${sql}`.error);
                    }
                  });
                  return 0;
                }

                //踩地雷
                if (fuck_mine_reg.test(req.body.message)) {
                  //搜索地雷库中现有地雷
                  db.all(`SELECT * FROM mine WHERE group_id = '${req.body.group_id}'`, (err, sql) => {
                    //有雷，直接炸，炸完删地雷
                    if (!err && sql[0]) {
                      let boom_time = Math.floor(Math.random() * 60 * 3) + 60; //造成伤害时间
                      request(
                        `http://127.0.0.1:5700/set_group_ban?group_id=${req.body.group_id}&user_id=${req.body.user_id}&duration=${boom_time}`,
                        function (error, _response, _body) {
                          if (!error) {
                            console.log(`${sql[0].placed_qq} 在群 ${sql[0].group_id} 埋的地雷被排爆，雷已经被删除`.log);
                            db.run(`DELETE FROM mine WHERE mine_id = '${sql[0].mine_id}' `);
                            res.send({
                              reply: `[CQ:at,qq=${req.body.user_id}] 踩了一脚地雷，为什么要想不开呢，被[CQ:at,qq=${sql[0].placed_qq}]所埋地雷炸成重伤，休养生息${boom_time}秒！`,
                            });
                          } else {
                            console.log("请求127.0.0.1:5700/set_group_whole_ban错误：", error);
                            res.send({ reply: `日忒娘，怎么又出错了` });
                          }
                        }
                      );
                    } else {
                      //没有雷
                      res.send({
                        reply: `[CQ:at,qq=${req.body.user_id}] 这个雷区里的雷似乎已经被勇士们排干净了，不如趁现在埋一个吧！`,
                      });
                    }
                  });
                  return 0;
                }

                //希望的花
                if (hope_flower_reg.test(req.body.message)) {
                  let who;
                  let boom_time = Math.floor(Math.random() * 60 * 9) + 60; //造成60-300伤害时间
                  if (req.body.message === "希望的花") {
                    console.log(`群 ${req.body.group_id} 的群员 ${req.body.user_id} 朝自己丢出一朵希望的花`.log);
                    res.send({ reply: `团长，你在做什么啊！团长！希望的花，不要乱丢啊啊啊啊` });
                    return 0;
                  } else {
                    who = req.body.message;
                    who = who.replace("希望的花 ", "");
                    who = who.replace("希望的花", "");
                    who = who.replace("[CQ:at,qq=", "");
                    who = who.replace("]", "");
                    who = who.trim();
                    if (is_qq_reg.test(who)) {
                      console.log(`群 ${req.body.group_id} 的 群员 ${req.body.user_id} 向 ${who} 丢出一朵希望的花`.log);
                    } else {
                      //目标不是qq号
                      res.send({ reply: `团长，你在做什么啊！团长！希望的花目标不可以是${who}，不要乱丢啊啊啊啊` });
                      return 0;
                    }
                  }

                  //先救活目标
                  request(
                    `http://127.0.0.1:5700/set_group_ban?group_id=${req.body.group_id}&user_id=${who}&duration=0`,
                    function (error, _response, _body) {
                      if (!error) {
                        console.log(`群 ${req.body.group_id} 的 群员 ${req.body.user_id} 救活了 ${who}`.log);
                        res.send({
                          reply: `团长，团长你在做什么啊团长，团长！为什么要救他啊，哼，呃，啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊！！！团长救活了[CQ:at,qq=${who}]，但自己被炸成重伤，休养生息${boom_time}秒！不要停下来啊！`,
                        });
                      } else {
                        console.log("请求127.0.0.1:5700/set_group_whole_ban错误：", error);
                        res.send({ reply: `日忒娘，怎么又出错了` });
                      }
                    }
                  );

                  //再禁言团长
                  request(
                    `http://127.0.0.1:5700/set_group_ban?group_id=${req.body.group_id}&user_id=${req.body.user_id}&duration=${boom_time}`,
                    function (error, _response, _body) {
                      if (!error) {
                        console.log(`${req.body.user_id} 自己被炸伤${boom_time}秒`.log);
                      } else {
                        console.log("请求127.0.0.1:5700/set_group_whole_ban错误：", error);
                        res.send({ reply: `日忒娘，怎么又出错了` });
                      }
                    }
                  );
                  return 0;
                }

                //击鼓传雷
                if (loop_bomb_reg.test(req.body.message)) {
                  //先检查群有没有开始游戏
                  db.all(`SELECT * FROM qq_group WHERE group_id = '${req.body.group_id}'`, (err, sql) => {
                    if (!err && sql[0]) {
                      //判断游戏开关 loop_bomb_enabled，没有开始的话就开始游戏
                      if (sql[0].loop_bomb_enabled === 0) {
                        //游戏开始
                        db.run(`UPDATE qq_group SET loop_bomb_enabled = '1' WHERE group_id ='${req.body.group_id}'`);
                        let text = "击鼓传雷游戏开始啦，这是一个只有死亡才能结束的游戏，做好准备了吗";
                        request(
                          `http://127.0.0.1:5700/send_group_msg?group_id=${req.body.group_id}&message=${encodeURI(text)}`,
                          function (error, _response, _body) {
                            if (!error) {
                              console.log(`群 ${req.body.group_id} 开始了击鼓传雷`.log);
                              io.emit("system message", `@群 ${req.body.group_id} 开始了击鼓传雷`);
                            } else {
                              console.log("请求127.0.0.1:5700/send_group_msg错误：", error);
                            }
                          }
                        );

                        //给发起人出题，等待ta回答
                        ECYWenDa()
                          .then((resolve) => {
                            let question = `那么[CQ:at,qq=${req.body.user_id}]请听题：${resolve.quest} 请告诉小夜：击鼓传雷 你的答案，时间剩余59秒`;
                            let answer = resolve.result; //把答案、目标人、开始时间存入数据库
                            db.run(
                              `UPDATE qq_group SET loop_bomb_answer = '${answer}', loop_bomb_onwer = '${
                                req.body.user_id
                              }' , loop_bomb_start_time = '${process.hrtime()[0]}' WHERE group_id ='${req.body.group_id}'`
                            );

                            //丢出问题
                            setTimeout(function () {
                              request(
                                `http://127.0.0.1:5700/send_group_msg?group_id=${req.body.group_id}&message=${encodeURI(question)}`,
                                function (error, _response, _body) {
                                  if (!error) {
                                    console.log(`群 ${req.body.group_id} 开始了击鼓传雷`.log);
                                    io.emit("system message", `@群 ${req.body.group_id} 开始了击鼓传雷`);
                                  } else {
                                    console.log("请求127.0.0.1:5700/send_group_msg错误：", error);
                                  }
                                }
                              );
                            }, 500);
                          })
                          .catch((reject) => {
                            res.send({ reply: `日忒娘，怎么又出错了：${reject}` });
                            console.log(`日忒娘，怎么又出错了：${reject}`.error);
                          });

                        //开始倒计时，倒计时结束宣布游戏结束
                        boom_timer = setTimeout(function () {
                          console.log(`群 ${req.body.group_id} 的击鼓传雷到达时间，炸了`.log);
                          let boom_time = Math.floor(Math.random() * 60 * 3) + 60; //造成伤害时间
                          //获取这个雷现在是谁手上，炸ta
                          db.all(`SELECT * FROM qq_group WHERE group_id = '${req.body.group_id}'`, (err, sql) => {
                            if (!err && sql[0]) {
                              request(
                                `http://127.0.0.1:5700/set_group_ban?group_id=${req.body.group_id}&user_id=${sql[0].loop_bomb_onwer}&duration=${boom_time}`,
                                function (error, _response, _body) {
                                  if (!error) {
                                    console.log(`${sql[0].loop_bomb_onwer} 在群 ${req.body.group_id} 回答超时，被炸伤${boom_time}秒`.log);
                                    let end = `时间到了，pia，雷在[CQ:at,qq=${sql[0].loop_bomb_onwer}]手上炸了，你被炸成重伤了，休养生息${boom_time}秒！游戏结束！下次加油噢`;
                                    request(
                                      `http://127.0.0.1:5700/send_group_msg?group_id=${req.body.group_id}&message=${encodeURI(end)}`,
                                      function (error, _response, _body) {
                                        if (!error) {
                                          io.emit(
                                            "system message",
                                            `@${sql[0].loop_bomb_onwer} 在群 ${req.body.group_id} 回答超时，被炸伤${boom_time}秒`
                                          );
                                        } else {
                                          console.log("请求127.0.0.1:5700/send_group_msg错误：", error);
                                        }
                                      }
                                    );
                                    //游戏结束，清空数据
                                    db.run(
                                      `UPDATE qq_group SET loop_bomb_enabled = '0', loop_bomb_answer = '', loop_bomb_onwer = '' , loop_bomb_start_time = '' WHERE group_id ='${req.body.group_id}'`
                                    );
                                    return 0;
                                  } else {
                                    console.log("请求127.0.0.1:5700/set_group_whole_ban错误：", error);
                                  }
                                }
                              );
                              io.emit("system message", `@群 ${req.body.group_id} 的击鼓传雷到达时间，炸了`);
                            }
                          });
                        }, 1000 * 60);

                        //已经开始游戏了，判断答案对不对
                      } else {
                        your_answer = req.body.message;
                        your_answer = your_answer.replace("击鼓传雷 ", "");
                        your_answer = your_answer.replace("击鼓传雷", "");
                        your_answer = your_answer.trim();
                        //从数据库里取答案判断
                        db.all(`SELECT * FROM qq_group WHERE group_id = '${req.body.group_id}'`, (err, sql) => {
                          if (!err && sql[0]) {
                            //判断答案 loop_bomb_answer、是否本人回答
                            if (sql[0].loop_bomb_answer == your_answer && sql[0].loop_bomb_onwer == req.body.user_id) {
                              //答对了
                              res.send({
                                reply: `[CQ:at,qq=${req.body.user_id}] 回答正确！答案确实是${sql[0].loop_bomb_answer}！`,
                              });

                              //答题成功，然后要把雷传给随机幸运群友，进入下一题
                              setTimeout(function () {
                                request(`http://127.0.0.1:5700/get_group_member_list?group_id=${req.body.group_id}`, (err, response, body) => {
                                  body = JSON.parse(body);
                                  if (!err && body.data.length != 0) {
                                    var rand_user_id = Math.floor(Math.random() * body.data.length);
                                    console.log(`随机选取一个群友：${body.data[rand_user_id].user_id}`.log);
                                    let rand_user = body.data[rand_user_id].user_id;

                                    //选完之后开始下一轮游戏，先查询剩余时间，然后给随机幸运群友出题，等待ta回答
                                    db.all(`SELECT * FROM qq_group WHERE group_id = '${req.body.group_id}'`, (err, sql) => {
                                      if (!err && sql[0]) {
                                        ECYWenDa()
                                          .then((resolve) => {
                                            let diff = 60 - process.hrtime([sql[0].loop_bomb_start_time, 0])[0]; //剩余时间
                                            let question = `抽到了幸运群友[CQ:at,qq=${rand_user}]！请听题：${resolve.quest} 请告诉小夜： 击鼓传雷 你的答案，时间还剩余${diff}秒`;
                                            let answer = resolve.result; //把答案、目标人存入数据库
                                            db.run(
                                              `UPDATE qq_group SET loop_bomb_answer = '${answer}', loop_bomb_onwer = '${rand_user}' WHERE group_id ='${req.body.group_id}'`
                                            );
                                            request(
                                              `http://127.0.0.1:5700/send_group_msg?group_id=${req.body.group_id}&message=${encodeURI(question)}`,
                                              function (error, _response, _body) {
                                                if (!error) {
                                                  console.log(`群 ${req.body.group_id} 开始了下一轮击鼓传雷`.log);
                                                  io.emit("system message", `@群 ${req.body.group_id} 开始了下一轮击鼓传雷`);
                                                } else {
                                                  console.log("请求127.0.0.1:5700/send_group_msg错误：", error);
                                                }
                                              }
                                            );
                                          })
                                          .catch((reject) => {
                                            res.send({ reply: `日忒娘，怎么又出错了：${reject}` });
                                            console.log(`日忒娘，怎么又出错了：${reject}`.error);
                                          });
                                      }
                                    });
                                  } else {
                                    console.log("随机选取一个群友错误。错误原因：" + JSON.stringify(response.body));
                                  }
                                  return 0;
                                });
                              }, 500);

                              //不是本人回答，来捣乱的
                            } else if (sql[0].loop_bomb_onwer != req.body.user_id) {
                              res.send({
                                reply: `[CQ:at,qq=${req.body.user_id}] 你是来捣乱的嘛，这个雷是[CQ:at,qq=${sql[0].loop_bomb_onwer}]的，不要抢答呀`,
                              });

                              //答错了
                            } else {
                              let boom_time = Math.floor(Math.random() * 60 * 3) + 60; //造成伤害时间
                              request(
                                `http://127.0.0.1:5700/set_group_ban?group_id=${req.body.group_id}&user_id=${req.body.user_id}&duration=${boom_time}`,
                                function (error, _response, _body) {
                                  if (!error) {
                                    console.log(`${req.body.user_id} 在群 ${req.body.group_id} 回答错误，被炸伤${boom_time}秒`.log);
                                    clearTimeout(boom_timer);
                                    res.send({
                                      reply: `[CQ:at,qq=${req.body.user_id}] 回答错误，好可惜，答案是${sql[0].loop_bomb_answer}，你被炸成重伤了，休养生息${boom_time}秒！游戏结束！下次加油噢`,
                                    });
                                  } else {
                                    console.log("请求127.0.0.1:5700/set_group_whole_ban错误：", error);
                                  }
                                }
                              );

                              //游戏结束，删掉游戏记录
                              db.run(
                                `UPDATE qq_group SET loop_bomb_enabled = '0', loop_bomb_answer = '', loop_bomb_onwer = '' , loop_bomb_start_time = '' WHERE group_id ='${req.body.group_id}'`
                              );
                              return 0;
                            }
                          }
                        });
                      }
                    }
                  });
                }

                //管理员功能：提醒停止服务的群启用小夜
                if (req.body.message === "/admin alert_open") {
                  for (let i in qq_admin_list) {
                    if (req.body.user_id == qq_admin_list[i]) {
                      console.log(`管理员启动了提醒任务`.log);
                      AlertOpen().then((resolve) => {
                        res.send({
                          reply: `管理员启动了提醒任务，开始提醒停止服务的群启用小夜……${resolve}`,
                        });
                      });
                    }
                    return 0;
                  }
                }

                /*                    要新增指令与功能请在这条分割线的上方添加，在下面添加有可能会导致冲突以及不可预料的异常                    */

                //随机抽风，丢一个骰子，按 chaos_probability 几率抽风
                let chaos_flag = Math.floor(Math.random() * 1000);
                if (chaos_flag < chaos_probability) {
                  //随机选一个群抽风
                  let prprmsg;
                  PrprDoge()
                    .then((resolve) => {
                      prprmsg = resolve;
                      RandomGroupList()
                        .then((resolve) => {
                          request(
                            "http://127.0.0.1:5700/send_group_msg?group_id=" + resolve + "&message=" + encodeURI(prprmsg),
                            function (error, _response, _body) {
                              if (!error) {
                                console.log(`qqBot小夜在群 ${resolve} 抽风了，发送了 ${prprmsg}`.log);
                                io.emit("system message", `@qqBot小夜在群 ${resolve} 抽风了，发送了 ${prprmsg}`);
                              } else {
                                console.log("请求127.0.0.1:5700/send_group_msg错误：", error);
                              }
                            }
                          );
                        })
                        .catch((reject) => {
                          console.log(reject.error);
                          res.send();
                        });
                    })
                    .catch((reject) => {
                      console.log(`随机舔狗错误：${reject}`.error);
                    });
                  return 0;
                }

                //丢一个骰子，按fudu_probability几率复读
                let fudu_flag = Math.floor(Math.random() * 100);
                if (fudu_flag < fudu_probability) {
                  console.log(`qqBot小夜复读 ${req.body.message}`.log);
                  io.emit("system message", `@qqBot小夜复读 ${req.body.message}`);
                  res.send({ reply: req.body.message });
                  return 0;
                }

                //丢一个骰子，按reply_probability几率回复
                let reply_flag = Math.floor(Math.random() * 100);
                //如果被@了，那么回复几率上升80%
                let at_replaced_msg = req.body.message; //要把[CQ:at,qq=1648468212] 去除掉，否则聊天核心会乱成一锅粥
                if (xiaoye_ated.test(req.body.message)) {
                  reply_flag -= 80;
                  at_replaced_msg = req.body.message.replace("[CQ:at,qq=1648468212] ", ""); //去除@小夜
                }
                //骰子命中，那就让小夜来自动回复
                if (reply_flag < reply_probability) {
                  ChatProcess(at_replaced_msg)
                    .then((resolve) => {
                      resolve = resolve.replace("&#91;name&#93;", `[CQ:at,qq=${req.body.user_id}]`); //替换[name]为正确的@
                      console.log(`qqBot小夜回复 ${resolve}`.log);
                      io.emit("system message", `@qqBot小夜回复：${resolve}`);
                      res.send({ reply: resolve });
                    })
                    .catch((reject) => {
                      //无匹配则随机回复balabala废话
                      GetBalabalaList()
                        .then((resolve) => {
                          let random_balabala = resolve[Math.floor(Math.random() * resolve.length)].balabala;
                          res.send({ reply: random_balabala });
                          io.emit("system message", `@qqBot小夜觉得${random_balabala}`);
                          console.log(`${reject}，qqBot小夜觉得${random_balabala}`.log);
                        })
                        .catch((reject) => {
                          console.log(`小夜试图balabala但出错了：${reject}`.error);
                          res.send({ reply: `小夜试图balabala但出错了：${reject}` });
                          io.emit("system message", `@qqBot小夜试图balabala但出错了：${reject}`);
                        });
                    });
                } else {
                  //res.send(); //相当于严格模式，如果有多条res.send将会报错
                }
              }
              //群不存在于qq_group表则写入qq_group表
            } else {
              console.log(`${req.body.group_id} 这个群不在qq_group表里，现在写入到qq_group表`.log);
              db.run(`INSERT INTO qq_group VALUES('${req.body.group_id}', '1', '0', '', '', '')`);
            }
          });
        }
        //私聊回复，现在已经关闭
      } else if (req.body.message_type === "private" && 1 === 0) {
        ChatProcess(req.body.message)
          .then((resolve) => {
            console.log(`qqBot小夜回复 ${resolve}`.log);
            io.emit("system message", `@qqBot小夜回复：${resolve}`);
            res.send({ reply: resolve });
          })
          .catch((reject) => {
            //无匹配则随机回复balabala废话
            GetBalabalaList()
              .then((resolve) => {
                let random_balabala = resolve[Math.floor(Math.random() * resolve.length)].balabala;
                res.send({ reply: random_balabala });
                io.emit("system message", `@qqBot小夜觉得${random_balabala}`);
                console.log(`${reject}，qqBot小夜觉得${random_balabala}`.log);
              })
              .catch((reject) => {
                console.log(`小夜试图balabala但出错了：${reject}`.error);
                res.send({ reply: `小夜试图balabala但出错了：${reject}` });
                io.emit("system message", `@qqBot小夜试图balabala但出错了：${reject}`);
              });
          });
      } else {
        res.send();
      }
    }
    //入群欢迎
    else if (req.body.notice_type === "group_increase") {
      let final = `[CQ:at,qq=${req.body.user_id}] 你好呀，我是本群RBQ担当小夜！小夜的使用说明书在这里 https://blog.giftia.moe/ 噢，请问主人是要先吃饭呢，还是先洗澡呢，还是先*我呢~`;
      request(
        "http://127.0.0.1:5700/send_group_msg?group_id=" + req.body.group_id + "&message=" + encodeURI(final),
        function (error, _response, _body) {
          if (!error) {
            console.log(`${req.body.user_id} 加入了群 ${req.body.group_id}，小夜欢迎了ta`.log);
          } else {
            console.log("请求127.0.0.1:5700/send_group_msg错误：", error);
          }
        }
      );
    } else {
      res.send();
    }
  });

  //每隔4小时搜索qq_group表，随机延时提醒停用服务的群启用服务
  setInterval(AlertOpen, 1000 * 60 * 60 * 4);
  //提醒张菊
  function AlertOpen() {
    return new Promise((resolve, _reject) => {
      db.all(`SELECT * FROM qq_group WHERE talk_enabled = 0`, (err, sql) => {
        if (!err && sql[0]) {
          let service_stoped_list = []; //停用服务的群列表
          for (let i in sql) {
            service_stoped_list.push(sql[i].group_id);
          }
          console.log(`以下群未启用小夜服务：${service_stoped_list} ，现在开始随机延时提醒`.log);
          DelayAlert(service_stoped_list);
          resolve(`以下群未启用小夜服务：${service_stoped_list} ，现在开始随机延时提醒`);
        } else {
          console.log(`目前没有群是关闭服务的，挺好`.log);
        }
      });
    });
  }
}

//直播间开关，星野夜蝶上线！
if (Now_On_Live) {
  setInterval(LoopDanmu, 5000);
}
//虚拟主播星野夜蝶核心代码，间隔5秒接收最新弹幕，如果弹幕更新了就开始处理，然后随机开嘴臭地图炮
function LoopDanmu() {
  GetLaststDanmu()
    .then((resolve) => {
      if (last_danmu_timeline === resolve.timeline) {
        //弹幕没有更新
        console.log(`弹幕暂未更新`.log);
        //丢一个骰子，如果命中了就开地图炮，1%的几率
        let ditupao_flag = Math.floor(Math.random() * 100);
        if (ditupao_flag < 1) {
          ChatProcess("").then((resolve) => {
            let reply = resolve;
            console.log(`小夜开地图炮了：${reply}`.log);
            //将直播小夜的回复写入txt，以便在直播姬显示
            fs.writeFileSync(`./static/xiaoye/live_lastst_reply.txt`, reply);
            //然后让小夜读出来
            BetterTTS(reply)
              .then((resolve) => {
                let tts_file = `${__dirname}\\static${resolve.file.replace("/", "\\")}`; //这里似乎有问题，ntfs短文件名无法转换
                voiceplayer.play(tts_file, function (err) {
                  if (err) throw err;
                });
              })
              .catch((reject) => {
                console.log(`TTS错误：${reject}`.error);
              });
          });
        }
      } else {
        console.log(`获取到最新弹幕：${resolve.text}`.log);
        last_danmu_timeline = resolve.timeline;
        io.emit("sysrem message", `@弹幕传来： ${resolve.text}`);

        //卧槽这么多传参怎么复用啊
        //教学系统，抄板于虹原翼版小夜v3
        if (teach_reg.test(resolve.text)) {
          let msg = resolve.text;
          msg = msg.replace(/'/g, "[非法字符]"); //防爆
          msg = msg.replace(/</g, "[非法字符]"); //防爆
          msg = msg.replace(/>/g, "[非法字符]"); //防爆
          msg = msg.substr(2).split("答：");
          if (msg.length !== 2) {
            console.log(`教学指令：分割有误，退出教学`.error);
            fs.writeFileSync(`./static/xiaoye/live_lastst_reply.txt`, `你教的姿势不对噢qwq`);
            BetterTTS("你教的姿势不对噢qwq")
              .then((resolve) => {
                let tts_file = `${__dirname}\\static${resolve.file.replace("/", "\\")}`;
                voiceplayer.play(tts_file, function (err) {
                  if (err) throw err;
                });
              })
              .catch((reject) => {
                console.log(`TTS错误：${reject}`.error);
              });
            return 0;
          }
          let ask = msg[0].trim(),
            ans = msg[1].trim();
          if (ask == "" || ans == "") {
            console.log(`问/答为空，退出教学`.error);
            fs.writeFileSync(`./static/xiaoye/live_lastst_reply.txt`, `你教的姿势不对噢qwq`);
            BetterTTS("你教的姿势不对噢qwq")
              .then((resolve) => {
                let tts_file = `${__dirname}\\static${resolve.file.replace("/", "\\")}`;
                voiceplayer.play(tts_file, function (err) {
                  if (err) throw err;
                });
              })
              .catch((reject) => {
                console.log(`TTS错误：${reject}`.error);
              });
            return 0;
          }
          if (ask.indexOf(/\r?\n/g) !== -1) {
            console.log(`教学指令：关键词换行了，退出教学`.error);
            fs.writeFileSync(`./static/xiaoye/live_lastst_reply.txt`, `关键词不能换行啦qwq`);
            BetterTTS("关键词不能换行啦qwq")
              .then((resolve) => {
                let tts_file = `${__dirname}\\static${resolve.file.replace("/", "\\")}`;
                voiceplayer.play(tts_file, function (err) {
                  if (err) throw err;
                });
              })
              .catch((reject) => {
                console.log(`TTS错误：${reject}`.error);
              });
            return 0;
          }
          console.log(`弹幕想要教给小夜：问：${ask} 答：${ans}，现在开始检测合法性`.log);
          for (let i in black_list_words) {
            if (
              ask.toLowerCase().indexOf(black_list_words[i].toLowerCase()) !== -1 ||
              ans.toLowerCase().indexOf(black_list_words[i].toLowerCase()) !== -1
            ) {
              console.log(`教学指令：检测到不允许的词：${black_list_words[i]}，退出教学`.error);
              fs.writeFileSync(`./static/xiaoye/live_lastst_reply.txt`, `你教的内容里有主人不允许小夜学习的词：${black_list_words[i]} qwq`);
              BetterTTS(`你教的内容里有主人不允许小夜学习的词：${black_list_words[i]} qwq`)
                .then((resolve) => {
                  let tts_file = `${__dirname}\\static${resolve.file.replace("/", "\\")}`;
                  voiceplayer.play(tts_file, function (err) {
                    if (err) throw err;
                  });
                })
                .catch((reject) => {
                  console.log(`TTS错误：${reject}`.error);
                });
              return 0;
            }
          }
          if (Buffer.from(ask).length < 4) {
            //关键词最低长度：4个英文或2个汉字
            console.log(`教学指令：关键词太短，退出教学`.error);
            fs.writeFileSync(`./static/xiaoye/live_lastst_reply.txt`, `关键词太短了啦qwq，至少要4个字节啦`);
            BetterTTS("关键词太短了啦qwq，至少要4个字节啦")
              .then((resolve) => {
                let tts_file = `${__dirname}\\static${resolve.file.replace("/", "\\")}`;
                voiceplayer.play(tts_file, function (err) {
                  if (err) throw err;
                });
              })
              .catch((reject) => {
                console.log(`TTS错误：${reject}`.error);
              });
            return 0;
          }
          if (ask.length > 100 || ans.length > 100) {
            console.log(`教学指令：教的太长了，退出教学`.error);
            fs.writeFileSync(`./static/xiaoye/live_lastst_reply.txt`, `你教的内容太长了，小夜要坏掉了qwq，不要呀`);
            BetterTTS("你教的内容太长了，小夜要坏掉了qwq，不要呀")
              .then((resolve) => {
                let tts_file = `${__dirname}\\static${resolve.file.replace("/", "\\")}`;
                voiceplayer.play(tts_file, function (err) {
                  if (err) throw err;
                });
              })
              .catch((reject) => {
                console.log(`TTS错误：${reject}`.error);
              });
            return 0;
          }
          //到这里都没有出错的话就视为没有问题，可以让小夜学了
          console.log(`教学指令：没有检测到问题，可以学习`.log);
          db.run(`INSERT INTO chat VALUES('${ask}', '${ans}')`);
          console.log(`教学指令：学习成功`.log);
          fs.writeFileSync(`./static/xiaoye/live_lastst_reply.txt`, `哇！小夜学会啦！对我说：${ask} 试试吧，小夜有可能会回复 ${ans} 噢`);
          BetterTTS(`哇！小夜学会啦！对我说：${ask} 试试吧，小夜有可能会回复 ${ans} 噢`)
            .then((resolve) => {
              let tts_file = `${__dirname}\\static${resolve.file.replace("/", "\\")}`;
              voiceplayer.play(tts_file, function (err) {
                if (err) throw err;
              });
            })
            .catch((reject) => {
              console.log(`TTS错误：${reject}`.error);
            });
          return 0;
        } else {
          ChatProcess(resolve.text)
            .then((resolve) => {
              let reply = resolve;
              console.log(`小夜说：${reply}`.log);
              fs.writeFileSync(`./static/xiaoye/live_lastst_reply.txt`, `${reply}`);
              BetterTTS(reply)
                .then((resolve) => {
                  let tts_file = `${__dirname}\\static${resolve.file.replace("/", "\\")}`;
                  voiceplayer.play(tts_file, function (err) {
                    if (err) throw err;
                  });
                })
                .catch((reject) => {
                  console.log(`TTS错误：${reject}`.error);
                });
            })
            .catch((reject) => {
              //如果没有匹配到回复，那就随机回复balabala废话
              console.log(`${reject}，弹幕没有匹配`.warn);
              GetBalabalaList()
                .then((resolve) => {
                  let random_balabala = resolve[Math.floor(Math.random() * resolve.length)].balabala;
                  fs.writeFileSync(`./static/xiaoye/live_lastst_reply.txt`, random_balabala);
                  BetterTTS(random_balabala)
                    .then((resolve) => {
                      let tts_file = `${__dirname}\\static${resolve.file.replace("/", "\\")}`;
                      voiceplayer.play(tts_file, function (err) {
                        if (err) throw err;
                      });
                    })
                    .catch((reject) => {
                      console.log(`TTS错误：${reject}`.error);
                    });
                  console.log(`${reject}，qqBot小夜觉得${random_balabala}`.log);
                })
                .catch((reject) => {
                  console.log(`小夜试图balabala但出错了：${reject}`.error);
                });
            });
        }
      }
    })
    .catch((reject) => {
      console.log(reject.error);
    });
}

/*
 *
 *下面是接口功能和实现
 *
 */

//更改个人资料接口
app.get("/profile", (req, res) => {
  db.run(`UPDATE users SET nickname = '${req.query.name}' WHERE CID ='${req.query.CID}'`);
  res.sendFile(__dirname + html);
});

//图片上传接口
app.post("/upload/image", upload.single("file"), function (req, _res, _next) {
  console.log(`用户上传图片：${req.file}`.log);
  let oldname = req.file.path;
  let newname = req.file.path + path.parse(req.file.originalname).ext;
  fs.renameSync(oldname, newname);
  io.emit("pic message", `/uploads/${req.file.filename}${path.parse(req.file.originalname).ext}`);
});

//文件/视频上传接口
app.post("/upload/file", upload.single("file"), function (req, _res, _next) {
  console.log(`用户上传文件：${req.file}`.log);
  let oldname = req.file.path;
  let newname = req.file.path + path.parse(req.file.originalname).ext;
  fs.renameSync(oldname, newname);
  let isVideo = new RegExp("^video*");
  let isAudio = new RegExp("^audio*");
  let file = { file: `/uploads/${req.file.filename}${path.parse(req.file.originalname).ext}`, filename: req.file.originalname };
  if (isVideo.test(req.file.mimetype)) {
    io.emit("video message", file);
  } else if (isAudio.test(req.file.mimetype)) {
    io.emit("audio message", file);
  } else {
    io.emit("file message", file);
  }
});

/*
 *
 *下面是工具类函数的实现
 *
 */

//年月日
function Curentyyyymmdd() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var yyyymmdd = year + "-";
  if (month < 10) yyyymmdd += "0";
  yyyymmdd += month + "-";
  if (day < 10) yyyymmdd += "0";
  yyyymmdd += day;
  return yyyymmdd;
}

//时分秒
function CurentTime() {
  var now = new Date();
  var hh = now.getHours();
  var mm = now.getMinutes();
  var ss = now.getSeconds();
  var clock = " ";
  if (hh < 10) clock += "0";
  clock += hh + ":";
  if (mm < 10) clock += "0";
  clock += mm + ":";
  if (ss < 10) clock += "0";
  clock += ss + " ";
  return clock;
}

//生成唯一文件名
function sha1(buf) {
  return crypto.createHash("sha1").update(buf).digest("hex");
}

//新闻
function Getnews() {
  return new Promise((resolve, reject) => {
    request("https://3g.163.com/touch/reconstruct/article/list/BBM54PGAwangning/0-10.html", (err, response, body) => {
      if (!err && response.statusCode === 200) {
        body = body.substring(9, body.length - 1);
        var content_news = "今日要闻：";
        var main = JSON.parse(body);
        var news = main.BBM54PGAwangning;
        for (let id = 0; id < 10; id++) {
          var print_id = id + 1;
          content_news += "\r\n" + print_id + "." + news[id].title + "a(" + news[id].url + ")[查看原文]";
        }
        resolve(content_news);
      } else {
        reject("获取新闻错误，这个问题雨女无瓜，是新闻接口的锅。错误原因：" + JSON.stringify(response.body));
      }
    });
  });
}

//获取用户信息
function GetUserData(msg) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM users WHERE CID = '" + msg + "'", (err, sql) => {
      if (!err && sql[0]) {
        let nickname = JSON.stringify(sql[0].nickname);
        let logintimes = JSON.stringify(sql[0].logintimes);
        let lastlogintime = JSON.stringify(sql[0].lastlogintime);
        resolve([nickname, logintimes, lastlogintime]);
      } else {
        reject("获取用户信息错误，一般是因为用户第一次登录。错误原因：" + err + ", sql:" + sql[0]);
      }
    });
  });
}

//更新登录次数
function UpdateLogintimes(msg) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE users SET logintimes = logintimes + 1 WHERE CID ='${msg}'`),
      (err, sql) => {
        if (!err && sql) {
          resolve(sql);
        } else {
          reject(err);
        }
      };
  });
}

//更新最后登陆时间
function UpdateLastLogintime(msg) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE users SET lastlogintime = '${Curentyyyymmdd()}${CurentTime()}' WHERE CID ='${msg}'`),
      (err, sql) => {
        if (!err && sql) {
          resolve(sql);
        } else {
          reject(err);
        }
      };
  });
}

//BV转AV
function Bv2Av(msg) {
  return new Promise((resolve, reject) => {
    request("https://api.bilibili.com/x/web-interface/view?bvid=" + msg, (err, response, body) => {
      body = JSON.parse(body);
      if (!err && response.statusCode === 200 && body.code === 0) {
        var content = "a(https://www.bilibili.com/video/av";
        var av = body.data;
        var av_number = av.aid;
        var av_title = av.title;
        content += av_number + ")[" + av_title + "，av" + av_number + "]";
        resolve(content);
      } else {
        reject("解析错误，是否输入了不正确的BV号？错误原因：" + JSON.stringify(response.body));
      }
    });
  });
}

//随机cos
function RandomCos() {
  return new Promise((resolve, reject) => {
    var rand_page_num = Math.floor(Math.random() * cos_total_count);
    request(
      "https://api.vc.bilibili.com/link_draw/v2/Photo/list?category=cos&type=hot&page_num=" + rand_page_num + "&page_size=1",
      (err, response, body) => {
        body = JSON.parse(body);
        if (!err && response.statusCode === 200 && body.code === 0 && body.data.total_count != 0) {
          cos_total_count = body.data.total_count;
          try {
            var obj = body.data.items[0].item.pictures; //经常出现某个item里没有图片的毛病，阿B你在干什么啊
          } catch (err) {
            reject("获取随机cos错误，是B站的锅。这个item里又双草没有图片，阿B你在干什么啊。错误原因：" + JSON.stringify(response.body));
            return 0;
          }
          var count = Object.keys(obj).length;
          var picUrl = obj[Math.floor(Math.random() * count)].img_src;
          console.log(`cos总数：${cos_total_count}页，当前选择：${rand_page_num}页，发送图片：${picUrl}`.log);
          request(picUrl).pipe(
            fs.createWriteStream(`./static/images/${picUrl.split("/").pop()}`).on("close", (_err) => {
              resolve(`/images/${picUrl.split("/").pop()}`);
            })
          ); //绕过防盗链，保存为本地图片
        } else {
          reject("获取随机cos错误，是B站的锅。错误原因：" + JSON.stringify(response.body));
        }
      }
    );
  });
}

//随机买家秀
function RandomTbshow() {
  return new Promise((resolve, reject) => {
    request(`https://api.sumt.cn/api/rand.tbimg.php?token=${sumtkey}&format=json`, (err, response, body) => {
      body = JSON.parse(body);
      if (!err && body.code === 200) {
        let picUrl = body.pic_url;
        request(picUrl).pipe(
          fs.createWriteStream(`./static/images/${picUrl.split("/").pop()}`).on("close", (_err) => {
            console.log(`保存了珍贵的随机买家秀：${picUrl}，然后再给用户`.log);
          })
        ); //来之不易啊，保存为本地图片
        resolve(body.pic_url); //但是不给本地地址，还是给的源地址，这样节省带宽
      } else {
        reject("随机买家秀错误，是卡特实验室接口的锅。错误原因：" + JSON.stringify(response.body));
      }
    });
  });
}

//随机二次元图，旧接口 https://acg.yanwz.cn/api.php 已弃用
function RandomECY() {
  return new Promise((resolve, reject) => {
    request(`https://api.sumt.cn/api/rand.acg.php?token=${sumtkey}&type=%E4%BA%8C%E6%AC%A1%E5%85%83&format=json`, (err, response, body) => {
      body = JSON.parse(body);
      if (!err && body.code === 200) {
        let picUrl = body.pic_url;
        request(picUrl).pipe(
          fs.createWriteStream(`./static/images/${picUrl.split("/").pop()}`).on("close", (_err) => {
            console.log(`保存了好康的二次元图：${picUrl}，然后再给用户`.log);
          })
        ); //来之不易啊，保存为本地图片
        resolve(body.pic_url); //但是不给本地地址，还是给的源地址，这样节省带宽
      } else {
        reject("随机二次元图错误，是卡特实验室接口的锅。错误原因：" + JSON.stringify(response.body));
      }
    });
  });
}

//随机冷知识
function RandomHomeword() {
  return new Promise((resolve, reject) => {
    request("https://passport.csdn.net/v1/api/get/homeword", (err, response, body) => {
      body = JSON.parse(body);
      if (!err) {
        var title = "<h2>" + body.data.title + "</h2>";
        var content = body.data.content;
        var count = body.data.count;
        resolve(title + content + "\r\n—— 有" + count + "人陪你一起已读");
      } else {
        reject("获取随机冷知识错误，这个问题雨女无瓜，是CSDN接口的锅。错误原因：" + JSON.stringify(response.body));
      }
    });
  });
}

//自动随机昵称
function RandomNickname() {
  return new Promise((resolve, reject) => {
    request(`http://api.tianapi.com/txapi/cname/index?key=${Tiankey}`, (err, response, body) => {
      body = JSON.parse(body);
      if (!err) {
        resolve(body.newslist[0].naming);
      } else {
        reject("获取随机昵称错误，是天行接口的锅。错误原因：" + JSON.stringify(response.body));
      }
    });
  });
}

//舔狗回复
function PrprDoge() {
  return new Promise((resolve, reject) => {
    request(`http://api.tianapi.com/txapi/tiangou/index?key=${Tiankey}`, (err, response, body) => {
      body = JSON.parse(body);
      if (!err) {
        resolve(body.newslist[0].content);
      } else {
        reject("舔狗错误，是天行接口的锅。错误原因：" + JSON.stringify(response.body));
      }
    });
  });
}

//读取配置文件 config.json
function ReadConfig() {
  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/config/config.json`, "utf-8", function (err, data) {
      if (!err) {
        resolve(JSON.parse(data));
      } else {
        reject("读取配置文件错误。错误原因：" + err);
      }
    });
  });
}

//聊天处理，最核心区块，超智能(智障)的聊天算法：先整句搜索，再模糊搜索，没有的话再分词模糊搜索
async function ChatProcess(msg) {
  const result_1 = await new Promise((resolve, _reject) => {
    console.log("开始整句搜索".log);
    db.all("SELECT * FROM chat WHERE ask = '" + msg + "'", (e, sql_1) => {
      if (!e && sql_1.length > 0) {
        console.log(`对于整句:  ${msg} ，匹配到 ${sql_1.length} 条回复`.log);
        let ans = Math.floor(Math.random() * sql_1.length);
        let answer = JSON.stringify(sql_1[ans].answer);
        answer = answer.replace(/"/g, "");
        console.log(`随机选取第${ans + 1}条回复：${answer}`.log);
        resolve(answer);
      } else {
        console.log(`聊天数据库中没有匹配到整句 ${msg} 的回复，开始模糊搜索`.log);
        resolve();
      }
    });
  });
  const result_2 = await new Promise((resolve_1, _reject_1) => {
    console.log("开始模糊搜索".log);
    db.all("SELECT * FROM chat WHERE ask LIKE '%" + msg + "%'", (e, sql_2) => {
      if (!e && sql_2.length > 0) {
        console.log(`模糊搜索: ${msg} ，匹配到 ${sql_2.length} 条回复`.log);
        let ans = Math.floor(Math.random() * sql_2.length);
        let answer = JSON.stringify(sql_2[ans].answer);
        answer = answer.replace(/"/g, "");
        console.log(`随机选取第${ans + 1}条回复：${answer}`.log);
        resolve_1(`${answer}`);
      } else {
        console.log(`聊天数据库中没有匹配到 ${msg} 的模糊回复，开始分词搜索`.log);
        resolve_1();
      }
    });
  });
  return await new Promise((resolve_2, reject_2) => {
    if (result_1) {
      //优先回复整句匹配
      resolve_2(result_1);
    } else if (result_2) {
      //其次是模糊匹配
      resolve_2(result_2);
    } else {
      //都没有匹配，进行分词模糊搜索
      console.log("开始分词搜索".log);
      msg = msg.replace("/", "");
      msg = jieba.extract(msg, topN); //按权重分词
      console.log(`分词出关键词：`.log);
      console.log(msg);
      if (msg.length == 0) {
        reject_2(`不能分词，可能是语句无含义`.warn);
      } else if (msg.length == 1) {
        //如果就分词出一个关键词，那么可以加入一些噪声词以提高对话智能性，避免太单调
        console.log("只有一个关键词，添加噪声词".log);
        //若下面的噪声词为空，那么会从词库里随机取回复
        msg.push({ word: "" });
        console.log(`分词出最终关键词：`.log);
        console.log(msg);
      }
      let rand_word_num = Math.floor(Math.random() * msg.length);
      console.log(`随机选择第 ${rand_word_num + 1} 个关键词 ${msg[rand_word_num].word} 来回复`.log);
      db.all("SELECT * FROM chat WHERE ask LIKE '%" + msg[rand_word_num].word + "%'", (e_1, sql_2) => {
        if (!e_1 && sql_2.length > 0) {
          console.log(`对于关键词:  ${msg[rand_word_num].word} ，匹配到 ${sql_2.length} 条回复`.log);
          let ans_1 = Math.floor(Math.random() * sql_2.length);
          let answer_1 = JSON.stringify(sql_2[ans_1].answer);
          answer_1 = answer_1.replace(/"/g, "");
          console.log(`随机选取第 ${ans_1 + 1} 条回复：${answer_1}`.log);
          resolve_2(answer_1);
        } else {
          reject_2(`聊天数据库中没有匹配到 ${msg[rand_word_num].word} 的回复`);
        }
      });
    }
  });
}

//保存qq侧传来的图
function SaveQQimg(imgUrl) {
  return new Promise((resolve, reject) => {
    request(imgUrl[0]).pipe(
      fs.createWriteStream(`./static/xiaoye/images/${imgUrl[0].split("/")[imgUrl[0].split("/").length - 2]}.jpg`).on("close", (err) => {
        if (!err) {
          resolve(`/xiaoye/images/${imgUrl[0].split("/")[imgUrl[0].split("/").length - 2]}.jpg`);
        } else {
          reject("保存qq侧传来的图错误。错误原因：" + err);
        }
      })
    );
  });
}

//随机选取一个群
function RandomGroupList() {
  return new Promise((resolve, reject) => {
    request("http://127.0.0.1:5700/get_group_list", (err, response, body) => {
      body = JSON.parse(body);
      if (!err && body.data.length != 0) {
        var rand_group_num = Math.floor(Math.random() * body.data.length);
        console.log("随机选取一个群：", body.data[rand_group_num].group_id);
        resolve(body.data[rand_group_num].group_id);
      } else {
        reject("随机选取一个群错误。错误原因：" + JSON.stringify(response.body));
      }
    });
  });
}

//获取balabala
function GetBalabalaList() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM balabala;", (err, sql) => {
      if (!err && sql[0]) {
        let balabala = sql;
        resolve(balabala);
      } else {
        reject("获取balabala错误。错误原因：" + err + ", sql:" + sql);
      }
    });
  });
}

//语音合成TTS
function TTS(tex) {
  return new Promise((resolve, reject) => {
    if (!tex) tex = "你好谢谢小笼包再见!";
    SpeechClient.text2audio(tex, {
      spd: 5, //1-9  语速,正常语速为5
      pit: 8, //1-9  语调,正常语调为5
      per: 4, //1-12 声线,1=2:普通男性,3:有情感的播音男性,4:有情感的萝莉声线-度丫丫;5:普通女性,6:抑扬顿挫有情感的讲故事男性(纪录频道),7:有情感的广东话女性,8:语气平淡的念诗男性(葛平),9:速读普通男性,10:略有情感的刚成年男性,11:刺耳而略有情感的讲故事男性(情感强度比6弱),12:温柔的有情感的讲故事女性,1-12以外的数值会被转为12
    }).then(
      function (result) {
        if (result.data) {
          console.log(`${tex} 的语音合成成功`.log);
          fs.writeFileSync(`./static/xiaoye/tts/${sha1(result.data)}.mp3`, result.data);
          let file = { file: `/xiaoye/tts/${sha1(result.data)}.mp3`, filename: "小夜语音回复" };
          resolve(file);
        } else {
          // 合成服务发生错误
          console.log(`语音合成失败：${JSON.stringify(result)}`.error);
          reject("语音合成TTS错误：", JSON.stringify(result));
        }
      },
      function (err) {
        console.log(err.error);
        reject("语音合成TTS错误：", err);
      }
    );
  });
}

//扒的百度臻品音库-度米朵
function BetterTTS(tex) {
  return new Promise((resolve, reject) => {
    if (!tex) tex = "你好谢谢小笼包再见!";
    request("https://ai.baidu.com/aidemo?type=tns&per=4103&spd=6&pit=10&vol=10&aue=6&tex=" + encodeURI(tex), (err, _response, body) => {
      body = JSON.parse(body);
      if (!err && body.data) {
        console.log(`${tex} 的幼女版语音合成成功`.log);
        let base64Data = body.data.replace(/^data:audio\/x-mpeg;base64,/, "");
        let dataBuffer = Buffer.from(base64Data, "base64");
        fs.writeFileSync(`./static/xiaoye/tts/${sha1(dataBuffer)}.mp3`, dataBuffer);
        let file = { file: `/xiaoye/tts/${sha1(dataBuffer)}.mp3`, filename: "小夜幼女版语音回复" };
        resolve(file);
      } else {
        //估计被发现扒接口了
        console.log(`语音合成幼女版失败：${JSON.stringify(body)}`.error);
        reject("语音合成幼女版TTS错误：", JSON.stringify(body));
      }
    });
  });
}

//获取最新直播间弹幕
function GetLaststDanmu() {
  return new Promise((resolve, reject) => {
    request(`https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory?roomid=${blive_room_id}`, (err, response, body) => {
      if (!err) {
        body = JSON.parse(body); //居然返回的是字符串而不是json
        resolve({ text: body.data.room[body.data.room.length - 1].text, timeline: body.data.room[body.data.room.length - 1].timeline });
      } else {
        reject(err, response);
      }
    });
  });
}

//随机延时提醒闭菊的群
function DelayAlert(service_stoped_list) {
  let alert_msg = [
    //提醒文本列表
    "呜呜呜，把人家冷落了那么久，能不能让小夜张菊了呢...",
    "闭菊那么久了，朕的菊花痒了！还不快让小夜张菊！",
    "小夜也想为大家带来快乐，所以让小夜张菊，好吗？",
    "欧尼酱，不要再无视我了，小夜那里很舒服的，让小夜张菊试试吧~",
  ];
  for (let i in service_stoped_list) {
    let delay_time = Math.floor(Math.random() * 60); //随机延时0到60秒
    let random_alert_msg = alert_msg[Math.floor(Math.random() * alert_msg.length)];
    console.log(`qqBot小夜将会延时 ${delay_time} 秒后提醒群 ${service_stoped_list[i]} 张菊，提醒文本为：${random_alert_msg}`.log);
    setTimeout(function () {
      request(
        `http://127.0.0.1:5700/send_group_msg?group_id=${service_stoped_list[i]}&message=${encodeURI(random_alert_msg)}`,
        function (error, _response, _body) {
          if (!error) {
            console.log(`qqBot小夜提醒了群 ${service_stoped_list[i]} 张菊，提醒文本为：${random_alert_msg}`.log);
          } else {
            console.log("请求127.0.0.1:5700/send_group_msg错误：", error);
          }
        }
      );
    }, 1000 * delay_time);
  }
}

//问答题库
function WenDa() {
  return new Promise((resolve, reject) => {
    request(`http://api.tianapi.com/txapi/wenda/index?key=${Tiankey}`, (err, response, body) => {
      body = JSON.parse(body);
      if (!err) {
        resolve({ quest: body.newslist[0].quest, result: body.newslist[0].result });
      } else {
        reject("问答错误，是天行接口的锅。错误原因：" + JSON.stringify(response.body));
      }
    });
  });
}

//台词问答题库
function ECYWenDa() {
  return new Promise((resolve, reject) => {
    request(`https://api.oddfar.com/yl/q.php?c=2001&encode=json`, (err, response, body) => {
      body = JSON.parse(body);
      if (!err) {
        msg = jieba.extract(body.text, topN); //按权重分词
        let rand_word_num = Math.floor(Math.random() * msg.length);
        let answer = msg[rand_word_num].word;
        console.log(`原句为：${body.text}，随机切去第 ${rand_word_num + 1} 个关键词 ${answer} 作为答案`.log);
        let ans_start = answer.indexOf(answer); //取答案开始
        let ans_end = answer.indexOf(answer.length); //取答案结束
        let tex_top = answer.substr(0, ans_start); //取除了答案外的字符串头
        let tex_bottom = answer.substr(ans_end + 1); //取除了答案外的字符串尾
        resolve({ quest: `${tex_top}________${tex_bottom}`, result: answer });
      } else {
        reject("问答错误，是接口的锅。错误原因：" + JSON.stringify(response.body));
      }
    });
  });
}

//ロクでなし魔術講師と禁忌教典
