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
  function main(){
    clearPage(); // TODO 専用ページをつくりopen, tabopenできるようにしたい
    logger.init();
    const bkmservice = Cc["@mozilla.org/browser/nav-bookmarks-service;1"]
      .getService(Ci.nsINavBookmarksService);
    //getBookmarks(bkmservice.placesRoot);
    getBookmarks(bkmservice.unfiledBookmarksFolder);
    logger.dump(bkmservice);
  }
  commands.addUserCommand(["aboutbmarks"], "show bookmarks", main, {}, true);

  function getBookmarks(folder){
    const hs = Components.classes["@mozilla.org/browser/nav-history-service;1"]
      .getService(Components.interfaces.nsINavHistoryService);
    const query = folder => {
      var tmp = hs.getNewQuery();
      tmp.setFolders([folder], 1);
      return tmp;
    };
    var result = hs.executeQuery(query(folder), hs.getNewQueryOptions());
    result.root.containerOpen = true;
    const range = n => Array.from({length: n}, (v, k) => k);
    const children = range(result.root.childCount)
      .map(x => result.root.getChild(x));
    // TODO 再帰
    result.root.containerOpen = false;
  }
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
}());
// vim: sw=2 ts=2 et si fdm=marker:
