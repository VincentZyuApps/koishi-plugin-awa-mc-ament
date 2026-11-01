import { readFileSync } from 'fs'
import { resolve } from 'path'

const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'))

const detailsStyle = 'margin:10px 0;border:1px solid var(--k-color-border, #909399);border-radius:8px;background:var(--k-card-bg, transparent);color:var(--k-text-dark, inherit);overflow:hidden;box-shadow:var(--k-card-shadow, 0 1px 3px rgb(0 0 0 / 12%));transition:var(--color-transition, border-color .2s ease, background-color .2s ease)'
const summaryStyle = 'padding:9px 12px;background:var(--k-hover-bg, rgba(127, 127, 127, .12));color:var(--k-text-dark, inherit);cursor:pointer;user-select:none'
const detailsBodyStyle = 'padding:6px 14px 12px;border-top:1px solid var(--k-color-divider, rgba(127, 127, 127, .28));background:var(--k-card-bg, transparent);color:var(--k-text-dark, inherit)'

const KOISHI_LOGO_BASE64 = 'data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABU0lEQVR42p2UQSsFYRSGnxnqLuytKWKpKFkQNsS%2FsOHPWPADLCmxU5S7UzYWNrJR7lYiRF2FeWzOMKZ7mXHqNNP5vvP2nu%2B850CY2lP4X1K31ZbaDm%2BpO%2Bpyp5wfAXVEPfRvO1JHf4AVQGbUh7j4EZ4VkrNCXPVRnf3CUBN1SH2KC28VGOV3ntRhNclZHdcAKYM11QR1oVBOXctzFlNgBTC8qmXxPQEegbVeYApIgJT6tg%2F0AdMp0B%2FBpCabK2AAmAAa%2F2GRBft1oBFPkqTAba7LCiAfQC9wClwAY1HJHepuiO29Yrsf1Dn1uiDU3RTYCtTkl1Leg8k9MB4NGgReI28rV3azgyCz0og01Xl1Uz1QX8uCTELm3UbkTF1VJ9Wr0tn3iBSGdjYG0XivE3VN3VD31PM4a3cc2tIGGI0VkTO7rLxGuiy25ejmjfqsvkSXui62TxaK03td4FXTAAAAAElFTkSuQmCC'

export const usage = `
<h1>🎮 Koishi 插件：awa-mc-ament - Minecraft 成就生成器</h1>
<h2>🎯 插件版本：v${pkg.version}</h2>
<p>📖 <a href="https://gitee.com/vincent-zyu/koishi-plugin-awa-mc-ament" target="_blank">【点我跳转到 Gitee 查看带图片的完整 README】</a></p>

<p>
  <a href="https://www.npmjs.com/package/koishi-plugin-awa-mc-ament" target="_blank">
    <img src="https://img.shields.io/npm/v/koishi-plugin-awa-mc-ament?style=flat-square&logo=npm" alt="npm version">
  </a>
  <a href="https://npm-stat.com/charts.html?package=koishi-plugin-awa-mc-ament" target="_blank">
    <img src="https://img.shields.io/npm/dm/koishi-plugin-awa-mc-ament?style=flat-square&logo=npm" alt="npm downloads">
  </a>
  <br>
  <a href="https://koishi.chat/zh-CN/market/" target="_blank">
    <img src="https://img.shields.io/badge/Koishi-plugin-5546A3?style=flat-square&logo=${KOISHI_LOGO_BASE64}" alt="Koishi">
  </a>
  <a href="https://github.com/VincentZyuApps/koishi-plugin-awa-mc-ament" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://gitee.com/vincent-zyu/koishi-plugin-awa-mc-ament" target="_blank">
    <img src="https://img.shields.io/badge/Gitee-C71D23?style=for-the-badge&logo=gitee&logoColor=white" alt="Gitee">
  </a>
  <br>
  <a href="https://forum.koishi.xyz/t/topic/12076" target="_blank">
    <img src="https://img.shields.io/badge/Koishi%20Forum-12076-5546A3?style=for-the-badge&logo=${KOISHI_LOGO_BASE64}&logoColor=white" alt="Koishi Forum">
  </a>
  <a href="https://qm.qq.com/q/ZN7fxZ3qCq" target="_blank">
    <img src="https://img.shields.io/badge/QQ群-1085190201-12B7F5?style=flat-square&logo=qq&logoColor=white" alt="QQ群">
  </a>
</p>

<blockquote style="margin: 14px 0; padding: 12px 16px; border-left: 6px solid #10b981; border-radius: 8px; background: rgba(16, 185, 129, 0.12); color: inherit; line-height: 1.6; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
  <b style="color: #10b981;">💡 原汁原味的像素风成就弹窗</b><br>
  支持生成 Minecraft 风格的成就/进度图片，提供自定义双行标题描述、动态头像裁切与 PyTorch 语义匹配图标。
</blockquote>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #10b981;">✨ 功能概述与核心能力</b></summary>
<div style="${detailsBodyStyle}">
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981;">
    <p style="margin: 4px 0;"><b>🎨 原生像素排版：</b>内置 Minecraft 经典字体与金黄副标配色，全像素级渲染。</p>
    <p style="margin: 4px 0;"><b>🤖 智能图标适配：</b>支持多重 fallback 机制，无论是否提供图标都能优雅产出。</p>
    <p style="margin: 4px 0;"><b>💬 QQ 官方 Bot 兼容：</b>支持 Markdown 图文消息 + 内联交互按钮，方便群友快捷回填一键再来一张。</p>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #0ea5e9;">🔍 图标智能获取优先级</b></summary>
<div style="${detailsBodyStyle}">
  <p>当执行生成指令时，插件会按以下阶梯顺序自动检索最优图标源：</p>
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(14, 165, 233, 0.08); border-left: 4px solid #0ea5e9;">
    <ol style="margin: 4px 0; padding-left: 20px;">
      <li style="margin: 4px 0;">🎮 <b>Minecraft 游戏图标</b>（需配置并启用 PyTorch 语义匹配后端）</li>
      <li style="margin: 4px 0;">💬 <b>引用回复消息的图片</b>（直接引用群聊中带图的消息）</li>
      <li style="margin: 4px 0;">🖼️ <b>参数显式传入的图片</b>（通过 <code>--icon [图片]</code> 直接指定）</li>
      <li style="margin: 4px 0;">👤 <b>@ 用户的头像</b>（自动提取消息中第一个艾特目标的头像并裁切）</li>
      <li style="margin: 4px 0;">🎲 <b>默认幸运方块图标</b>（兜底预置图标，永不落空）</li>
    </ol>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #f59e0b;">📝 指令参数与使用示例</b></summary>
<div style="${detailsBodyStyle}">
  <p>指令基础格式：<code>ament -t &lt;标题&gt; -d &lt;描述&gt; [选项]</code></p>
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b;">
    <ul style="margin: 4px 0; padding-left: 18px;">
      <li style="margin: 6px 0;">
        <code>ament -t 获得成就！ -d 钻石！ --mcicon 钻石</code><br>
        <span style="color: var(--k-text-light, #666); font-size: 13px;">→ 借助 PyTorch 语义模型自动搜寻最贴近「钻石」的原版物品图标</span>
      </li>
      <li style="margin: 6px 0;">
        <code>【先引用一条带图消息】 ament -t 获得成就！ -d 发现新大陆</code><br>
        <span style="color: var(--k-text-light, #666); font-size: 13px;">→ 提取被引用消息的第一张图片作为成就左侧图标</span>
      </li>
      <li style="margin: 6px 0;">
        <code>ament -t 谁是卧底 -d 抓到你了 @群友</code><br>
        <span style="color: var(--k-text-light, #666); font-size: 13px;">→ 自动提取被 @ 用户的头像生成成就图</span>
      </li>
      <li style="margin: 6px 0;">
        <code>ament -t 探索未知 -d 开启冒险</code><br>
        <span style="color: var(--k-text-light, #666); font-size: 13px;">→ 未传图标时自动回退为经典的「黄色问号幸运方块」</span>
      </li>
    </ul>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #8b5cf6;">⚙️ PyTorch + FastAPI MC 图标搜索后端（可选扩展）</b></summary>
<div style="${detailsBodyStyle}">
  <p>如需使用 <code>--mcicon</code> 参数进行精准的 Minecraft 物品语义匹配检索，请按以下指引启用：</p>
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(139, 92, 246, 0.08); border-left: 4px solid #8b5cf6;">
    <ol style="margin: 4px 0; padding-left: 20px;">
      <li>在插件设置中勾选 <b>“启用MC图标后端服务”</b> 并填入后端 HTTP 地址。</li>
      <li>后端独立服务仓库已开源：
        <br>
        🔗 <a href="https://github.com/VincentZyuApps/fastapi-awa-fuzzy-search-minecraft-backend" target="_blank" style="color: #8b5cf6; font-weight: bold;">
          fastapi-awa-fuzzy-search-minecraft-backend
        </a>
      </li>
      <li>支持通过 Docker 或 Python 虚拟环境直接一键启动。</li>
    </ol>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #ec4899;">💬 社区交流与反馈渠道</b></summary>
<div style="${detailsBodyStyle}">
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(236, 72, 153, 0.08); border-left: 4px solid #ec4899;">
    <p style="margin: 4px 0;">🐛 <b>Bug 反馈 / 💡 功能建议 / 👨‍💻 插件开发交流：</b></p>
    <p style="margin: 4px 0;"><del style="opacity: 0.6;">💬 插件使用交流群：259248174（已失效）</del></p>
    <p style="margin: 4px 0;">💬 欢迎加入官方交流 QQ 群：<b style="color: #12B7F5;">1085190201</b> 🎉</p>
    <p style="margin: 4px 0;">💡 群内直接艾特作者 <b>vincentzyu</b>，响应更快速哦~ ✨</p>
  </div>
</div>
</details>
`
