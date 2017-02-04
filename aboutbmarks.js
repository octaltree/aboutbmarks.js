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
  const bkms = Cc["@mozilla.org/browser/nav-bookmarks-service;1"]
    .getService(Ci.nsINavBookmarksService);
  const hs = Components.classes["@mozilla.org/browser/nav-history-service;1"]
    .getService(Components.interfaces.nsINavHistoryService);
  const cui = content.window.console;

  function main(){
    clearPage(); // TODO 専用ページをつくりopen, tabopenできるようにしたい
    const paths = flatTree(bookmark.allFolders(bookmark.bkm.placesRoot));
    showBookmarks(paths);
    addScripts(
        ['https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.slim.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/freewall/1.0.5/freewall.min.js'],
        useFreewall);
  }
  function showBookmarks(paths){
    const d = content.document;
    d.body.innerHTML += '<div id="freewall"></div>';
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

  function flatTree(tree){ // {id:id, children:children}から[[]] pathの配列
    return [];
  }
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
        .executeQuery(query(folder), hs.getNewQueryOptions()).root;
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
