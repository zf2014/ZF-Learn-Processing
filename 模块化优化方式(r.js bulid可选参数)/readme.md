如何使用r.js来优化脚本(合并/压缩)---node平台上:
一.安装
npm install -g requirejs


二.执行命令

r.js -o path/bulid.js  [options]


上面的[options]和bulid.js实际上是两种表述形式,都是为了设置优化控制属性.
[options]:更适合于调试
bulid.js:更适合于正式部署



三[重点].属性说明.
可选配置项说明:https://github.com/jrburke/r.js/blob/master/build/example.build.js

文件目录相对关系:
[1]appDir	-->如果存在bulid.js,项目相对于该文件目录,否则相对于命令行执行目录
[2]baseUrl   -->相对于appDir,如果不存在appDir则同上
[3]Module IDs  -->相对于baseUrl,如果不存在appDir则同上


1)mainConfigFile: {string} file    -->相对于appDir,如果不存在appDir则同上
为了保证优化配置和main.js中涉及的配置两者一致, 可以通过该属性来指定配置项.
该文件格式:
require.config({
    optimize : "none"
    ,paths: {
        button : "./ui/btn"
    }
});



我们开头提到关于优化控制属性时,只提到了bulid.js和[options]两种,其实设置的属性同样可以起到控制作用.
但是这里的优先级最低,即如果之前出现的配置将不会被覆盖.


2)paths : {object} map
映射Module ID 和 File 映射关系.
因为r.js从CDN中加载资源文件,但是如果main.js中需要这样的资源,那么r.js将无法正常运行.此时需要提供一个
表示告诉r.js,目标Module ID是一个CDN资源文件,无需优化操作.
paths:{
	...
	jquery : "empty:"			//-->empty:
	...
}



3)keepBuildDir: {boolean} true 	每次r.js运行时buildDir是否都需要新建.
对大型项目,如果只是资源文件未做修改,那么完全可以将该配置项设置为false,这样可以提高效率.


4)optimize: {string} "uglify" 压缩机制选择:["uglify" , "uglify2" , "closure" , "closure.keepLines" , "none"]


5)skipDirOptimize: {boolean} false 是否需要跳过build dir中非目标资源文件的压缩处理.
默认设置[false]下,会把build dir中所有资源文件都进行一定形式的压缩.对于部分项目,我们只需要
优化后的目标资源文件,那么只需要压缩该目标文件即可,这样便可以大大提升优化效率..


6)uglify: {object} default 配置uglify压缩属性.结合uglifyJS中关于可选参数来理解.

7)optimizeCss: {string} "none" css文件优化策略选择["standard","standard.keepLines","none","standard.keepComments","standard.keepComments.keepLines"]
8)cssImportIgnore: {string} "a.css,b.css" 目标css中@import "a.css"和@import "b.css"不做inline处理


9)modules: {array}		配置优化目标文件.
[
	{
		name : "some1/main.js",
		override: {						//覆盖原有的优化策略.可定制优化方案
			optimize : "none"
		}
		
	},
	{
		name : "some2/main.js",
		override: {
			optimize : "uglify2"
		}
		
	}

]




