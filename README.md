# aboutbmarks.js
[MyBookmarks](https://addons.mozilla.org/ja/firefox/addon/mybookmarks/)クローン.
ブックマークを画面いっぱいに表示するvimperatorプラグイン.

## Usage
```
:aboutbmarks
```
で現在開いているページを書き換え一覧表示します.
```
:autocmd DOMLoad about:blank aboutbmarks
```
と設定すれば, about:blankを一覧ページとすることができるのでオススメです.

## TODO
* xhtmlドキュメントでnot well-formedといわれないようにする
* INFO書く
