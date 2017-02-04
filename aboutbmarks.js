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
(function(){
  const cui = content.window.console;

  function main(){
    clearPage(); // TODO 専用ページをつくりopen, tabopenできるようにしたい
    const foldertree = bookmark.allFolders(bookmark.bkm.placesRoot);
    const paths = flatTree(foldertree);
    showBookmarks(paths);
    addScripts(
        ['https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.slim.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/freewall/1.0.5/freewall.min.js'],
        useFreewall);
  }
  function showBookmarks(paths){
    const d = content.document;
    const name = id => bookmark.bkm.getItemTitle(id);
    d.body.innerHTML += '<div id="freewall">' +
      paths.map(p => {
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
        cui.log('');
        cui.log(title + bkmlist);
        cui.log('');
        const brick = '<div class="brick">' + title + '</div>';
        return brick;
      }).reduce((a, b) => a+b, '') + '</div>';
  }
  function useFreewall(){
    const d = content.document;
    const w = content.window;
    const rawjs =
      'var wall = new Freewall("#freewall");'+
      'wall.reset({'+
        'selector: ".brick",'+
        'animate: false,'+
        'cellW: 150, cellH: "auto",'+
        'onResize: ()=>wall.fitWidth()});'+
      'wall.container.find(".brick").each(() => wall.fitWidth());';
    addSnippet(rawjs);
  }

  //{id:7, children:[[{id:1, children:[2,3,4]}, {id:5, chidren: [6]]]}
  //  [[1], [1,2], [1,3], [1,4], [5], [5,6]]
  function flatTree(tree, depth){
  }
  function flatTree(tree){ // {{{
    function rec(x, depth){
      const newdepth = depth.concat(x.id);
      return x.children.map(y => rec(y, newdepth)).reduce(
          (base, y) => base.concat(y), [newdepth]);
    }
    return rec(tree, []);
  } // }}}

  function addSnippet(str){ // {{{
    const d = content.document;
    var s = d.createElement('script');
    s.innerHTML += str;
    d.body.appendChild(s);
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
// vim: sw=2 ts=2 et si fdm=marker:
