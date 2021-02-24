"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const path = require("path");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const chalk = require("chalk");
const prettier = require("prettier");
const utils_1 = require("./utils");
const packageFilePath = path.join(__dirname, '..', 'package.json');
const packageInfo = JSON.parse(fs.readFileSync(packageFilePath, 'utf8'));
const currentVersion = packageInfo.version;
const prettierConfig = {
    parser: 'babel',
    printWidth: 200,
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    trailingComma: 'es5',
    bracketSpacing: true,
    arrowParens: 'always',
};
program.version(currentVersion).usage('[命令] [配置项]');
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            program
                .command('view')
                .description('添加一个视图')
                .arguments('<moduleName> <packageName> <viewName>')
                .action((moduleName, packageName, viewName) => {
                const newModuleName = `module-${moduleName}`;
                const rootViewDir = './src/views';
                const moduleDir = `${rootViewDir}/${newModuleName}`;
                const pkgDir = `${moduleDir}/${packageName}`;
                const viewDir = `${pkgDir}/${viewName}`;
                const mobxPath = './src/store/index.ts';
                const moduleMobxPath = `${moduleDir}/mobx.ts`;
                const pkgMobxName = `${moduleName}${utils_1.getName(packageName)}`;
                const pkgViewName = `${utils_1.getName(packageName)}${utils_1.getName(viewName)}`;
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
                    const viewType = answer.viewType;
                    const cmpType = answer.cmpType;
                    if (!fs.existsSync(moduleDir)) {
                        fs.mkdirSync(moduleDir);
                        console.log(chalk.green(`创建模块文件夹：${chalk.yellow(moduleDir)}`));
                    }
                    if (!fs.existsSync(moduleMobxPath)) {
                        const moduleMobxTemp = fs.readFileSync(path.join(__dirname, '../template/module-mobx.tp')).toString();
                        fs.writeFileSync(moduleMobxPath, moduleMobxTemp.replace(/\$moduleName\$/g, moduleName));
                        console.log(chalk.green(`创建模块mobx：${chalk.yellow(moduleMobxPath)}`));
                        let mobx = fs.readFileSync(mobxPath).toString();
                        mobx = `import ${moduleName} from '@/views/${newModuleName}/mobx'\n${mobx}`;
                        let exstr = `/** ${moduleName} 模块 mobx */\n  ...${moduleName},`;
                        const mathcs = mobx.match(/const.*store.*=.*{/g);
                        if (mathcs.length > 0)
                            mobx = mobx.replace(mathcs[0], `${mathcs[0]}\n${exstr}`);
                        mobx = prettier.format(mobx, prettierConfig);
                        fs.writeFileSync(mobxPath, mobx);
                        console.log(chalk.green(`注入mobx：${chalk.yellow(mobxPath)}`));
                    }
                    if (!fs.existsSync(pkgDir)) {
                        fs.mkdirSync(pkgDir);
                        console.log(chalk.green(`创建package文件夹：${chalk.yellow(pkgDir)}`));
                    }
                    const pkgMobxPath = `${pkgDir}/mobx.ts`;
                    if (!fs.existsSync(pkgMobxPath)) {
                        const pkgMobxTemp = fs.readFileSync(path.join(__dirname, '../template/pkg-mobx.tp')).toString();
                        fs.writeFileSync(pkgMobxPath, pkgMobxTemp.replace(/\$pkgName\$/g, utils_1.upperCase(pkgMobxName)));
                        console.log(chalk.green(`创建package mobx：${chalk.yellow(pkgMobxPath)}`));
                        let moduleMobx = fs.readFileSync(moduleMobxPath).toString();
                        moduleMobx = `import ${pkgMobxName} from './${packageName}/mobx'\n${moduleMobx}`;
                        let exstr = `/** ${pkgMobxName} mobx */\n  ${pkgMobxName},`;
                        const matchs = moduleMobx.match(/const.*Store.*=.*{/g);
                        if (matchs.length > 0)
                            moduleMobx = moduleMobx.replace(matchs[0], `${matchs[0]}\n ${exstr}`);
                        moduleMobx = prettier.format(moduleMobx, prettierConfig);
                        fs.writeFileSync(moduleMobxPath, moduleMobx);
                        console.log(chalk.green(`注入模块mobx：${chalk.yellow(moduleMobxPath)}`));
                    }
                    if (!fs.existsSync(viewDir)) {
                        fs.mkdirSync(viewDir);
                        console.log(chalk.green(`创建view文件夹：${chalk.yellow(viewDir)}`));
                    }
                    const viewPath = `${viewDir}/index.tsx`;
                    let viewStr = fs.readFileSync(path.join(__dirname, `../template/${viewType}-${cmpType}.tp`)).toString();
                    viewStr = viewStr.replace(/\$viewName\$/g, pkgViewName);
                    viewStr = viewStr.replace(/\$pkgMobxName\$/g, pkgMobxName);
                    viewStr = viewStr.replace(/\$upMobxName\$/g, utils_1.upperCase(pkgMobxName));
                    fs.writeFileSync(viewPath, viewStr);
                    console.log(chalk.green(`生成视图：${chalk.yellow(viewPath)}`));
                    const stylePath = `${viewDir}/style.ts`;
                    let styleStr = fs.readFileSync(path.join(__dirname, `../template/style-${viewType}.tp`)).toString();
                    fs.writeFileSync(stylePath, styleStr);
                    console.log(chalk.green(`生成style：${chalk.yellow(stylePath)}`));
                    if (viewType === 'router') {
                        const routerPath = `./src/router/${newModuleName}.tsx`;
                        if (!fs.existsSync(routerPath)) {
                            const moduleRouterPath = path.join(__dirname, '../template/router.tp');
                            let routerTemp = fs.readFileSync(moduleRouterPath).toString();
                            fs.writeFileSync(routerPath, routerTemp.replace(/\$moduleName\$/g, utils_1.upperCase(moduleName)));
                            const mainRouterPath = './src/router/index.tsx';
                            let mainRouterStr = fs.readFileSync(mainRouterPath).toString();
                            const constStr = `const ${utils_1.upperCase(moduleName)}Router = loadable(() => import('./${newModuleName}'))`;
                            const constMatchs = mainRouterStr.match(/const.*Router.*=.*loadable\(\(\).*=>.*import\(.*\)\)/g);
                            if (constMatchs) {
                                const tag = constMatchs[constMatchs.length - 1];
                                mainRouterStr = mainRouterStr.replace(tag, `${tag}\n${constStr}`);
                            }
                            else {
                                const importMatchs = mainRouterStr.match(/import.*from.*/g);
                                const tag = importMatchs[importMatchs.length - 1];
                                mainRouterStr = mainRouterStr.replace(tag, `${tag}\n\n// 模块路由\n${constStr}`);
                            }
                            const routerNodeStr = `<Route path="/${moduleName}" component={${utils_1.upperCase(moduleName)}Router} />`;
                            const routerMatchs = mainRouterStr.match(/<\/Switch>/g);
                            if (routerMatchs.length <= 0) {
                                throw new Error('主路由没有找到Switch标签');
                            }
                            mainRouterStr = mainRouterStr.replace(routerMatchs[0], `${routerNodeStr}\n</Switch>`);
                            mainRouterStr = prettier.format(mainRouterStr, prettierConfig);
                            fs.writeFileSync(mainRouterPath, mainRouterStr);
                            console.log(chalk.green(`生成模块路由并注入主路由`));
                        }
                        let routerStr = fs.readFileSync(routerPath).toString();
                        const constStr = `const ${pkgViewName}View = loadable(() => import('@/views/${newModuleName}/${packageName}/${viewName}'))`;
                        const constMatchs = routerStr.match(/const.*View.*=.*loadable\(\(\).*=>.*import\(.*\)\)/g);
                        if (constMatchs) {
                            const tag = constMatchs[constMatchs.length - 1];
                            routerStr = routerStr.replace(tag, `${tag}\n${constStr}`);
                        }
                        else {
                            const importMatchs = routerStr.match(/import.*from.*/g);
                            const tag = importMatchs[importMatchs.length - 1];
                            routerStr = routerStr.replace(tag, `${tag}\n\n// 页面路由\n${constStr}`);
                        }
                        const viewRouterPath = '`${path}/' + packageName + '/' + viewName + '`';
                        const viewNodeStr = `<Route path={${viewRouterPath}}><KeepAlive name={${viewRouterPath}}><${pkgViewName}View /></KeepAlive></Route>`;
                        const routerMatchs = routerStr.match(/<\/Switch>/g);
                        if (routerMatchs.length <= 0) {
                            throw new Error('模块路由没有找到Switch标签');
                        }
                        routerStr = routerStr.replace(routerMatchs[0], `${viewNodeStr}\n</Switch>`);
                        routerStr = prettier.format(routerStr, prettierConfig);
                        fs.writeFileSync(routerPath, routerStr);
                        console.log(chalk.green(`注入模块路由`));
                    }
                });
            });
            program.parse(process.argv);
        }
        catch (e) {
            console.error(e.stack);
        }
    });
})();
//# sourceMappingURL=cmd.js.map