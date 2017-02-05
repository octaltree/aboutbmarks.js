/*
aboutbmarks.js

Copyright (c) 2017 octaltree<octaltree@gmail.com>

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/
// INFO {{{
var INFO = xml`
`;
// }}}
!function(){
commands.addUserCommand(["aboutbmarks"], "show bookmarks", main, {}, true);
function main(){
  page.init();
}
const page = { // {{{
  win: undefined,
  doc: undefined,
  log: function(x){ this.win.console.log(x); return x; },
  inhtml: `
<head>
<title>aboutbmarks</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery.wookmark/2.1.2/css/main.min.css" />
</head>
<body>
<p>hoge</p>
</body>
`,
  scripts: [
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.slim.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jquery.wookmark/2.1.2/wookmark.min.js"],
  inscript: `
!function(){
  console.log('script sourced');
}();
`,
  init: function(){
    this.win = content.window;
    this.doc = content.document;
    this.doc.documentElement.innerHTML = this.inhtml;
    this.scripts.forEach(uri => {
      const s = this.doc.createElement('script');
      s.src = uri;
      this.doc.body.appendChild(s);
    });
    this.addSnippet(this.inscript);
  },
  addSnippet(str){
    const s = this.doc.createElement('script');
    s.innerHTML += str;
    this.doc.body.appendChild(s);
  }}; // }}}
class Bookmark {
}
}();
/*
(function(){
  const cui = content.window.console;

  function main(){
    clearPage(); // TODO 専用ページをつくりopen, tabopenできるようにしたい
    const foldertree = bookmark.allFolders(bookmark.bkm.placesRoot);
    const paths = flatTree(foldertree);
    addStyle();
    showBookmarks(paths);
    const d = content.document;
    const css = uri => '<link rel="stylesheet" rel="uri">'.replace('uri', uri);
    d.body.innerHTML +=
      css('https://cdnjs.cloudflare.com/ajax/libs/jquery.wookmark/2.1.2/css/main.min.css');
    addScripts([
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.slim.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/jquery.wookmark/2.1.2/wookmark.min.js'],
        () => {
          addSnippet("jQuery('body').ready(() => {" +
              "$('#folders').wookmark({" +
              "autoResize: true," +
              "container: $('#wrap')," +
              "offset: 0," +
              "}); });");
        });
  }
  function loadLib(){
    const d = content.document;
    const js = uri => '<script src="uri"></script>'.replace('uri', uri);
    const css = uri => '<link rel="stylesheet" rel="uri">'.replace('uri', uri);
    d.body.innerHTML +=
      css('https://cdnjs.cloudflare.com/ajax/libs/jquery.wookmark/2.1.2/css/main.min.css');
  }
  function showBookmarks(paths){
    const d = content.document;
    const name = id => bookmark.bkm.getItemTitle(id);
    const freewall = d.createElement('div');
    freewall.id = 'wrap';
    const ul = d.createElement('ul');
    ul.id = 'folders';
    ul.innerHTML += paths.map(p => {
      if( p.length < 1 || p.length == 1 && p[0] == 1 ) return '';
      const path = p.slice(1);
      const target = p[p.length-1];
      const names = path.map(name);
      // TODO フォルダに適切なリンクを貼る
      const title = '<div class="title">' + names.join() + '</div>';
      const bkmlist = '<ul>' +
        bookmark.processContents(target, bs => bs
            .filter(b => b.type == b.RESULT_TYPE_URI)
            .map(b => { return {title: b.title, uri: b.uri} }))
        .map(b => '<li><a href="' + b.uri + '">' + b.title + '</a></li>')
        .join('\n') + '</ul>';
      const brick = '<li class="brick"><div>' + title + bkmlist + '</div></li>';
      return brick;
    }).join('\n');
    freewall.appendChild(ul);
    d.body.appendChild(freewall);
  }

  function flatTree(tree){ // {{{
    function rec(x, depth){
      const newdepth = depth.concat(x.id);
      return x.children.map(y => rec(y, newdepth)).reduce(
          (base, y) => base.concat(y), [newdepth]);
    }
    return rec(tree, []);
  } // }}}

  function addSnippet(str){
    const d = content.document;
    var s = d.createElement('script');
    s.innerHTML += str;
    d.body.appendChild(s);
  }
  function addStyle(){ // {{{
    const d = content.document;
    var s = d.createElement('style');
    s.innerHTML += 'ul { list-style-type: none; }\n' +
      'body { margin: 0; padding: 0 }\n' +
      'ul#folders { margin: 0; padding: 0 }\n' +
      'div#wrap { margin: 0; padding: 0 }\n' +
      '.brick ul { margin: 0; padding: 0 }\n' +
      '.brick { width: 300px; }\n' +
      'div#wrap { width: 100%; }\n';
    d.head.appendChild(s);
  }
  function addScripts(uris, onload){
    const reqs = uris.map(uri => f => () => {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if( xhr.readyState != 4 || xhr.status != 200 ) return;
        addSnippet('console.log("add ' + uri + '");' + xhr.responseText);
        f(xhr);
      };
      xhr.open('GET', uri, true); xhr.send(null);
    });
    reqs.reduceRight((f, x) => x(f), onload)();
  } // }}}

  var bookmark = { // {{{
    bkm:
      Cc["@mozilla.org/browser/nav-bookmarks-service;1"]
      .getService(Ci.nsINavBookmarksService),
    hst:
      Components.classes["@mozilla.org/browser/nav-history-service;1"]
      .getService(Components.interfaces.nsINavHistoryService),
    processContents: (folder, f) => {
      const query = folder => {
        var tmp = bookmark.hst.getNewQuery();
        tmp.setFolders([folder], 1);
        return tmp;
      };
      var r = bookmark.hst
        .executeQuery(query(folder), bookmark.hst.getNewQueryOptions()).root;
      r.containerOpen = true;
      const range = n => Array.from({length: n}, (v, k) => k);
      const children = range(r.childCount).map(x => r.getChild(x));
      const res = f(children);
      r.containerOpen = false;
      return res;
    },
    allFolders: folder => bookmark.processContents(folder, bs => {
      const fs = bs.filter(x => x.type == x.RESULT_TYPE_FOLDER);
      const childfolders = fs.filter(c => c.type == c.RESULT_TYPE_FOLDER);
      const deep = childfolders.map(c => bookmark.allFolders(c.itemId));
      return {id: folder, children: deep};
    })}; // }}}
  function clearPage(){ // {{{
    const d = content.document;
    const p = d.documentElement.parentNode;
    const push = n => d.documentElement.appendChild(d.createElement(n));
    // TODO documentのイベントリスナ削除
    p.removeChild(d.documentElement);
    p.appendChild(d.createElement('html'));
    push('head'); push('body');
  } // }}}
  commands.addUserCommand(["aboutbmarks"], "show bookmarks", main, {}, true);
}());
*/
// vim: sw=2 ts=2 et si fdm=marker:
