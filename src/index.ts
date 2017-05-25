/**
 * io操作帮助库
 */
import * as pathTool from 'path'
import * as fs from 'fs-extra-promise'
import * as  readlinePromise from 'readline-promise'
import * as  _ from 'lodash'
import * as fileSystem from 'file-system'
import * as globby from 'globby'
const ioHelper = {
    fs,
    pathTool,
    /**
     * 处理路径 
     * @param dirs 
     */
    processDir(...dirs): string {
        if (dirs.length > 0) {
            if (dirs.length === 1) {
                return pathTool.join.apply(null, [].concat(dirs[0]))
            } else {
                return pathTool.join.apply(null, dirs)
            }
        }
    },
    /**
     * 路径拼接
     * @param path 
     */
    join(...path) {
        return ioHelper.replaceSep(pathTool.join.apply(null, path))
    },
    /**
     * 获取路径拼接后的绝对路径
     * @param path 
     */
    resolve(...path) {
        return ioHelper.replaceSep(pathTool.join.apply(null, path))
    },
    /**
     * 获取两个路径之前的相对路径
     * @param fromPath 
     * @param toPath 
     */
    relative(fromPath, toPath) {
        return ioHelper.replaceSep(pathTool.join(ioHelper.processDir(fromPath), ioHelper.processDir(toPath)))
    },
    /**
     * 路径特征查找
     * @param patterns 
     * @param options 
     */
    globby(patterns: string | Array<string>, options: any = {}) {
        return globby(patterns, { dot: true, silent: true, strict: false, ...options })
    },
    /**
     * 
     * @param {目录地址} dirname 
     * @param {文件名:xxx.txt} oldFilename 
     * @param {新文件名} newFilename 
     */
    renameSync(dirname, oldFilename, newFilename) {
        dirname = ioHelper.processDir(dirname)
        let oldPath = pathTool.join(dirname, oldFilename)
        let newPath = pathTool.join(dirname, newFilename)
        fs.renameSync(oldPath, newPath)
    },
    /**
     * 
     * @param {目录地址} dirname 
     * @param {文件名:xxx.txt} oldFilename 
     * @param {新文件名} newFilename 
     */
    rename(dirname, oldFilename, newFilename) {
        dirname = ioHelper.processDir(dirname)
        let oldPath = pathTool.join(dirname, oldFilename)
        let newPath = pathTool.join(dirname, newFilename)
        return fs.renameAsync(oldPath, newPath)
    },
    /**
     * 换行读取文本文件
     * @param {*文件路径 } filePath 
     */
    readLine(filePath, cb) {
        filePath = ioHelper.processDir(filePath)
        const lines = []
        return readlinePromise.createInterface({
            terminal: false,
            input: fs.createReadStream(filePath)
        })
            .each(function (line) {
                if (cb) {
                    const cbResult = cb(line)
                    if (false !== cbResult) {
                        lines.push(line)
                    } else {
                        lines.push(cbResult || '')
                    }
                } else {
                    lines.push(line)
                }
            }).then((count) => {
                return { count: count.lines, lines }
            })
    },
    /**
     * 递归查找文件目录
     * @param {一个字符串,或者一个字符串数组,会自动join} paths 
     * @param {筛选字符串} filter 
     */
    findRecurseSync(path, filter) {
        path = ioHelper.processDir(path)
        let files = []
        filter = filter || '**/*.*'
        fileSystem.recurseSync(path, filter, (filePath, relative, fileName) => {
            let pathName = ioHelper.getDirName(filePath)
            files.push({ pathName, filePath, relative, fileName, isFolder: !fileName ? true : undefined, isFile: fileName ? true : undefined })
        })
        return files
    },
    /**
     * 递归查找目录返回树形数据结构  [{fileName,filePath,isFile,pathName,relative,chidren:[]}]
     * @param {*} paths 
     * @param {*} filter 
     */
    findRecurseTreeSync(path, filter) {
        path = ioHelper.processDir(path)
        const result = ioHelper.findRecurseSync.apply(ioHelper, arguments)
        return ioHelper.transformPathToTree(result)
    },
    /**
    * 将路径 对象数组 转换为 树形结构
    * [{fileName,filePath,isFile,pathName,relative,children:[]}]
    */
    transformPathToTree(arr, key = 'filePath', parentKey?) {
        const refArr = []
        //本次取得的数组
        arr.forEach(n => {
            const hasParent = _.some(arr, m => {
                let result = n[key] !== m[key] && n[key].indexOf(m[key]) === 0
                return result
            })
            if (!hasParent && ((!parentKey) || (n[key].indexOf(parentKey) === 0))) {
                refArr.push(n)
            }
        })
        //放入下一次递归中的数组
        const nextArr = []
        arr.forEach((n) => {
            if (_.indexOf(refArr, n) === -1) {
                nextArr.push(n)
            }
        })
        refArr.forEach(n => {
            if (n.isFolder) {
                n.children = ioHelper.transformPathToTree(nextArr, key, n[key])
            }
        })
        return _.sortBy(refArr, (n) => { return n.isFile ? 1 : 0 })
    },
    //创建路径递归
    makeDir(directory) {
        return fs.ensureDirAsync(ioHelper.processDir(directory))
    },
    //创建路径递归 同步
    makeDirSync(directory) {
        return fs.ensureDirSync(ioHelper.processDir(directory))
    },
    //文件存在判断
    exists(path) {

        return fs.existsAsync(ioHelper.processDir(path))
    },
    //获取目录地址
    getDirName(path) {
        path = ioHelper.processDir(path)
        return pathTool.dirname(path)
    },
    //获取文件名 如:a.jpg
    getBaseName(path, ext) {
        path = ioHelper.processDir(path)
        return pathTool.basename(path, ext)
    },
    //获取文件的拓展名如  :  .jpg
    getExtName(path) {
        return pathTool.extname(path)
    },
    //替换文件类型
    replaceFileNameExt(filePath, newExt) {
        filePath = ioHelper.processDir(filePath)
        let oldExt = ioHelper.getExtName(filePath)
        let dirName = ioHelper.getDirName(filePath)
        let fileName = ioHelper.getBaseName(filePath, oldExt)
        return ioHelper.pathTool.join(dirName, fileName + newExt)
    },
    //异步复制文件
    copy(path, toPath, options) {
        path = ioHelper.processDir(path)
        toPath = ioHelper.processDir(toPath)
        return fs.copyAsync(path, toPath, options || {})
    },
    //读取文件内容
    readFile(path) {
        return fs.readFileAsync(ioHelper.processDir(path), 'utf8')
    },
    readFileStream(path) {
        return fs.readFileAsync(ioHelper.processDir(path))
    },
    //保存文件
    saveFile(path, content) {
        path = ioHelper.processDir(path)
        if (_.isObject(content)) {
            return fs.outputJSONAsync(path, content)
        }
        return fs.outputFileAsync(path, content || '')

    },
    //删除文件或文件夹
    delete(path) {
        path = ioHelper.processDir(path)
        return fs.removeAsync(path)
    },
    //创建或覆盖或追加文件
    async writeFile(path, content, isAppend = false) {
        path = ioHelper.processDir(path)
        if (isAppend) {
            let oldContent = await ioHelper.readFile(path)
            content = `${oldContent}\n${content}`
        }
        return ioHelper.saveFile(path, content)
    },
    //将反斜杠 替换为正斜杠
    replaceSep(path) {
        return path.replace(/\\/g, '/')
    },
    //获取路径的文件信息 recursive:bool 是否递归查找
    async getDirectoryInfo(path, recursive) {
        path = ioHelper.processDir(path)
        let fileList = []
        await ioHelper.walk(path, fileList, recursive)
        return fileList
    },
    async walk(path, fileList = [], recursive?) {
        path = ioHelper.processDir(path)
        let dirList = await fs.readdirAsync(path)
        for (let item of dirList) {
            const pathInfo = await fs.statAsync(path + '/' + item)
            if (pathInfo.isFile()) {
                fileList.push({ file: path + '/' + item })
            }
            if (pathInfo.isDirectory()) {
                fileList.push({ folder: path + '/' + item })
                recursive && await ioHelper.walk(path + '/' + item, fileList)
            }
        }
    }
}
export default ioHelper