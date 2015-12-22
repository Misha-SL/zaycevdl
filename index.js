var request = require("request");
var cheerio = require('cheerio');
var http = require("http");
var fs = require("fs");
var qs = require('querystring');

var url="http://zaycev.net/auth/signin.php";
/*request({
    url: url,
    method: "POST",
    json: true,   // <--Very important!!!
    headers: {
//'Host': 'zaycev.net',
//'Connection': 'keep-alive',
//'Pragma': 'no-cache',
//'Cache-Control': 'no-cache',
//"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*"+"/*;q=0.8",
//'Origin': 'http://evil.com/',
//'Upgrade-Insecure-Requests': '1',
//'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',

'Content-Type': "application/x-www-form-urlencoded",
//'Referer': 'http://zaycev.net/auth/login.php?badCredentials=1',
//'Accept-Encoding': 'gzip, deflate',
//'Accept-Language': 'en-US,en;q=0.8,ru;q=0.6,ja;q=0.4',
//'Cookie': 'provider=; route=cccaa6c3f917d03dd80f937dd0fd8c3d; euid=49b9ed289e6fbb35619b1ba63c0d677f; JSESSIONID=HZ-null-F45FDF0E5601481D9DE6DBB28FEC2735; __utmt=1; provider=; znbdc="H4sIAAAAAAAAAAMAAAAAAAAAAAA="; dlses=EoYLyhT2KgBMUlusruRC7Ug93OBIrGN4JC2B7rNkJV0Ru4C3c3AcATbjK-rWYEnHjqE2_Tbh_juSkPDxwxYwQlsxBQZyqGcp; __utma=84938386.900196008.1450785784.1450785784.1450790371.2; __utmb=84938386.16.10.1450790371; __utmc=84938386; __utmz=84938386.1450790371.2.2.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)'

    },
    body: { j_username: 'hx0001@yandex.ru', j_password: 'FD9QAHept7'}
}, function (error, response, body){
    console.log(response);
    var server = http.createServer(function(request, response) {
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(response);
		response.end();
	});
	server.listen(8080);
});*/
/*
var querystring = require('querystring');
var http = require('http');

var data = querystring.stringify({ j_username: 'hx0001@yandex.ru', j_password: 'FD9QAHept7'});

var options = {
    host: 'http://zaycev.net',
    port: 80,
    path: '/auth/sigbin.php',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
    }
};

var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log("body: " + chunk);

    });
});

req.write(data);
req.end();
*/
/*
var request = require('request');
request.post({
	headers: {'content-type' : 'application/x-www-form-urlencoded'},
	url: url,
	body: "j_username=hx0001@yandex.ru&j_password=FD9QAHept7"
}, function(error, response, body){
	
	if(req.url=='/index.html' || req.url=='/') {
    fs.readFile('./index.html',function(err,data){
    });
	var server = http.createServer(function(req, res) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.write(JSON.stringify(response));
		res.end();
	});
	server.listen(8080);
});
*/

var z = {
	getSearchTracks: function(html){
		var $ = cheerio.load(html);
		var result = [];
		$(".search-page__tracks .musicset-track-list__items>div").map(function(item){
			var name = $(this).find('.musicset-track__track-name a').text();
			var artist = $(this).find('.musicset-track__artist a').text();
			var duration = $(this).find('.musicset-track__duration').text();
			var jsonlink = $(this).attr("data-url");
			result.push({
				track: name,
				artist: artist,
				duration: duration,
				jsonlink: jsonlink
			})
		});
		return result;
	}
}
if(!String.prototype.startsWith){
    String.prototype.startsWith = function (str) {
        return !this.indexOf(str);
    }
}
if(!String.prototype.format){
    String.prototype.format = function (obj) {
    	var _this = this+"";
    	for(var key in obj){
    		_this = _this.replace(new RegExp("{"+key+"}", "g"), obj[key]);
    	}
        return _this;
    }
}
var server = http.createServer(function(req, res) {

	if(req.url=='/index.html' || req.url=='/') {
		fs.readFile('./index.html',function(err,data){
			res.writeHead(200, {"Content-Type": "text/html"});
			res.end(data);
		});
	}else
	if(req.url.startsWith("/search")) {

		var query = {};
		req.url.split("?").slice(1).join("?").split("&").map(function(i){ var a = i.split("="); query[a[0]] = a[1]; });
		//query.q
		var url = 'http://zaycev.net/search.html?query_search='+query.q;
		request(url, function(e, response, body){
			if(!e){
				console.log(body.substr(0,200))
				//musicset-track__track-name
				res.writeHead(200, {"Content-Type": "text/html"});
				//res.end(body);
				var content = z.getSearchTracks(body).map(function(i){
					return "<a href='/dl?id={jsonlink}'>{artist} - {track} ({duration})</a><br>".format(i);
				}).join("");
				res.end(content);
			}else throw e;
			
		});
//request(url).pipe(res);
		//res.writeHead(200, {"Content-Type": "text/html"});
		//res.write(JSON.stringify(query));
	}else
	if(req.url.startsWith("/dl")) {
		var query = {};
		req.url.split("?").slice(1).join("?").split("&").map(function(i){ var a = i.split("="); query[a[0]] = a[1]; });
		//query.q
		var url = 'http://zaycev.net'+query.id;
		request(url, function(e, response, body){
			if(!e){
				var data = JSON.parse(body);
				//musicset-track__track-name
				res.writeHead(302, {"location": data.url});
				res.end(data.url);
			}else throw e;
			
		});
	}else
	/*res.writeHead(200, {"Content-Type": "text/html"});
	res.write(JSON.stringify(response));
	res.end();*/
	res.end("<h1>404: '"+req.url+"'</h1><a href='/'>goto home</a>");
});
server.listen(8080);