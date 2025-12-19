import { Context } from 'koishi';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * 验证并下载字体文件
 * @param ctx Koishi Context 实例
 * @returns Promise<void>
 */
export async function validateFonts(ctx: Context): Promise<void> {
    const assetsDir = join(__dirname, '..', 'assets');
    
    // 确保assets目录存在
    if (!existsSync(assetsDir)) {
        mkdirSync(assetsDir, { recursive: true });
    }
    
    const fontConfigs = [
        {
            filename: 'MinecraftAE.ttf',
            downloadUrl: 'https://gitee.com/vincent-zyu/koishi-plugin-awa-mc-ament/releases/download/fonts/Minecraft_AE.ttf'
        }
    ];
    
    for (const fontConfig of fontConfigs) {
        const fontPath = join(assetsDir, fontConfig.filename);
        
        // 检查字体文件是否存在
        if (!existsSync(fontPath)) {
            ctx.logger.info(`字体文件 ${fontConfig.filename} 不存在，开始下载...`);
            
            try {
                // 下载字体文件
                const response = await ctx.http.get(fontConfig.downloadUrl, { responseType: 'arraybuffer' });
                const fontBuffer = Buffer.from(response);
                
                // 保存字体文件
                writeFileSync(fontPath, fontBuffer);
                ctx.logger.info(`字体文件 ${fontConfig.filename} 下载完成`);
            } catch (error) {
                ctx.logger.error(`下载字体文件 ${fontConfig.filename} 失败: ${error.message}`);
            }
        } else {
            ctx.logger.debug(`字体文件 ${fontConfig.filename} 已存在`);
        }
    }
}
