const express = require('express');//创建web服务器
const app =express();//web api
const url = require('url')//url模块
const getbook = require('./getBooksList');//获取结果

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
 });

app.get('/search', function(req, res, next) {
    var fullURL = req.protocol + '://' + req.get('host') + req.originalUrl//构造完整url请求路径
    var strSearchType = url.parse(fullURL,true).query.strSearchType;//strSearchType：搜索类型
    var match_flag = url.parse(fullURL,true).query.match_flag;//match_flag：匹配类型
    var strText = encodeURI(url.parse(fullURL,true).query.strText);//strText：搜索内容
    var doctype = url.parse(fullURL,true).query.doctype;//doctype：文档类型
    var with_ebook = url.parse(fullURL,true).query.with_ebook;//with_ebook：显示电子书刊
    var page = url.parse(fullURL,true).query.page;//page:页码
    var homeurl = "http://202.115.151.118:8080/opac/openlink.php?strSearchType=" + strSearchType + "&match_flag=" + match_flag + "&historyCount=1&strText=" + strText + "&doctype=" + doctype + "&with_ebook=" + with_ebook + "&displaypg=20&showmode=list&sort=CATA_DATE&orderby=desc&dept=ALL&page=" + page;
    getbook.getBooksList(homeurl,function(endres){
        res.setHeader('Content-Type', 'text/plain');
        res.json(endres);
    });
});

app.get('/info', function(req, res) {
    res.setHeader('Content-Type', 'text/plain')
    var fullURL = req.protocol + '://' + req.get('host') + req.originalUrl//构造完整url请求路径
    var marc_no = url.parse(fullURL,true).query.marc_no;//marc_no:书籍的唯一识别码
    var homeurl = "http://202.115.151.118:8080/opac/item.php?marc_no=" + marc_no;
    getbook.getbookinfo(homeurl).then(function(value){
        return getbook.getlocation(value)
    }).then(function(jsondata){
        res.json(jsondata);
    })
});

app.listen(3000, function() {
    //启动服务器,绑定3000端口
    console.log('app is listening at port 3000');
});

