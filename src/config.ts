import { Schema } from 'koishi'
import path from 'node:path'

/**
 * 📋 插件配置项接口
 */
export interface Config {
  // ==== 💬 消息设置 ====
  /** 💬 是否自动引用回复触发指令的消息 */
  enableQuote: boolean
  /** 🔧 指令名称（默认为 ament） */
  commandName: string

  // ==== ⚙️ Args-参数相关 ====
  /** 🚫 是否禁止使用 at 用户作为成就图标来源 */
  banAtUserArg: boolean

  // ==== 📦 Assets-静态资源资产相关 ====
  /** 🔤 字体文件路径（相对于 Koishi 根目录） */
  fontPath: string[]
  /** 🖼️ 背景图路径（相对于 Koishi 根目录） */
  bgPath: string[]

  // ==== 🌐 PuppeteerConfig-浏览器配置相关 ====
  /** 📸 Puppeteer 截图质量 (0-100) */
  browserScreenshotquality: number
  /** 🖼️ 截图输出格式 */
  browserScreenshotFormat: 'jpeg' | 'png' | 'webp'
  /** 📝 是否将 HTML 模板写入文件（调试用） */
  enableHtmlDump: boolean
  /** 📂 HTML 输出路径（相对于 Koishi 根目录） */
  htmlDumpPath: string[]

  // ==== 🎯 McIcon-后端服务相关 ====
  /** 🎮 是否启用 MC 图标后端服务 */
  enableMciconBackend: boolean
  /** 🔗 MC 图标后端地址 */
  mciconBackendAddres: string

  // ==== 🐛 DebugConfig-调试内容相关 ====
  /** 🔍 是否开启详细输出 */
  VerboseLoggerMode: boolean
}

export const Config: Schema<Config> = Schema.intersect([
  // ==== 💬 消息设置 ====
  Schema.object({
    enableQuote: Schema.boolean().default(true)
      .description("💬 开启后，本插件发送的消息都会引用回复触发指令的消息"),
    commandName: Schema.string().default('ament')
      .description("🔧 指令名称（默认为 ament）"),
  }).description("==== 💬 消息设置 ===="),

  // ==== ⚙️ Args-参数相关 ====
  Schema.object({
    banAtUserArg: Schema.boolean().default(false).experimental()
      .description("🚫 是否禁止使用at用户作为成就图标来源 </br> <i> (qq官机得打开这个，因为<u>没开主动</u>的qq官机必须艾特bot才能用指令... <br>可以去用<a href='https://github.com/VincentZyuApps/koishi-plugin-get-qq-bot-transfer-link' target='_blank'>get-qq-bot-transfer-link插件</a>开启主动消息) </i> "),
  }).description("==== ⚙️ Args-参数相关 ===="),

  // ==== 📦 Assets-静态资源资产相关 ====
  Schema.object({
    fontPath: Schema.array(String).role('table').default(['data', 'assets', 'fonts'])
      .description("🔤 字体文件路径（相对于 Koishi 根目录，启动时自动从 Gitee 下载到该目录）"),
    bgPath: Schema.array(String).role('table').default(['data', 'assets', 'awa-mc-ament', 'image'])
      .description("🖼️ 背景图路径（相对于 Koishi 根目录，启动时自动从插件内置资源复制到该目录）"),
  }).description("==== 📦 Assets-静态资源资产相关 ===="),

  // ==== 🌐 PuppeteerConfig-浏览器配置相关 ====
  Schema.object({
    browserScreenshotquality: Schema.number().role('slider').min(0).max(100).step(1).default(80)
      .description("📸 Puppeteer截图质量参数，图片压缩质量, 范围0-100"),
    browserScreenshotFormat: Schema.union([
      Schema.const('jpeg').description('🪟 JPEG - 有损压缩，文件小'),
      Schema.const('png').description('🖼️ PNG - 无损压缩，支持透明'),
      Schema.const('webp').description('🌐 WEBP - 现代格式，兼顾质量与体积'),
    ]).default('png').role('radio')
      .description("🖼️ 截图输出格式"),
    enableHtmlDump: Schema.boolean().default(false)
      .description("📝 是否将渲染用的 HTML 模板写入文件（调试用，可在 tmp 目录查看 awa-mc-ament-tmp.html）"),
    htmlDumpPath: Schema.array(String).role('table').default(['tmp'])
      .description("📂 HTML 模板输出目录（相对于 Koishi 根目录，仅在 enableHtmlDump 开启时生效）"),
  }).description("==== 🌐 PuppeteerConfig-浏览器配置相关 ===="),

  // ==== 🎯 McIcon-后端服务相关 ====
  Schema.object({
    enableMciconBackend: Schema.boolean().default(false).experimental()
      .description("🎮 （可选）是否启用MC图标后端服务，给--icon参数用的，例如：--icon diamond <br/> <i>需要自行部署 PyTorch+FastAPI 后端，项目地址：<a href='https://github.com/VincentZyuApps/fastapi-awa-fuzzy-search-minecraft-backend' target='_blank'>github.com/VincentZyuApps/fastapi-awa-fuzzy-search-minecraft-backend</a></i>"),
    mciconBackendAddres: Schema.string().default('http://192.168.31.233:60615').experimental()
      .description("🔗 mc图标后端地址，完整URL（包含 http:// 或 https://）"),
  }).description("==== 🎯 McIcon-后端服务相关 ===="),

  // ==== 🐛 DebugConfig-调试内容相关 ====
  Schema.object({
    VerboseLoggerMode: Schema.boolean().default(false)
      .description("🔍 是否开启详细输出"),
  }).description("==== 🐛 DebugConfig-调试内容相关 ===="),
])
