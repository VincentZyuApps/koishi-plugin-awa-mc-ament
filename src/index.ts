import { Context, Session, h } from 'koishi'
import { readFileSync } from 'fs'
import path from 'node:path'
import { renderAmentImage } from './image'
import { validateFonts, fileToBase64, copyBuiltinAssets, extractFirstImageUrl, extractFirstImageUrlAfterIcon, extractAtUser } from './utils'
import { Config } from './config'
import { getBestFuzzySearchRes } from './request'
import { sendQQMarkdown, buildAmentMarkdown, buildQueryKeyboard } from './qq'
import { CREEPER_BASE64_URL } from './const'
import { IconSource } from './type'

export const name = 'koishi-plugin-awa-mc-ament'

export const inject = {
  required: ["puppeteer", "http", "i18n"]
}

export { usage } from './usage'
export { Config } from './config'

interface IconResult {
  base64: string
  source: IconSource
}

async function resolveIcon(
  ctx: Context,
  config: Config,
  session: Session,
  options: { arg2_icon?: any; arg3_mcicon?: string; arg4_base64?: string }
): Promise<IconResult | null> {
  const bgDir = path.join(ctx.baseDir, ...config.bgPath)
  const fallback_img_path = path.join(bgDir, 'fallback_icon.jpg')
  const fallback_base64_str = readFileSync(fallback_img_path).toString('base64')

  let iconSource = IconSource.LUCKYBLOCK
  const firstAtUser = extractAtUser(session.content)
  if (config.VerboseLoggerMode)
    ctx.logger.info("👤 fitstAtUser = " + firstAtUser)

  const isAtUserBanned = config.banAtUserArg === 'all' ||
    (config.banAtUserArg === 'qq' && (session.platform === 'qq' || session.platform === 'qqguild'))
  if ('id' in firstAtUser && !isAtUserBanned)
    iconSource = IconSource.ATUSER
  // 由于 onebot adapter 疑似 bug：--icon 与紧跟的图片消息段之间不会自动插入空格，
  // 导致 options.arg2_icon 未被正确解析。因此额外检查 session.content 中是否包含 --icon。
  if (options.arg4_base64 || options.arg2_icon || session.content?.includes('--icon'))
    iconSource = IconSource.CMDARG
  if (session.quote) {
    const firstImgUrl = await extractFirstImageUrl(session.quote.content)
    if (firstImgUrl !== "")
      iconSource = IconSource.QUOTEMSG
  }
  if (options.arg3_mcicon)
    iconSource = IconSource.MCICON

  let ament_icon_image_element
  if (iconSource === IconSource.MCICON) {
    const bestItem = await getBestFuzzySearchRes(ctx, config.mciconBackendAddres, options.arg3_mcicon)
    ctx.logger.info(`🔍 options.arg3_mcicon = ${options.arg3_mcicon}`)
    if (bestItem.isSucceed === false) {
      await session.send(`获取Minecraft图标有问题哦, msg=${bestItem.res}, res=${bestItem.res}`)
      return null
    }
    ctx.logger.info(`📦 ${JSON.stringify(bestItem.res)}`)
    ament_icon_image_element = `${config.mciconBackendAddres}/mcimg/${bestItem.res.name.toString().replace(/\\/g, "/")}`
  } else if (iconSource === IconSource.QUOTEMSG) {
    ament_icon_image_element = await extractFirstImageUrl(session.quote.content)
  } else if (iconSource === IconSource.CMDARG) {
    if (options.arg4_base64) {
      ament_icon_image_element = options.arg4_base64
    } else {
      const rawIcon = options.arg2_icon
      ament_icon_image_element = rawIcon?.src ?? rawIcon?.url ?? rawIcon?.file
      if (!ament_icon_image_element) {
        ament_icon_image_element = await extractFirstImageUrlAfterIcon(session.content)
      }
    }
  } else if (iconSource === IconSource.ATUSER) {
    const firstUserDict = extractAtUser(session.content)
    ament_icon_image_element = (await session.bot.getUser(firstUserDict['id'], session.event.guild.id)).avatar
  } else if (iconSource === IconSource.LUCKYBLOCK) {
    ament_icon_image_element = `data:image/jpeg;base64,${fallback_base64_str}`
  }

  let ament_icon_base64
  if (iconSource === IconSource.LUCKYBLOCK) {
    ament_icon_base64 = fallback_base64_str
  } else if (typeof ament_icon_image_element === 'string' && ament_icon_image_element.startsWith('data:')) {
    // 保留完整 data URI（含 MIME 类型），模板会根据 MIME 类型直接使用
    ament_icon_base64 = ament_icon_image_element
  } else {
    const ament_icon_buffer = await ctx.http.file(ament_icon_image_element)
    ament_icon_base64 = Buffer.from(ament_icon_buffer.data).toString('base64')
  }

  return { base64: ament_icon_base64, source: iconSource }
}

export function apply(ctx: Context, config) {
  const fontDir = path.join(ctx.baseDir, ...config.fontPath)
  const bgDir = path.join(ctx.baseDir, ...config.bgPath)

  validateFonts(ctx, fontDir)
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
      { session: Session, options: { arg0_title: string; arg1_description: string; arg2_icon?: any; arg3_mcicon?: string; arg4_base64?: string } }
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

      const font_base64 = await fileToBase64(path.join(fontDir, 'MinecraftAE.ttf'))
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
