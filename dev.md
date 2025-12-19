```shell

# 确保插件文件夹的名称是*awa-mc-ament*, 没有koishi-plugin 前缀，然后:
cd G:\GGames\Minecraft\shuyeyun\qq-bot\koishi-dev\koishi-dev-3
yarn
yarn dev
yarn build awa-mc-ament

$Env:HTTP_PROXY = "http://192.168.31.84:7890"
$Env:HTTPS_PROXY = "http://192.168.31.84:7890"
Invoke-WebRequest -Uri "https://www.google.com" -Method Head -UseBasicParsing
npm login --registry https://registry.npmjs.org
# 在浏览器里面登录npm，去邮件里面收验证码
npm run pub awa-mc-ament -- --registry https://registry.npmjs.org
npm dist-tag add koishi-plugin-awa-mc-ament@0.0.4-beta.3+20251219 latest --registry https://registry.npmjs.org

npm view koishi-plugin-awa-mc-ament
npm-stat.com

```