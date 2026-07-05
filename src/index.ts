import { Context, Session, h } from 'koishi'
import { readFile } from 'fs/promises'
import path from 'node:path'
import { renderAmentImage } from './image'
import { validateFonts, copyBuiltinAssets, getMinecraftAeFontPath, resolveFontDir } from './font'
import { resolveIcon, type IconOptions } from './message'
import { Config } from './config'
import { sendQQMarkdown, buildAmentMarkdown, buildQueryKeyboard } from './qq'
import { CREEPER_BASE64_URL } from './const'

export const name = 'koishi-plugin-awa-mc-ament'

export const inject = {
  required: ["puppeteer", "http", "i18n"]
}

export { usage } from './usage'
export { Config } from './config'

async function fileToBase64(filePath: string): Promise<string> {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath)
  const buffer = await readFile(absolutePath)
  return buffer.toString('base64')
}

export function apply(ctx: Context, config) {
  const fontDir = resolveFontDir(ctx, config)
  const bgDir = path.join(ctx.baseDir, ...config.bgPath)

  validateFonts(ctx)
  copyBuiltinAssets(ctx, bgDir)

  const cmdName = config.commandName || 'ament'
  const amentCommand = ctx.command(
    cmdName,
    "生成MC风格的成就/进度图片 \n" +
    "\t【注意图标获取的优先级】：Minecaft游戏图标(如果对接Pytorch后端) > 被引用消息的第一张图片 > 参数传入的图片(--base64优先, --icon其次) > 被艾特用户的头像 > 默认fallback幸运方块图标 \n" +
    "\t【代码里面的标识符】MCICON > QUOTEMSG > CMDARG(--base64 > --icon) > ATUSER > LUCKYBLOCK" +
    "\t (如果没明白就去看源代码: https://github.com/VincentZyuApps/koishi-plugin-awa-mc-ament)\n"
  )
    .option("arg0_title", '-t, --title <arg0_title:string> 成就标题', { fallback: "请输入标题" })
    .option("arg1_description", '-d, --description <arg1_description:string> 成就描述', { fallback: "请输入描述" })
    .option("arg2_icon", '-i, --icon <arg2_icon:image> 成就图标')

  if (config.enableBase64IconArg) {
    amentCommand.option("arg4_base64", '--icon-base64 <arg4_base64:string> 使用 data: URL 作为图标')
  }

  if (config.enableMciconBackend) {
    amentCommand.option("arg3_mcicon", '-m, --mcicon <arg3_mcicon:string> Minecraft游戏图标搜索关键词')
  }

  amentCommand.action(
    async (
      { session, options }:
      { session: Session, options: { arg0_title: string; arg1_description: string } & IconOptions }
    ) => {
      const iconResult = await resolveIcon(ctx, config, session, options)
      if (!iconResult) return

      if (config.VerboseLoggerMode) {
        let args_msg = "🛠️[debug]\n"
        args_msg += `📱[platform] = ${session.platform}\n`
        args_msg += `📝[options.arg0_title] = ${options.arg0_title}\n`
        args_msg += `📖[options.arg1_description] = ${options.arg1_description}\n`
        args_msg += `🎨[options.arg2_icon] = ${String(options.arg2_icon).slice(0, 100)}\n`
        args_msg += `📦[options.arg4_base64] = ${String(options.arg4_base64).slice(0, 100)}\n`
        args_msg += `🖼️[options.arg3_mcicon] = ${options.arg3_mcicon}\n`
        args_msg += `[iconSource] = ${iconResult.source}\n`
        args_msg += `🅰️[fontDir] = ${fontDir}\n`
        args_msg += `🌌[bgDir] = ${bgDir}\n`
        ctx.logger.info(args_msg)
      }

      const font_base64 = await fileToBase64(getMinecraftAeFontPath(ctx))
      const bg_base64 = await fileToBase64(path.join(bgDir, 'ament_made_bg.png'))

      const renderAmentImageRes = await renderAmentImage(ctx, {
        title: options.arg0_title,
        description: options.arg1_description,
        icon: iconResult.base64,
        iconMode: 'base64',
        width: 320,
        height: 64,
        fontBase64: font_base64,
        bgBase64: bg_base64,
        page_screenshotquality: config.browserScreenshotquality,
        page_screenshotformat: config.browserScreenshotFormat,
        enableHtmlDump: config.enableHtmlDump,
        htmlDumpPath: config.htmlDumpPath
      })

      const mimeType = config.browserScreenshotFormat === 'png' ? 'image/png'
        : config.browserScreenshotFormat === 'webp' ? 'image/webp'
        : 'image/jpeg'
      const imageBase64Str = `data:${mimeType};base64,` + renderAmentImageRes;
      await session.send(
        // `${config.enableQuote !== false ? h.quote(session.messageId) : ''}${h('image', { url: `data:${mimeType};base64,` + renderAmentImageRes })}`
        `${config.enableQuote !== false ? h.quote(session.messageId) : ''}${h.image(imageBase64Str)}`
      )

      if (config.enableQQMarkdown && (session.platform === 'qq' || session.platform === 'qqguild')) {
        const md = buildAmentMarkdown(options.arg0_title, options.arg1_description)
        const kb = buildQueryKeyboard(
          config.commandName,
          session.userId,
          options.arg0_title,
          options.arg1_description,
          CREEPER_BASE64_URL,
          config.qqMarkdownKeyboardJson,
        )
        await sendQQMarkdown(session, md, kb)
      }
    })
}
