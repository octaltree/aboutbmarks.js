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

  function main(){
    clearPage(); // TODO 専用ページをつくりopen, tabopenできるようにしたい
    logger.init();
    const paths = flatTree(bookmark.allFolders(bookmark.bkm.placesRoot));
  }

  function flatTree(tree){ // {id:id, children:children}から[[]] pathの配列
    return [];
  }

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
  var logger = { // {{{
    space: undefined,
    init: function(){
      const d = content.document;
      this.space = d.createElement('pre');
      d.body.appendChild(this.space);
    },
    msg: function(msg){
      this.space.innerText += msg;
    },
    dump: function(obj){
      var cache = [];
      this.space.innerText += JSON.stringify(obj, (key, value) => {
        if( typeof value === 'object' && value !== null ){
          if( cache.indexOf(value) !== -1 ) return;
          cache.push(value);
        }
        return value;
      }, 2) + '\n';
    }}; // }}}
  commands.addUserCommand(["aboutbmarks"], "show bookmarks", main, {}, true);
}());
// vim: sw=2 ts=2 et si fdm=marker:
