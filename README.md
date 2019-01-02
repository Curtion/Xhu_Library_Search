# 说明

适用于西华大学图书检索系统，理论上适用于汇文软件V5.5版本，本项目只用作学习目的，请勿用于非法用途。其中`back-end`是后端文件夹，`front-end`是前端文件夹，请注意后端环境依赖于nodejs。

# 后端安装方法

Clone或者下载本项目，默认你已经安装nodejs和npm

1. 使用`npm install`安装依赖包

2. 使用`node index.js`开始运行，默认端口为3000，请按需修

# 前端安装方法

服务器安装Nginx或者apache，上传代码到web服务目录就行了。

注意：修改`search.html`和`info.html`其中的ajax请求地址改为你的服务器地址，因为是练手项目后端没有写授权部分。

# 数据穿透

把后端部署到一个具有校园内网的服务器上，然后在有公网ip的服务器上安装[frp](https://github.com/fatedier/frp)服务端，在内网服务器上[frp](https://github.com/fatedier/frp)客户端，配置完成[frp](https://github.com/fatedier/frp)服务后就算正式完成了。

# 后端API说明

搜索：`"/search/?strSearchType=" + strSearchType + "&match_flag=" + match_flag + "&strText=" + strText + "&doctype=" + doctype + "&with_ebook=" + with_ebook + "&page=" + page`

其中字段含义查看/beck-end/Search_Key.txt文件

书籍信息：`"/info/?marc_no=" + id`

其中id为书籍的唯一识别码，在搜索api返回的json中含有。

# 演示

[http://lib.3gxk.net](http://lib.3gxk.net)

(内网服务器为树莓派，可能存在无法搜索的结果)