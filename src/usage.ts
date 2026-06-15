import { readFileSync } from 'fs'
import { resolve } from 'path'

const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'))

export const usage = `
<h1>🎮 Koishi 插件：awa-mc-ament - Minecraft 成就生成器</h1>
<h2>🎯 插件版本：v${pkg.version}</h2>
<p>📖 <a href="https://gitee.com/vincent-zyu/koishi-plugin-awa-mc-ament" target="_blank">【点我跳转到 Gitee 查看带图片的完整 README】</a></p>

<p>
  <a href="https://www.npmjs.com/package/koishi-plugin-awa-mc-ament" target="_blank">
    <img src="https://img.shields.io/npm/v/koishi-plugin-awa-mc-ament?style=flat-square" alt="npm version">
  </a>
  <a href="https://github.com/VincentZyuApps/koishi-plugin-awa-mc-ament" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://gitee.com/vincent-zyu/koishi-plugin-awa-mc-ament" target="_blank">
    <img src="https://img.shields.io/badge/Gitee-C71D23?style=for-the-badge&logo=gitee&logoColor=white" alt="Gitee">
  </a>
  <a href="https://forum.koishi.xyz/t/topic/12076/3" target="_blank">
    <img src="https://img.shields.io/badge/Koishi Forum-12076-5546A3?style=for-the-badge&logo=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Ff%2Ff3%2FKoishi.js_Logo.png&logoColor=white" alt="Forum">
  </a>
  <a href="https://qm.qq.com/q/4vjto4V7Di" target="_blank">
    <img src="https://img.shields.io/badge/QQ群-259248174-12B7F5?style=flat-square&logo=qq&logoColor=white" alt="QQ群">
  </a>
</p>

<h2>💬 交流反馈</h2>
<p>🐛 Bug 反馈 / 💡 建议 / 👨‍💻 插件开发交流，欢迎加群：</p>
<p><del>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入QQ群：<b>259248174</b>   🎉（这个群G了</del></p>
<p>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入QQ群：<b>259248174🎉</p>
<p>💡 在群里直接艾特我，回复的更快哦~ ✨</p>

<hr>

<h2>✨ 功能概述</h2>
<p>生成 Minecraft 风格的成就/进度图片，支持自定义标题、描述和图标。</p>

<hr>

<h2>🔍 图标获取优先级</h2>
<p>本插件会按照以下优先级自动选择图标来源：</p>
<ol>
  <li>🎮 <b>Minecraft 游戏图标</b>（需要启用<a href="https://github.com/VincentZyuApps/fastapi-awa-fuzzy-search-minecraft-backend" target="_blank">Pytorch后端服务</a>）</li>
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
    <a href="https://github.com/VincentZyuApps/fastapi-awa-fuzzy-search-minecraft-backend" target="_blank">
      【点我跳转】https://github.com/VincentZyuApps/fastapi-awa-fuzzy-search-minecraft-backend
    </a>
  </li>
</ol>

<hr>

`
