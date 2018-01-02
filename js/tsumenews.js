$(function(){

  var itemTemplateHtml = $('#itemTemplate');
  var itemTemplate = Handlebars.compile(itemTemplateHtml.html());
 
  var frameTemplateHtml = $('#frameTemplate');
  var frameTemplate = Handlebars.compile(frameTemplateHtml.html());

  var plusFrameTemplateHtml = $('#plusFrameTemplate');
  var plusFrameTemplate = Handlebars.compile(plusFrameTemplateHtml.html());

  function stripHtml(s){
    return s.replace(/<[^>]*>/g, "")
  }

  Handlebars.registerHelper('extract', function(html, options){
    if(!html)return "";
    var m = html.match(/<img src="([^"]*)/g);
    var out = [];
    if(!m) return "";
    for(var i = 0; i < m.length; i ++){
      if(
        m[i].indexOf('http://b.hatena.ne.jp/') == -1 && 
        m[i].indexOf('http://cdn-ak.favicon.st-hatena.com/') == -1 
      ){ // 余計なはてぶ画像を消す
        out.push(m[i].replace('<img src="',''));
      }
    }
    for(var i = 0; i < out.length; i ++){
      out[i] = "<img src='" + out[i] + "'>";
    }
    out = out.slice(0,2); // 最大画像数
     return out.join('');
  });

  Handlebars.registerHelper('showDate', function(dateStr, options){
    var d = new Date(dateStr);
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
      ('0' + d.getHours()).slice(-2) + ':' + 
      ('0' + d.getMinutes()).slice(-2)
      ;
  });
  
  function loadRss(url,elm){
    var urls = [
      url
    ]
    Handlebars.registerHelper('extract', function(html, options){
      if(!html)return "";
      if(html.content)html = html.content;
      var m = html.match(/<img src="([^"]*)/g);
      var out = [];
      if(!m) return "";
      for(var i = 0; i < m.length; i ++){
        out.push(m[i].replace('<img src="',''));
      }
      var sout = "";
      for(var i = 0; i < out.length; i ++){
        sout += "<img src='" + out[i] + "'>";
      }
      return sout;
    });

    for(var i = 0; i < urls.length; i ++){
      urls[i] = "url='" + urls[i] + "'"
    }

    $.ajax({
      type: "GET",
      url:"https://query.yahooapis.com/v1/public/yql?callback=?",
      data: {q:"select * from feed where " + urls.join(' or '),format:'json'},
      dataType:'jsonp',
      success:function(obj){
        var target = obj.query.results;
        if(!target){return;}
        // atomのとき
        if(!target.item) target.item = target.entry;
        for(var i = 0; i < target.item.length; i ++){
          if(target.item[i].content && target.item[i].content.content){
            target.item[i].encoded = target.item[i].content.content;
          }

          if(!target.item[i].description && target.item[i].content && target.item[i].content.content){
            target.item[i].description = stripHtml(target.item[i].content.content);
          }
          if(target.item[i].link.href){
            target.item[i].link = target.item[i].link.href;
          }
 
        }
        //console.log(target);

        var s = itemTemplate(target);
        elm.html(s);
      }
    });

  }

  var MAX_COL = 2;

  function makeFrame(url,col){
    var frameHtml = frameTemplate({});
    var frameElm = $(frameHtml);
    loadRss(url, frameElm.find('.contents'))
    frameElm.appendTo($('#col'+ MAX_COL +'-' + col));
  }

  function makeDateFrame(col){
    var frameHtml = frameTemplate({});
    var frameElm = $(frameHtml);
    var elm = $('<div>').addClass('tac');
    var d = new Date();
    elm.text(
      ('0' + (d.getMonth() + 1)).slice(-2) + 
      '/' +
      ('0' + d.getDate()).slice(-2) + 
      ' ' +
      ('0' + d.getHours()).slice(-2) + 
      ':' +
      ('0' + d.getMinutes()).slice(-2) +
      ':' +
      ('0' + d.getSeconds()).slice(-2)
    );
    setInterval(function(){
      var d = new Date();
      elm.text(
        ('0' + (d.getMonth() + 1)).slice(-2) + 
        '/' +
        ('0' + d.getDate()).slice(-2) + 
        ' ' +
        ('0' + d.getHours()).slice(-2) + 
        ':' +
        ('0' + d.getMinutes()).slice(-2) +
        ':' +
        ('0' + d.getSeconds()).slice(-2)
    );
 
    },500)
    frameElm.find('.contents').append($('<div>').text('つめつめ News'))
    frameElm.find('.contents').append($('<div>').append($('<a>').attr('href','http://twitter.com/ina_ani').attr('target','_blank').text('@ina_ani')))
    frameElm.find('.contents').append(elm)
    frameElm.appendTo($('#col'+ MAX_COL +'-' + col));
  }

  function makePlusFrame(col){
    var plusFrameHtml = plusFrameTemplate({});
    var plusFrameElm = $(plusFrameHtml);
    plusFrameElm.appendTo($('#col'+ MAX_COL +'-' + col));
  }

  function initialize(){

    makeDateFrame(1);
    //makeDateFrame(3);
    //makeDateFrame(3);
    makeFrame("http://feeds.feedburner.com/hatena/b/hotentry", 1);
    makeFrame("http://www.producthunt.com/feed", 1);
    //makeFrame("http://rss.dailynews.yahoo.co.jp/fc/rss.xml", 4);
    //makeFrame("http://rss.dailynews.yahoo.co.jp/fc/computer/rss.xml", 4);
    //makeFrame("http://rss.dailynews.yahoo.co.jp/fc/science/rss.xml", 4);
    makeFrame("http://strawberry-linux.com/news.rss", 2);

    makeFrame("http://feeds.gizmodo.jp/rss/gizmodo/index.xml", 2);
    makeFrame("http://feed.rssad.jp/rss/gigazine/rss_atom", 2);

    //makePlusFrame(1);
    //makePlusFrame(2);
    //makePlusFrame(3);
    //makePlusFrame(4);
    //makePlusFrame(5);
    //makePlusFrame(6);
  }

  //google.setOnLoadCallback(initialize);
  initialize();
});
//google.load("feeds", "1");
