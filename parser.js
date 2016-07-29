var http = require('http'),
    url = require('url'),
    request = require('request'),
    cheerio = require('cheerio');


http.createServer(function (req, res) {


    var mainUrl = 'https://ru.wikipedia.org/wiki/Df';
    var domain = url.parse(mainUrl).protocol + '//' + url.parse(mainUrl).host;
    console.log(mainUrl)
    var links;

    var parsedLinks = [];
    var id = 1;


    function fillLinksArray(html) {
        var parsedHTML = cheerio.load(html);

        links = parsedHTML('a');

        //обход всех сылок страницы и поиск того же домена

        for (var i = 0; i < links.length; i++) {
            if (parsedLinks.length < 1000) {
                var linkHref = links[i].attribs.href;
                if (linkHref && linkHref[0] === '/' && linkHref[1] !== '/') {
                    parsedLinks.push({
                        id: id++,
                        href: domain + linkHref
                    })
                }
            } else {

                res.writeHead(200, {"Content-Type": "text/html"});
                res.write(JSON.stringify(parsedLinks));
                res.end();
                break;
            }
        }
    }

    request(mainUrl, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            fillLinksArray(html);

            var tempArray = parsedLinks.slice(0);

            for (var j = 0; j < tempArray.length; j++) {
                var secondUrl = tempArray[j].href;
                //поиск ссылок на втором уровне
                request(secondUrl, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        if (parsedLinks.length < 1000) {
                            fillLinksArray(html);
                        } else return;
                    }
                });

            }


        }
    });


}).listen(8000);

