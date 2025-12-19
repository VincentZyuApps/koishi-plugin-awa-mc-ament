// index.ts
import { Context, Schema, Session, h } from 'koishi'
import { readFileSync } from 'fs';
import path from 'node:path';
import { renderAmentImage } from './generate_image'
import { readFile } from 'fs/promises';
import { validateFonts } from './utils';

export const name = 'koishi=plugin-qwq-mc-ament'

export const inject = {
  required: ["puppeteer", "http", "i18n"]
}

const pkg = JSON.parse(
  readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8')
)

// Minecaft游戏图标 > 引用消息的图片 > 参数传入的图片 > at用户的头像 > 默认fallback幸运方块图标
export const usage = `
<h1>🎮 Koishi 插件：awa-mc-ament - Minecraft 成就生成器</h1>
<h2>🎯 插件版本：v${pkg.version}</h2>
<p>插件使用问题 / Bug反馈 / 插件开发交流，欢迎加入QQ群：<b>259248174</b></p>
<p>📖 <a href="https://gitee.com/vincent-zyu/koishi-plugin-awa-mc-ament" target="_blank">【点我跳转到 Gitee 查看带图片的完整 README】</a></p>

<hr>

<h2>✨ 功能概述</h2>
<p>生成 Minecraft 风格的成就/进度图片，支持自定义标题、描述和图标。</p>

<hr>

<h2>🔍 图标获取优先级</h2>
<p>本插件会按照以下优先级自动选择图标来源：</p>
<ol>
  <li>🎮 <b>Minecraft 游戏图标</b>（需要启用<a href="https://gitee.com/vincent-zyu/fastapi-awa-fuzzy-search-backend" target="_blank">Pytorch后端服务</a>）</li>
  <li>💬 <b>引用消息的图片</b></li>
  <li>🖼️ <b>参数传入的图片</b></li>
  <li>👤 <b>@用户的头像</b></li>
  <li>🎲 <b>默认幸运方块图标</b>（fallback）</li>
</ol>

<hr>

<h2>📝 使用示例</h2>
<ul>
  <li>
    <code>ament -t 标题 -d 介绍 --mcicon 钻石</code><br>
    → 借助 PyTorch+FastAPI 后端，进行语义相似度检测，选出 Minecraft 图片文件作为 icon
  </li>
  <br>
  <li>
    <code>【先引用一条消息】 ament -t 标题 -d 介绍</code><br>
    → 使用引用消息的第一张图片作为 icon
  </li>
  <br>
  <li>
    <code>ament -t 标题 -d 介绍 --icon [图片]</code><br>
    → 使用传入的 icon 图片参数作为 icon
  </li>
  <br>
  <li>
    <code>ament -t 标题 -d 介绍 @某人</code><br>
    → 使用 session 消息中第一个艾特元素的用户头像作为 icon
  </li>
  <br>
  <li>
    <code>ament -t 标题 -d 介绍</code><br>
    → fallback 到默认准备好的幸运方块问号 icon
  </li>
</ul>

<hr>

<h2>⚙️ MC 图标后端（可选）</h2>
<p>如需使用 <code>--mcicon</code> 参数进行 Minecraft 游戏图标搜索，请：</p>
<ol>
  <li>启用配置项中的 "启用MC图标后端服务"</li>
  <li>自行部署 PyTorch+FastAPI 后端服务</li>
  <li>
    后端项目地址：<br>
    <a href="https://gitee.com/vincent-zyu/fastapi-awa-fuzzy-search-backend" target="_blank">
      【点我跳转】https://gitee.com/vincent-zyu/fastapi-awa-fuzzy-search-backend
    </a>
  </li>
</ol>

<hr>

<h3>📜 许可声明</h3>
<p>本插件为开源免费项目，基于 MIT 协议开放。欢迎修改、分发与二次开发。</p>
`

// export interface Config { }

