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
  const fs = bookmark.allFolderPaths(bookmark.bookmarksservice.placesRoot)
    .filter(x => x.length > 1)
    .map(x => x.slice(1)) // ルートフォルダを除く
    .map(x => {
      const fid = x[x.length-1];
      return {
        id: fid,
        depth: x.slice(0, x.length-1),
        uris: bookmark.expand(fid, xs => xs
            .filter(x => x.type == x.RESULT_TYPE_URI)
            .map(x => { return {id: x.itemId, title: x.title}; }))};
    });
  page.showFolder(fs);
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
<style>
html, body, .folders.wrap, ul.folders {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
<style>
${liberator.globalVariables.aboutbmarks_css}
</style>
</head>
<body>
<div class="folders wrap">
  <ul class="folders">
  </ul>
</div>
</body>
`,
  inscript: `
!function(){
  const initializer = {
    scripts: [
      "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.slim.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jquery.wookmark/2.1.2/wookmark.min.js"],
    addScripts: function(f){
      const adds = this.scripts.map(uri => f => () => {
        const s = document.createElement('script');
        s.src = uri;
        s.onload = f;
        document.body.appendChild(s);
      });
      adds.reduceRight((iter, x) => x(iter), f)();
    }};
  const main = () => {
    $(function(){
      $('ul.folders').wookmark({
        container: $('.folders.wrap'),
        autoResize: true,
        offset: 0});
    });
  };
  initializer.addScripts(main);
}();
`,
  init: function(){
    this.win = content.window;
    this.doc = content.document;
    this.doc.documentElement.innerHTML = this.inhtml;
    this.addSnippet(this.inscript);
  },
  addSnippet: function(str){
    const s = this.doc.createElement('script');
    s.innerHTML += str;
    this.doc.body.appendChild(s);
  },
  showFolder: function(fs){
    // [{id: int, depth: [{id: int, title: str}], uris: [{title: str, uri: str}]}] ->
    const bookmark = b => `<li class="uri"><a href="${b.uri}">${b.title}</a></li>`;
    this.log(fs);
    const tmp = `
      <li>
        <div class="folder">
          <div class="title">
            <a></a>
            <span></span>
          </div>
          <div class="uris">
            <ul>
              <li><a href="">name</a></li>
            </ul>
          </div>
        </div>
      </li>`;
  }}; // }}}
const bookmark = { // {{{
  bookmarksservice:
    Cc["@mozilla.org/browser/nav-bookmarks-service;1"]
    .getService(Ci.nsINavBookmarksService),
  historyservice:
    Components.classes["@mozilla.org/browser/nav-history-service;1"]
    .getService(Components.interfaces.nsINavHistoryService),
  expand: function(fid, f){
    const query = fid => {
      const tmp = this.historyservice.getNewQuery();
      tmp.setFolders([fid], 1);
      return tmp;
    };
    const r = this.historyservice
      .executeQuery(query(fid), this.historyservice.getNewQueryOptions()).root;
    r.containerOpen = true;
    const range = n => Array.from({length: n}, (v, k) => k);
    const children = range(r.childCount).map(x => r.getChild(x));
    const res = f(children);
    r.containerOpen = false;
    return res;
  },
  allFolders: function(fid){
    return this.expand(fid, xs => {
      const ys = xs.filter(x => x.type == x.RESULT_TYPE_FOLDER);
      return {
        id: fid,
        children: ys.map(y => this.allFolders(y.itemId))};
    });
  },
  allFolderPaths: function(fid){
    const tree = this.allFolders(fid);
    const rec = (x, depth) => {
      const newdepth = depth.concat(x.id);
      return x.children.map(y => rec(y, newdepth)).reduce(
          (base, y) => base.concat(y), [newdepth]);
      o };
    return rec(tree, []);
  }}; // }}}
}();
// vim: sw=2 ts=2 et si fdm=marker:
