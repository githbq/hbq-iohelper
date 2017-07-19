# io操作辅助功能

## 对文件常规操作辅助工具库

1. 所有异步方法均采用promise化接口
2. 对文件的增删改操作,递归文件路径操作 等等  
3. 未使用sync结尾的方法或者未说明是同步方法的一定是返回promise的异步方法
4. 如果参数名以`is`开头说明一定是`boolean`类型

## 安装

        $ npm install --save io-helper
## 用例

```javascript
import ioHelper from 'ioHelper'
```

### 属性

#### fs

    `fs`对应`import * as fs from 'fs-extra-promise'`

#### pathTool
    nodejs内置path模块的别名
`pathTool`对应`import * as pathTool from 'path'`

#### join

    路径拼接
`join(...path)` 

#### resolve
    获取路径拼接后的绝对路径
`resolve(...path)`

#### relative
    获取两个路径之前的相对路径
`relative(fromPath, toPath)` 

#### globby
    路径特征查找
`globby(patterns: string | Array<string>, options: any = {})`
- options `{ dot: true, silent: true, strict: false, ...options }`
- patterns:参见`glob`模块对应`pattern`参数 

#### renameSync(dirname, oldFilename, newFilename)

`renameSync(dirname, oldFilename, newFilename)`
- 同步重命名文件 /xx/yy/z.js
- dirname：文件的目录  /xx/yy/
- oldFilename: 文件原名 `z.js`
- newFilename: 新文件名 `new.js`

#### rename

`rename(dirname, oldFilename, newFilename)`
- **异步**重命名文件 /xx/yy/z.js
- dirname：文件的目录  /xx/yy/
- oldFilename: 文件原名 `z.js`
- newFilename: 新文件名 `new.js`

#### move

    移动文件或者目录
`move(fromPath, toPath, options?) `
- fromPath: 源路径 xxxx/xxx/1.txt
- toPath: 目的路径 自动创建路径   qqq/yyyy只移动不改名  或者 qqq/yyy/222.txt移动并且改名
- options: `{overwrite:true}` 覆盖同名文件

#### readline

    逐行读取文本
`readLine(filePath, cb)`
- filePath: 文件的路径
- cb: 读取每一行时的回调`cb(line)` line:每一行的字符串

#### findRecurseSync

    递归查找文件目录
`findRecurseSync(path:string, filter?:string)`
- filter: `filter = filter || '**/*.*'` `glob`库的`pattern`特性串
- 返回 `[{ pathName, filePath, relative, fileName, isFolder, isFile,fileName}]`

#### findRecurseTreeSync

    同步递归查找目录返回树形数据结构  
- 返回：`[{fileName,filePath,isFile,pathName,relative,chidren:[与自身相同结构]}]`

#### makeDir

    创建路径递归
`makeDir(directory)`
- directory：要创建的路径

#### makeDirSync

    同步创建路径递归
`makeDirSync(directory)`
- directory：要创建的路径

#### exists

    文件存在判断
`exists(path)` 
- 返回 `Promise<boolean>`

####  getDirName

    获取目录地址
`getDirName(path:string|[string])`
- 与`require('path').dirname` 使用一致
- 此方法加入是为了支持path参数 可以是一个数组

#### replaceFileNameExt

    替换文件类型
`replaceFileNameExt(filePath, newExt)`
- filePath: 文件路径 如 `/xxx/xxx/a.jpg`
- newExt: 新文件后缀 如 `.png`

#### copy

    异步复制文件
`copy(path, toPath)`
- path: 源路径
- toPath: 目标路径 

#### readFile

    读取文件内容
`readFile(path)`
- 返回 `Promise<string>`
- 默认用`utf编码`

#### readFileStream 

    读取一个文件返回流
`readFileStream(path:string) `
- path: 文件路径

#### saveFile

    保存文件
`saveFile(path, content)`

####   delete

    删除文件或文件夹
`delete(path)`
- path: 文件夹路径 或者 具体的文件路径

#### writeFile

    写文件或者在新行追加文件
`async writeFile(path, content:string, isAppend = false)`
- 需要使用 await 调用
- path: 文件路径
- content: 字符串内容
- isAppend: 是否追加否则覆盖 默认是覆盖

#### replaceSep

    将反斜杠 替换为正斜杠
`replaceSep(path)`
- path: 文件路径


