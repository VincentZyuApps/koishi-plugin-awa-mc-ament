import type { Context } from 'koishi'
import type { Config } from './config'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import path from 'node:path'
import { createHash } from 'crypto'

export const DEFAULT_FONT_DIR_PARTS = ['data', 'fonts']
export const MINECRAFT_AE_FONT_FILE_NAME = 'MinecraftAE.ttf'

interface FontIntegrity {
  size: number
  md5: string
  sha1: string
  sha256: string
  sha512: string
}

const FONT_INTEGRITY: Record<string, FontIntegrity> = {
  [MINECRAFT_AE_FONT_FILE_NAME]: {
    size: 16162252,
    md5: '879b682baf3931357dca2a12b114f313',
    sha1: 'fa2ad39ea672b3bf98954fad29f43b5d36e35c7d',
    sha256: '0e0ef38bd9934c641067696b22696f2763950043baa62f1bd0cdabaad0b2a729',
    sha512: '9501fd0d4a50a7e2d2b090b777afc66731b1d004e458f1a57a8b415442a3d72b4851f87782f833a64666c67de4c095f8bcb00067e7aec0e4c541899f696173ad',
  },
}

// Schema 默认值拿不到 ctx.baseDir，只能用 cwd 作为配置页展示 fallback。
// 运行时会映射回 ctx.baseDir/data/fonts。
export const DEFAULT_CONFIG_FONT_DIR = path.join(process.cwd(), ...DEFAULT_FONT_DIR_PARTS)

export function getDefaultFontDir(ctx: Context): string {
  return path.join(ctx.baseDir, ...DEFAULT_FONT_DIR_PARTS)
}

export function getMinecraftAeFontPath(ctx: Context): string {
  return path.join(getDefaultFontDir(ctx), MINECRAFT_AE_FONT_FILE_NAME)
}

export function resolveFontDir(ctx: Context, config: Config): string {
  const configuredFontPath = config.fontPath
  const runtimeDefault = getDefaultFontDir(ctx)

  if (Array.isArray(configuredFontPath)) {
    const normalized = configuredFontPath.join('/')
    const isDefaultPath = normalized === 'data/fonts'

    if (configuredFontPath.length === 0 || isDefaultPath) {
      return runtimeDefault
    }

    return path.join(ctx.baseDir, ...configuredFontPath)
  }

  const configured = configuredFontPath?.trim()

  if (!configured || configured === DEFAULT_CONFIG_FONT_DIR || configured === runtimeDefault || configured.replace(/\\/g, '/') === 'data/fonts') {
    return runtimeDefault
  }

  return path.isAbsolute(configured) ? configured : path.join(ctx.baseDir, configured)
}

function calculateFontHashes(buffer: Buffer) {
  return {
    md5: createHash('md5').update(buffer).digest('hex'),
    sha1: createHash('sha1').update(buffer).digest('hex'),
    sha256: createHash('sha256').update(buffer).digest('hex'),
    sha512: createHash('sha512').update(buffer).digest('hex'),
  }
}

function verifyFontIntegrity(filePath: string, expected: FontIntegrity): boolean {
  if (!existsSync(filePath)) return false
  const buffer = readFileSync(filePath)
  if (buffer.length !== expected.size) return false
  const hashes = calculateFontHashes(buffer)
  return hashes.md5 === expected.md5
    && hashes.sha1 === expected.sha1
    && hashes.sha256 === expected.sha256
    && hashes.sha512 === expected.sha512
}

export async function validateFonts(ctx: Context): Promise<void> {
  const fontDir = getDefaultFontDir(ctx)

  if (!existsSync(fontDir)) {
    mkdirSync(fontDir, { recursive: true })
  }

  const fontConfigs = [
    {
      filename: MINECRAFT_AE_FONT_FILE_NAME,
      downloadUrl: 'https://gitee.com/vincent-zyu/koishi-plugin-awa-mc-ament/releases/download/fonts/Minecraft_AE.ttf'
    }
  ]

  for (const fontConfig of fontConfigs) {
    const fontPath = path.join(fontDir, fontConfig.filename)
    const expected = FONT_INTEGRITY[fontConfig.filename]

    if (expected && verifyFontIntegrity(fontPath, expected)) {
      ctx.logger.debug(`✅ 字体文件 ${fontConfig.filename} 已存在且 hash 校验通过`)
      continue
    }

    if (existsSync(fontPath)) {
      ctx.logger.warn(`⚠️ 字体文件 ${fontConfig.filename} 存在但 hash 校验失败，将重新下载: ${fontPath}`)
    } else {
      ctx.logger.info(`📥 字体文件 ${fontConfig.filename} 不存在，开始下载到 ${fontDir}...`)
    }

    try {
      const response = await ctx.http.get(fontConfig.downloadUrl, { responseType: 'arraybuffer' })
      const fontBuffer = Buffer.from(response)

      writeFileSync(fontPath, fontBuffer)
      if (expected && !verifyFontIntegrity(fontPath, expected)) {
        throw new Error(`❌ 字体 hash 校验失败: ${fontConfig.filename}`)
      }
      ctx.logger.info(`✅ 字体文件 ${fontConfig.filename} 下载完成，hash 校验通过`)
    } catch (error) {
      ctx.logger.error(`❌ 下载字体文件 ${fontConfig.filename} 失败: ${error.message}`)
    }
  }
}

export function copyBuiltinAssets(ctx: Context, bgDir: string): void {
  const builtinAssetsDir = path.join(__dirname, '..', 'assets')
  const files = ['ament_made_bg.png', 'fallback_icon.jpg']

  if (!existsSync(bgDir)) {
    mkdirSync(bgDir, { recursive: true })
  }

  for (const file of files) {
    const targetPath = path.join(bgDir, file)
    if (!existsSync(targetPath)) {
      const srcPath = path.join(builtinAssetsDir, file)
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
