import { Context, h } from 'koishi'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { readFile } from 'fs/promises'
import { join, isAbsolute, resolve } from 'path'

export async function validateFonts(ctx: Context, targetDir: string): Promise<void> {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  const fontConfigs = [
    {
      filename: 'MinecraftAE.ttf',
      downloadUrl: 'https://gitee.com/vincent-zyu/koishi-plugin-awa-mc-ament/releases/download/fonts/Minecraft_AE.ttf'
    }
  ]

  for (const fontConfig of fontConfigs) {
    const fontPath = join(targetDir, fontConfig.filename)

    if (!existsSync(fontPath)) {
      ctx.logger.info(`📥 字体文件 ${fontConfig.filename} 不存在，开始下载到 ${targetDir}...`)

      try {
        const response = await ctx.http.get(fontConfig.downloadUrl, { responseType: 'arraybuffer' })
        const fontBuffer = Buffer.from(response)

        writeFileSync(fontPath, fontBuffer)
        ctx.logger.info(`✅ 字体文件 ${fontConfig.filename} 下载完成`)
      } catch (error) {
        ctx.logger.error(`❌ 下载字体文件 ${fontConfig.filename} 失败: ${error.message}`)
      }
    } else {
      ctx.logger.debug(`✅ 字体文件 ${fontConfig.filename} 已存在`)
    }
  }
}

export function copyBuiltinAssets(ctx: Context, bgDir: string): void {
  const builtinAssetsDir = join(__dirname, '..', 'assets')
  const files = ['ament_made_bg.png', 'fallback_icon.jpg']

  if (!existsSync(bgDir)) {
    mkdirSync(bgDir, { recursive: true })
  }

  for (const file of files) {
    const targetPath = join(bgDir, file)
    if (!existsSync(targetPath)) {
      const srcPath = join(builtinAssetsDir, file)
      if (existsSync(srcPath)) {
        try {
          const data = readFileSync(srcPath)
          writeFileSync(targetPath, data)
          ctx.logger.info(`📋 内置资源 ${file} 已复制到 ${targetPath}`)
        } catch (error) {
          ctx.logger.error(`❌ 复制内置资源 ${file} 失败: ${error.message}`)
        }
      } else {
        ctx.logger.warn(`⚠️ 内置资源 ${file} 在插件目录中不存在，跳过复制`)
      }
    }
  }
}

export async function fileToBase64(filePath: string): Promise<string> {
  const absolutePath = isAbsolute(filePath) ? filePath : resolve(filePath)
  const buffer = await readFile(absolutePath)
  return buffer.toString('base64')
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
