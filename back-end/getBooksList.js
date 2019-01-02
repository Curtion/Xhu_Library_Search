const request = require('superagent')//http访问器
const cheerio = require('cheerio');//html结果选择器
const Entities = require('html-entities').XmlEntities;//解析html中的编码
entities = new Entities();
function getBooksList(homeurl,callback){
    //获得搜索结果
    var items = {
        bookslist:[],
        pagei:1,
        page:1,
        status:0
    };
    request.get(homeurl)
        .end(function(err,res){
            if(err){
                return console.error(err);
            }
            let body_text = entities.decode(res.text);
            let $ = cheerio.load(body_text);
            $('.book_list_info').each(function(index, element) {
                items.bookslist.push({
                    id:"ID",
                    title:"书籍书名",
                    type:"书籍类型",
                    total:"馆藏数量",
                    available:"可借数量",
                    url:"书籍链接",
                    responsible:"责任人",
                    publishing:"出版信息",
                    number:"索书号"
                })
                items.bookslist[index].id =  $(element).find('h3 a').text().split(".")[0];
                items.bookslist[index].title =  $(element).find('h3 a').text().split(".")[1];
                items.bookslist[index].type =  $(element).find('h3 span').text();
                items.bookslist[index].total =  $(element).find('p span').text().split("\n\t")[0].trim();
                items.bookslist[index].available =  $(element).find('p span').text().split("\n\t")[1].trim();
                items.bookslist[index].url = $(element).find('a').attr('href').replace(/[^0-9]/ig,"")
                items.bookslist[index].responsible = entities.decode($(element).find('p').html().split("\n\t")[1]).match(/<\/span>([\s\S]*?)<br>/)[1].trim();//责任人
                items.bookslist[index].publishing = entities.decode($(element).find('p').html().split("\n\t")[2]).match(/([\s\S]*?)<br>/)[1].trim();//出版信息
                items.bookslist[index].number = entities.decode($(element).find('h3').html()).match(/<\/a>([\s\S]*)/)[1].trim();//索书号
                items.status = 1;
            });
            if ($(".pagination font[color='red']").text()!=""){
                items.pagei = $(".pagination font[color='red']").text();
                items.page = $(".pagination font[color='black']").text();
            }
            callback(items);
        })
}

var getlocation=function(endres){
    return new Promise(function(resolve, reject) {
    //获取定位地址
        (function loop(index) {
            if (index<endres.tabs2.length) {
                if(endres.tabs2[index].location != undefined){
                    var id = endres.tabs2[index].location.match(/pos_([\s\S]*)/)[1]
                    getlocationid(id).then(function(locationdata){
                        endres.tabs2[index].location = locationdata
                        index++
                        loop(index);
                    })
                }else{
                    endres.tabs2[index].location = ""
                    index++
                    loop(index);
                }
            } else {
                resolve(endres)
            }
        })(0);

    });
}

var getlocationid=function(id){
    return new Promise(function(resolve, reject) {
        //同步获取定位地址,前面套有套有循环不能使用异步,数据会乱套
        request.get('http://202.115.151.118:8080/opac/ajax_get_rfid_shelf.php?bookid=' + id)
        .then(req => {
            locationdata = req.text.match(/([\s\S]*)<!DOCTYPE/)[1].replace(/\s+/g,"")
            resolve(locationdata)
        })
        .catch(err => {
            console.log(err)
        });
    });
}

var getdoubaninfo=function(isbn){
    return new Promise(function(resolve, reject) {
        //同步获取豆瓣书籍信息
        request.get('http://202.115.151.118:8080/opac/ajax_douban.php?isbn=' + isbn)
        .then(req => {
            resolve(req)
        })
        .catch(err => {
            console.log(err)
        });
    });
}
var getbookinfo=function(homeurl){
    //获取书籍详细信息
    var items = {
        book_info:[],//书籍信息
        tabs2:[],//馆藏信息
        status:0
    };
    return new Promise(function(resolve, reject) {
        request.get(homeurl)
        .end(function(err,res){
            if(err){
                return console.error(err);
            }
            let body_text = entities.decode(res.text);
            let $ = cheerio.load(body_text);
            $('.whitetext').each(function(index, element) {
                items.tabs2.push({
                    number: "索书号",
                    code_number: "条形码",
                    nian: "年卷期",
                    address: "校区—馆藏地",
                    bookstatus: "书刊状态",
                    back_address: "还书位置",
                    location: "定位"
                })
                items.tabs2[index].number = $(element).children().first().text().trim()
                items.tabs2[index].code_number = $(element).children().first().next().text().trim()
                items.tabs2[index].nian = entities.decode($(element).children().first().next().next().text()).trim()
                items.tabs2[index].address = entities.decode($(element).children().first().next().next().next().text()).trim()
                items.tabs2[index].bookstatus = entities.decode($(element).children().first().next().next().next().next().text()).trim()
                items.tabs2[index].back_address = entities.decode($(element).children().first().next().next().next().next().next().text()).trim()
                items.tabs2[index].location = $(element).find("td[width='10%']").children().first().attr("id")
            });

            $('.booklist').each(function(index, element) {
                text = $(element).children().first().text()
                body = $(element).children().first().next().text()
                if(text != "豆瓣简介：" && text != ""){
                    if(text == "ISBN及定价:"){
                        isbn = body.match(/([\s\S]*?)\//)[1]
                        var num= isbn.replace(/[^0-9]/ig,"");
                        items.book_info.push({
                            isbn:num
                        })
                    }
                    items.book_info.push({
                        [text]:body
                    })
                }
            });
            getdoubaninfo(items.book_info[2].isbn).then(function(value){
                douban = JSON.parse(unescape(value.text.replace(/\\u/g, '%u').replace(/[\\]/g,'')))
                items.book_info.push({
                    "作者介绍:":douban.author_intro
                })
                items.book_info.push({
                    "豆瓣简介:":douban.summary
                })
                items.book_info.push({
                    img:douban.image
                })
                items.book_info.push({
                    link:douban.link
                })
                items.status = 1
                resolve(items)
            })
        })
    });
}

module.exports = {
    getbookinfo,
    getBooksList,
    getlocation
   }