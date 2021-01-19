import * as program from 'commander'
import * as path from 'path'
import * as inquirer from 'inquirer'
import * as fs from 'fs-extra'
import * as chalk from 'chalk'
import { upperCase, getName } from './utils'

const packageFilePath = path.join(__dirname, '..', 'package.json')
const packageInfo = JSON.parse(fs.readFileSync(packageFilePath, 'utf8'))
const currentVersion = packageInfo.version

program.version(currentVersion).usage('[命令] [配置项]')
;(async function () {
  try {
    program
      .command('view')
      .description('添加一个视图')
      .arguments('<moduleName> <packageName> <viewName>')
      .action((moduleName, packageName, viewName) => {
        const newModuleName = `module-${moduleName}`
        const rootViewDir = './src/views'
        const moduleDir = `${rootViewDir}/${newModuleName}`
        const pkgDir = `${moduleDir}/${packageName}`
        const viewDir = `${pkgDir}/${viewName}`

        const mobxPath = './src/store/index.ts'
        const moduleMobxPath = `${moduleDir}/mobx.ts`
        const pkgMobxName = `${moduleName}${getName(packageName)}`
        const pkgViewName = `${getName(packageName)}${getName(viewName)}`

        inquirer
          .prompt([
            {
              type: 'list',
              name: 'viewType',
              message: '请选择视图类型',
              pageSize: 30,
              choices: [
                { name: '路由视图', value: 'router' },
                { name: '弹窗视图', value: 'modal' },
              ],
            },
            {
              type: 'list',
              name: 'cmpType',
              message: '请选择组件类型',
              pageSize: 30,
              choices: [
                { name: 'class 组件', value: 'class' },
                { name: 'function 组件', value: 'func' },
              ],
            },
          ])
          .then((answer) => {
            const viewType = answer.viewType
            const cmpType = answer.cmpType

            if (!fs.existsSync(moduleDir)) {
              fs.mkdirSync(moduleDir)
              console.log(chalk.green(`创建模块文件夹：${chalk.yellow(moduleDir)}`))

              // 创建模块mobx
              const moduleMobxTemp = fs.readFileSync(path.join(__dirname, '../template/module-mobx.tp')).toString()
              fs.writeFileSync(moduleMobxPath, moduleMobxTemp.replace(/\$moduleName\$/g, moduleName))
              console.log(chalk.green(`创建模块mobx：${chalk.yellow(moduleMobxPath)}`))

              // 把模块mobx注入进store状态库
              let mobx = fs.readFileSync(mobxPath).toString()
              mobx = `import ${moduleName} from '@/views/${newModuleName}/mobx'\n${mobx}`
              let exstr = `/** ${moduleName} 模块 mobx */\n  ...${moduleName},`
              const mathcs = mobx.match(/const.*store.*=.*{/)
              if (mathcs.length > 0) mobx = mobx.replace(mathcs[0], `${mathcs[0]}\n  ${exstr}`)
              fs.writeFileSync(mobxPath, mobx)
              console.log(chalk.green(`注入mobx：${chalk.yellow(mobxPath)}`))
            }

            if (!fs.existsSync(pkgDir)) {
              fs.mkdirSync(pkgDir)
              console.log(chalk.green(`创建package文件夹：${chalk.yellow(pkgDir)}`))

              // 在包下面创建mobx
              const pkgMobxPath = `${pkgDir}/mobx.ts`
              const pkgMobxTemp = fs.readFileSync(path.join(__dirname, '../template/pkg-mobx.tp')).toString()
              fs.writeFileSync(pkgMobxPath, pkgMobxTemp.replace(/\$pkgName\$/g, upperCase(pkgMobxName)))
              console.log(chalk.green(`创建package mobx：${chalk.yellow(pkgMobxPath)}`))

              // 把包mobx注入进模块mobx状态库
              let moduleMobx = fs.readFileSync(moduleMobxPath).toString()
              moduleMobx = `import ${pkgMobxName} from './${packageName}/mobx'\n${moduleMobx}`
              let exstr = `/** ${pkgMobxName} mobx */\n  ${pkgMobxName},`
              const matchs = moduleMobx.match(/const.*Store.*=.*{/)
              if (matchs.length > 0) moduleMobx = moduleMobx.replace(matchs[0], `${matchs[0]}\n ${exstr}`)
              fs.writeFileSync(moduleMobxPath, moduleMobx)
              console.log(chalk.green(`注入模块mobx：${chalk.yellow(moduleMobxPath)}`))
            }

            if (!fs.existsSync(viewDir)) {
              fs.mkdirSync(viewDir)
              console.log(chalk.green(`创建view文件夹：${chalk.yellow(viewDir)}`))
            }

            // 创建视图
            const viewPath = `${viewDir}/index.tsx`
            let viewStr = fs.readFileSync(path.join(__dirname, `../template/${viewType}-${cmpType}.tp`)).toString()
            viewStr = viewStr.replace(/\$viewName\$/g, pkgViewName)
            viewStr = viewStr.replace(/\$pkgMobxName\$/g, pkgMobxName)
            viewStr = viewStr.replace(/\$upMobxName\$/g, upperCase(pkgMobxName))
            fs.writeFileSync(viewPath, viewStr)
            console.log(chalk.green(`生成视图：${chalk.yellow(viewPath)}`))
            // 创建style
            const stylePath = `${viewDir}/style.ts`
            let styleStr = fs.readFileSync(path.join(__dirname, '../template/style-view.tp')).toString()
            fs.writeFileSync(stylePath, styleStr)
            console.log(chalk.green(`生成style：${chalk.yellow(stylePath)}`))

            if (viewType === 'router') {
              if (!fs.existsSync(viewDir)) {
                // 是否存在模块路由
                const routerPath = `./src/router/${newModuleName}.tsx`
                if (!fs.existsSync(routerPath)) {
                  const moduleRouterPath = path.join(__dirname, '../template/router.tp')
                  let routerTemp = fs.readFileSync(moduleRouterPath).toString()
                  fs.writeFileSync(routerPath, routerTemp.replace(/\$moduleName\$/g, upperCase(moduleName)))

                  const mainRouterPath = './src/router/index.tsx'
                  let mainRouterStr = fs.readFileSync(mainRouterPath).toString()
                  const constStr = `const ${upperCase(moduleName)}Router = loadable(() => import('./${newModuleName}'))`
                  const constReplaceStr = `${constStr}\n/**constviews*/`
                  const routerNodeStr = `<Route path="/${moduleName}" component={${upperCase(moduleName)}Router} />`
                  const routerNodeReplaceStr = `${routerNodeStr}\n          {/**views*/}`
                  mainRouterStr = mainRouterStr.replace(/\/\*\*constviews\*\//g, constReplaceStr)
                  mainRouterStr = mainRouterStr.replace(/\{\/\*\*views\*\/\}/g, routerNodeReplaceStr)
                  fs.writeFileSync(mainRouterPath, mainRouterStr)
                  console.log(chalk.green(`生成模块路由并注入主路由`))
                }

                // 注入模块路由
                let routerStr = fs.readFileSync(routerPath).toString()
                const constStr = `const ${pkgViewName}View = loadable(() => import('@/views/${newModuleName}/${packageName}/${viewName}'))`
                const constReplaceStr = `${constStr}\n/**constviews*/`
                const viewRouterPath = '`${path}/' + packageName + '/' + viewName + '`'
                const viewNodeStr = `<Route path={${viewRouterPath}}><KeepAlive name={${viewRouterPath}}><${pkgViewName}View /></KeepAlive></Route>`
                const viewNodeReplaceStr = `${viewNodeStr}\n      {/**views*/}`
                routerStr = routerStr.replace(/\/\*\*constviews\*\//g, constReplaceStr)
                routerStr = routerStr.replace(/\{\/\*\*views\*\/\}/g, viewNodeReplaceStr)
                fs.writeFileSync(routerPath, routerStr)
              }
            }
          })
      })

    program.parse(process.argv)
  } catch (e) {
    console.error(e.stack)
  }
})()
