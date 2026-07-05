import { h, type Context, type Session } from 'koishi'
import { readFileSync } from 'fs'
import path from 'node:path'
import type { Config } from './config'
import { getBestFuzzySearchRes } from './request'
import { IconSource } from './type'

export interface IconOptions {
  arg2_icon?: any
  arg3_mcicon?: string
  arg4_base64?: string
}

export interface IconResult {
  base64: string
  source: IconSource
}

export function extractImageUrl(content) {
  let urls = h.select(content, 'img').map(item => item.attrs.src)
  if (urls?.length > 0) {
    return urls
  }
  urls = h.select(content, 'mface').map(item => item.attrs.url)
  return urls?.length > 0 ? urls : null
}

export async function extractFirstImageUrl(content) {
  if (!content) return ''

  try {
    let elementContent = content
    if (typeof content === 'string') {
      elementContent = h.parse(`${content}`)
    }

    const imgElements = h.select(elementContent, 'img, image, mface')
    if (imgElements.length > 0) {
      const firstElement = imgElements[0]
      return firstElement.attrs?.src || firstElement.attrs?.url || ''
    }

    return ''
  } catch {
    return ''
  }
}

// 由于 onebot adapter 疑似 bug：--icon 参数与紧跟的图片消息段之间不会自动插入空格，
// 导致 Koishi 命令解析器无法将图片识别为 options.arg2_icon。
// 此函数用于从 session.content 中 --icon 之后的内容提取第一张图片作为回退。
export async function extractFirstImageUrlAfterIcon(content: string): Promise<string> {
  if (!content) return ''

  try {
    const iconIndex = content.indexOf('--icon')
    if (iconIndex === -1) return ''

    const afterIcon = content.slice(iconIndex + 6)
    const elementContent = h.parse(afterIcon)
    const imgElements = h.select(elementContent, 'img, image, mface')
    if (imgElements.length > 0) {
      return imgElements[0].attrs?.src || imgElements[0].attrs?.url || ''
    }

    return ''
  } catch {
    return ''
  }
}

export function extractAtUser(content) {
  if (!content) return {}

  try {
    let elementContent = content
    if (typeof content === 'string') {
      elementContent = h.parse(`${content}`)
    }

    const atElements = h.select(elementContent, 'at')
    if (atElements.length > 0) {
      return atElements[0].attrs
    }
    return {}
  } catch {
    return {}
  }
}

export async function resolveIcon(
  ctx: Context,
  config: Config,
  session: Session,
  options: IconOptions
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
