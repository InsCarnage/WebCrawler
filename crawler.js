const request = require('request');
const cheerio = require('cheerio');
var fs = require('fs');

function Scrape(link, filename){
    request(link, (error, response, html) => {
    if(!error && response.statusCode ==200) {
        const $ = cheerio.load(html);
        const HeadingInfo = $('.detail');
        const siteInfo = $('.fst');
        const Product = $('.myProductName');
        

        //console.log(HeadingInfo.text());
        //console.log(HeadingInfo.html());
        //const output = HeadingInfo.children('h1').text();
        //const output = HeadingInfo.children('h1').next().text(); // only gets the next info after h1

        // const output = HeadingInfo.children('h1').parent().text(); // gets more info 

        const Heading = HeadingInfo.find('h1').text();
        const output = Product.text();
        const removefirst = output.trim();
        const removed = removefirst.replace( /\s\s+/g, ',' );
        var res = removed.split(",");



        var arrImage = [] ;
        var arrItems = [] ;
        var arrPrice = [] ;
        $('.myProductName span').each((i, el) => {
            const item = $(el).text();
            arrItems.push(item);
        });

        $('.price').each((i, el) => {
            const Price = $(el).text();
            const removefirst = Price.trim();
            var removed = removefirst.replace(/\s/g, '');
            removed = removed.replace("IncludingVAT",'');
            arrPrice.push(removed);
        });

        $('.image a').each((i, el) => {
            const image = $(el).text();
            //const removefirst = Price.trim();
            //var removed = removefirst.replace(/\s/g, '');
            //removed = removed.replace("IncludingVAT",'');
            var FIndex = image.indexOf('/repository');
            var last = image.lastIndexOf('jpg');
            var src = image.slice(FIndex,last);
            arrImage.push('https://evetech.co.za'+src+'jpg');
            
        });
        // for( var i = 0 ; i<= arrItems.length; i++){
        //     if(res[i] != undefined){
        //         console.log("display "+ i);
        //         console.log(arrItems[i]);
        //         console.log(arrPrice[i]);
        //     }
        //     else 
        //         console.log("end");
        // }
        //create Json format
        var objGPU = {
            items: []
        }

        for( var i = 0 ; i< arrItems.length; i++){
            objGPU.items.push({
                name: arrItems[i],
                price: arrPrice[i],
                url: arrImage[i]
            });
        }
        //write to Json file
        fs.writeFile(filename, JSON.stringify(objGPU), function(err, result) {
            if(err) {
                console.log('error',err);
            }
        });  
}
})
}


function Crawl(link){
    request(link, (error, response, html) => {
    if(!error && response.statusCode ==200) {
        const $ = cheerio.load(html);
        var arrLinks = [];
        // goes through the links and searches for components only 
        $("a").each((i, el) => {
            var data =($(el).attr());
            var search = JSON.stringify(data);
            var search = search.includes("components");
            if(search ==true){
                correct = JSON.stringify(data);
                var lIndex = correct.lastIndexOf('"');
                var FIndex = correct.indexOf('"',7)+1 ;
                correct = correct.slice(FIndex,lIndex);
                arrLinks.push(correct);
            }
            
        });
        // removes duplicate entries
        for(var I = 0; I < arrLinks.length ; I++){
            for(var J = 0; J< arrLinks.length; J++)
            {
                if(arrLinks[I] == arrLinks[J])
                {
                    arrLinks.splice(J,1);
                }
            }
        }
        console.log(arrLinks);

        for(var x = 0; x< arrLinks.length; x++){
            var Indexfirst = arrLinks[x].indexOf("/",27) +1 ;
            var IndexLast = arrLinks[x].indexOf(".aspx");
            var str = arrLinks[x].slice(Indexfirst,IndexLast) +".json";
            Scrape(arrLinks[x], str);
        }
        console.log("done");
    }});
}

Crawl("https://www.evetech.co.za/");


