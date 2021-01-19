# 自用项目文件生成脚手架

## 安装

```bash
// npm
npm i -g cr-view-cli

// 或yarn
yarn global add cr-view-cli
```

## 命令 

创建视图 

```bash
crview view <moduleName> <packageName> <viewName>
```

创建一个视图，参数为 required:`moduleName` required:`packageName` required:`viewName`  
具体命令例如：`crview view system role list`

规范：  
moduleName： `只能`是单个英文单词  
packageName： 可以为多个英文单词组合，全小写，单词之间以`-`分割，例如：user-manage、wechat-user-manage  
viewName： 定为表达视图实际意义的英文单词，尽量为单个因为单词，如：list、detail、add、edit 等

执行命令会自动创建如下文件结构：

```
├── src
│   ├── views
│       ├── module-system           // 模块文件夹(存在就不创建)
│           ├── role                // 功能文件夹(存在就不创建)
│               ├── list            // 页面文件夹
│                   ├── index.tsx   // 视图文件
│                   ├── style.ts    // 视图样式文件
│               ├── mobx.ts         // 功能mobx库，功能下面的多个视图共享一个mobx库(存在就不创建)
│           ├── mobx.ts             // 模块mobx文件，只是导出模块下所有mobx(存在就不创建)
```