export const Config = Schema.intersect(
  [
    Schema.object(
      {
        banAtUserArg: Schema.boolean().default(false).experimental()
          .description("🚫 是否禁止使用at用户作为成就图标来源 </br> <i> (qq官机得打开这个，因为官机必须艾特bot才能用指令...) </i> "),
      }
    ).description("⚙️ Args-参数相关"),
    Schema.object(
      {
        fontPath: Schema.string().default(path.join(__dirname, './../assets/MinecraftAE.ttf')).role('textarea', { rows: [2, 5] })
          .description("🔤 字体文件绝对路径"),
        bgPath: Schema.string().default(path.join(__dirname, './../assets/AdvancementMade_BG.png')).role('textarea', { rows: [2, 5] })
          .description("🖼️ 背景图绝对路径"),
      }
    ).description("📦 Assets-静态资源资产相关"),
    Schema.object(
      {
        browserScreenshotquality: Schema.number().role('slider').min(0).max(100).step(1).default(60)
          .description("📸 Puppeteer截图质量参数，图片压缩质量, 范围0-100"),
        browserScreenshotFormat: Schema.union([
          Schema.const('jpeg').description('JPEG - 有损压缩，文件小'),
          Schema.const('png').description('PNG - 无损压缩，支持透明'),
          Schema.const('webp').description('WebP - 现代格式，兼顾质量与体积'),
        ]).default('jpeg').role('radio')
          .description("🖼️ 截图输出格式")
      }
    ).description("🌐 PuppeteerConfig-浏览器配置相关"),
    Schema.object(
      {
        enableMciconBackend: Schema.boolean().default(false).experimental()
          .description("🎮 <b>(可选)</b>是否启用MC图标后端服务。启用本选项 会给ament指令增加一个--icon参数，例如：--icon diamond <br/> <i> 需要自行部署一个PyTorch+FastAPI后端: https://gitee.com/vincent-zyu/fastapi-awa-fuzzy-search-backend </i>  "),
        mciconBackendAddres: Schema.string().default('http://192.168.31.233:8989')
          .description("🔗 mc图标后端地址，完整URL（包含 http:// 或 https://）"),
      }
    ).description("🎯 MCICON-后端服务相关"),
    Schema.object(
      {
        VerboseLoggerMode: Schema.boolean().default(false)
          .description("🔍 是否开启详细输出")
      }
    ).description("🐛 DebugConfig-调试内容相关")
  ]
)

export function apply(ctx: Context, config) {
  // 验证并下载字体文件
  validateFonts(ctx);

  // ctx.command('ament [arg0_title:string] [arg1_description:string]')
  // .action(async ({ session, options }, arg0_title, arg1_description) => {
  const amentCommand = ctx.command(
    'ament', 
    "生成MC风格的成就/进度图片\n" +
    "\t【注意图标获取的优先级】：Minecaft游戏图标 > 引用消息的图片 > 参数传入的图片 > at用户的头像 > 默认fallback幸运方块图标。【没说明白就去看source code】\n"
  )
    // .subcommand("help")
    .option("arg0_title", '-t, --title <arg0_title:string> 成就标题', { fallback: "请输入标题" })
    .option("arg1_description", '-d, --description <arg1_description:string> 成就描述', { fallback: "请输入描述" })
    .option("arg2_icon", '-i, --icon <arg2_icon:image> 成就图标')

  // 根据配置决定是否注册 mcicon option
  if (config.enableMciconBackend) {
    amentCommand.option("arg3_mcicon", '-m, --mcicon <arg3_mcicon:string> Minecraft游戏图标搜索关键词')
  }

  amentCommand.action(
    async (
      { session, options }: 
      { session: Session, options: { arg0_title: string, arg1_description: string, arg2_icon?: any, arg3_mcicon?: string } }
      // 所以arg2_icon的类型是什么哦🤔
    ) => {

      const fallback_img_path = path.join(__dirname, './../assets/fallback_icon.jpg');
      const fallback_base64_str = readFileSync(fallback_img_path).toString('base64');
      const fallback_base64_str_with_head = `data:image/jpeg;base64,${fallback_base64_str}`;

      // icon优先级：Minecaft游戏图标 > 引用消息的图片 > 参数传入的图片 > at用户的头像 > 默认fallback幸运方块图标
      // "MCICON" > "QUOTEMSG" > "CMDARG" > "ATUSER" > "LUCKYBLOCK"

      let iconSource = "LUCKYBLOCK";
      const firstAtUser = extractAtUser(session.content);
      if (config.VerboseLoggerMode)
        ctx.logger.info("fitstAtUser = " + firstAtUser);

      if ('id' in firstAtUser && !config.banAtUserArg)
        iconSource = "ATUSER";
      if (options.arg2_icon)
        iconSource = "CMDARG";
      if (session.quote) {
        const firstImgUrl = await extractFirstImageUrl(session.quote.content);
        if (firstImgUrl !== "")
          iconSource = "QUOTEMSG"
      }
      if (options.arg3_mcicon)
        iconSource = "MCICON";

      let icon_format;
      let ament_icon_image_element; //可能是一个url，也可能是一个base64字符串, 总之是一个支持作为消息元素的格式
      if (iconSource === "MCICON") {
        icon_format = "url";

        const bestItem = await getBestFuzzySearchRes(ctx, options.arg3_mcicon);
        ctx.logger.info(`options.arg3_mcicon = ${options.arg3_mcicon}`);
        if (bestItem.isSucceed === false) {
          await session.send(`获取Minecraft图标有问题哦, msg=${bestItem.res}, res=${bestItem.res}`);
          return;
        }
        ctx.logger.info(JSON.stringify(bestItem.res));
        // ament_icon_image_element = `http://localhost:8989/mcimg/${bestItem.res.name.toString().replace(/\\/g, "/")}`;
        ament_icon_image_element = `${config.mciconBackendAddres}/mcimg/${bestItem.res.name.toString().replace(/\\/g, "/")}`;


      } else if (iconSource === "QUOTEMSG") { //引用是url
        icon_format = "url";
        ament_icon_image_element = await extractFirstImageUrl(session.quote.content);
      } else if (iconSource === "CMDARG") { //指令里面的参数是url
        icon_format = "url";
        ament_icon_image_element = options.arg2_icon.src;
      } else if (iconSource === "ATUSER") { //at 用户是url
        icon_format = "url";
        const firstUserDict = extractAtUser(session.content);
        ament_icon_image_element = (await session.bot.getUser(firstUserDict['id'], session.event.guild.id)).avatar;
      } else if (iconSource === "LUCKYBLOCK") { //静态资源幸运方块是base64
        icon_format = "base64";
        ament_icon_image_element = fallback_base64_str_with_head;
      }

      let args_msg = "🛠️[debug]\n";
      args_msg += `📝[options.arg0_title] = ${options.arg0_title}\n`;
      args_msg += `📖[options.arg1_description] = ${options.arg1_description}\n`;
      args_msg += `🎨[options.arg2_icon] = ${String(options.arg2_icon).slice(0.100)}\n`;
      args_msg += `🖼️[options.arg3_mcicon] = ${options.arg3_mcicon}\n`;
      args_msg += "\n"
      args_msg += `[iconSource] = ${iconSource}`
      args_msg += `[icon_format] = ${icon_format}\n`
      args_msg += `[ament_icon_image_element](raw) = ${ament_icon_image_element.slice(0, 100)}\n`;
      args_msg += "\n---------\n"
      args_msg += `🅰️[config.fontpath] = ${config.fontPath}\n`;
      args_msg += `🌌[config.bgpath] = ${config.bgPath}\n`;

      let ament_icon_base64;
      if (icon_format === "base64") {
        ament_icon_base64 = fallback_base64_str;
      } else if (icon_format === "url") {
        const ament_icon_buffer = await ctx.http.file(ament_icon_image_element);
        ament_icon_base64 = Buffer.from(ament_icon_buffer.data).toString('base64');
      }
      args_msg += `ament_icon_base64 = ${String(ament_icon_base64).slice(0, 50)}`;

      if (config.VerboseLoggerMode) {
        await session.send(
          args_msg +
          `\nament_icon_image_element(image) = ` +
          h.image(ament_icon_image_element)
        );
      }
      logInfo(args_msg);


      const font_base64 = await fileToBase64(config.fontPath);
      const bg_base64 = await fileToBase64(config.bgPath);

      const res = await renderAmentImage(
        ctx,
        {
          title: options.arg0_title,
          description: options.arg1_description,
          icon: ament_icon_base64,
          iconMode: 'base64',
          width: 320,
          height: 64,
          // fontPath: path.join(ctx.baseDir, 'assets', 'Minecraft_AE.ttf'),
          // bgPath: path.join(ctx.baseDir, 'assets', 'AdvancementMade_BG.png')
          fontBase64: font_base64,
          bgBase64: bg_base64,
          page_screenshotquality: config.browserScreenshotquality,
          page_screenshotformat: config.browserScreenshotFormat
        }
      )

      // await session.send(h.image(res));
      // await session.send(`[debug] res:${res.slice(0, 50)}`);
      const mimeType = config.browserScreenshotFormat === 'png' ? 'image/png' 
        : config.browserScreenshotFormat === 'webp' ? 'image/webp' 
        : 'image/jpeg';
      await session.send(
        h(
          'image',
          { url: `data:${mimeType};base64,` + res }
        )
      )
    })

  function logInfo(...args: any[]) {
    (ctx.logger.info as (...args: any[]) => void)(...args);
  }

  const extractImageUrl = (content) => {
    let urls = h.select(content, 'img').map(item => item.attrs.src);
    if (urls?.length > 0) {
      return urls;
    }
    urls = h.select(content, 'mface').map(item => item.attrs.url);
    return urls?.length > 0 ? urls : null;
  };

  async function fileToBase64(filePath: string): Promise<string> {
    try {
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, filePath);
      const buffer = await readFile(absolutePath);
      return buffer.toString('base64');
    } catch (error) {
      ctx.logger.error(`文件转换成base64失败: ${error.message}`);
      throw error;
    }
  }

  const extractFirstImageUrl = async (content) => {
    if (!content) {
      // throw Error('content是空的');
      return "";
    }

    try {
      logInfo("extractFirstImageUrl content:", content);

      let elementContent = content;
      if (typeof content === 'string') {
        elementContent = h.parse(`${content}`); // 确保 content 被解析为 Element
      }

      let url = '';

      const imgElements = h.select(elementContent, 'img, image, mface');
      if (imgElements.length > 0) {
        const firstElement = imgElements[0];
        url = firstElement.attrs?.src || firstElement.attrs?.url || ''; // 优先取 src，然后取 url
      }

      logInfo("extractFirstImageUrl解析结果：", url);
      return url;
    } catch (error) {
      ctx.logger.error("extractFirstImageUrl error:", error);
      // throw Error("有错误:" + error);
      return ''; // 发生错误时返回空字符串，避免程序崩溃
    }
  };

  const extractAtUser = (content) => {
    if (!content) {
      // throw Error('content是空的');
      return "";
    }
    try {
      if (config.VerboseLoggerMode)
        logInfo("extractextractAtUser content:", content);

      let elementContent = content;
      if (typeof content === 'string') {
        elementContent = h.parse(`${content}`);
      }

      let user = {};

      const atElements = h.select(elementContent, 'at');
      if (atElements.length > 0) {
        const firstElement = atElements[0];
        user = firstElement.attrs;
      }
      if (config.VerboseLoggerMode)
        logInfo("extractAtUser解析结果: ", user)
      return user;
    } catch (error) {
      ctx.logger.error("extractFirstImageUrl error:", error);
      // throw Error("有错误:" + error);
      return ''; // 发生错误时返回空字符串，避免程序崩溃
    }
    // const elements = h.parse(content);
    // const atElements = h.select(elements, 'at');
    // return atElements.length > 0 ? atElements[0].attrs : null;
  };

  //Pytorch后端选出来的最佳匹配结果捏
  async function getBestFuzzySearchRes(session, keyword: string) {
    try {
      // let url = "http://localhost:8989/fuzzy_guess";
      let url = `${config.mciconBackendAddres}/fuzzy_guess`;
      const params = new URLSearchParams();
      params.append("keyword", keyword);
      params.append("limit", "20");
      if (params.toString()) url += `?${params.toString()}`;
      ctx.logger.info(`getBestFuzzySearchRes(): url = ${url}`);

      const result = await ctx.http.get(url);
      ctx.logger.info(JSON.stringify(result).slice(0, 100));

      if (result.code !== 200) {
        await session.send(`错误, code!=200: ${result.message}`);
        return {
          isSucceed: false,
          msg: `error: code!==200`,
          res: result
        };
      }

      const data = result.data;
      const results = data.results;

      if (results.length === 0) {
        return {
          isSucceed: false,
          msg: `results[] is empty`,
          res: null
        };
      } else {
        return {
          isSucceed: true,
          msg: `succeed`,
          res: results[0]
        };
      }


    } catch (e) {
      ctx.logger.error(`error in getBestFuzzySearchRes(): ${e}`);
      return {
        isSucceed: false,
        msg: `error: ${e}`,
        res: null
      }
    }

  }


}
