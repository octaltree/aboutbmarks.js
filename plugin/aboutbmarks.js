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
        title: bookmark.bookmarksservice.getItemTitle(fid),
        depth: x
          .slice(0, x.length-1)
          .map(i => {
            return {id: i, title: bookmark.bookmarksservice.getItemTitle(i)};
          }),
        uris: bookmark.expand(fid, xs => xs
            .filter(x => x.type == x.RESULT_TYPE_URI)
            .map(x => { return {uri: x.uri, title: x.title}; }))};
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
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery.wookmark/2.1.2/css/main.min.css" />
<style>
html, body {
  background-color: #222222;
  color: #ccc;
  overflow-x: hidden;
}
a { color: #819be7; }
a:visited { color: #9d84b7; }
.folders.wrap {
  width: 100%;
  margin: 0;
  padding: 0;
}
ul#folders {
  list-style-type: none;
}
ul#folders > li {
  width: 560px;
  background-color: #141414;
}
.title {
  background-color: #28313e;
  padding: 3px 0;
}
ul#folders > li div.uris {
  padding: 5px 0;
}
ul#folders > li div.uris li {
  margin-bottom: 2px;
}
</style>
<style>
${liberator.globalVariables.aboutbmarks_css}
</style>
</head>
<body>
<div class="folders wrap">
  <ul id="folders" class="folders">
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
    var preheight = document.body.scrollHeight;
    const wookmark = () => {
      $('ul#folders').wookmark({
        container: $('.folders.wrap'),
        autoResize: true,
        offset: 10});
      if( preheight <= document.body.scrollHeight ){
        preheight = document.body.scrollHeight;
        setTimeout(wookmark, 0);
      }
    };
    wookmark();
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
    // [{id: int, title: str, depth: [{id: int, title: str}], uris: [{title: str, uri: str}]}] ->
    const rowf = f => {
      const tmp = `
        <li id="folder${f.id}">
          <div class="folder">
            <div class="title">
              <h3>
                ${f.depth.map(x => `<a href="#folder${x.id}">${x.title}</a>`).join('\n')}
                <span>${f.title}</span>
              </h3>
            </div>
            <div class="uris">
              <ul>
                ${f.uris.map(b => `
                    <li class="uri"><a href="${b.uri || ''}">${b.title || ''}</a></li>`).join('')}
              </ul>
            </div>
          </div>
        </li>`;
      return tmp;
    };
    this.doc.getElementById('folders').innerHTML = fs.map(rowf).join('');
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
      return x.children
        .map(y => rec(y, newdepth))
        .reduce((base, y) => base.concat(y), [newdepth]);
      };
    return rec(tree, []);
  }}; // }}}
}();
// vim: sw=2 ts=2 et si fdm=marker:
