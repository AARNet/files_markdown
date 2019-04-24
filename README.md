ownCloud Markdown Editor
=================

Extends the text editor in ownCloud with a live preview of markdown files. 

The previewer has 3 separate views:
* Editor only
* Side by side (editor and preview)
* Preview only

The editor uses the [markdown-it](https://github.com/markdown-it/markdown-it) parser and has the following plugins enabled:
* [markdown-it-texmath](https://github.com/goessner/markdown-it-texmath) - this allows support for TeX math which is rendered using KaTeX. This can be used by surrounding math in `$$`.
* [markdown-it-checkboxes](https://github.com/benjycui/markdown-it-checkboxes) - this allows the `[ ]` and `[X]` operator for rendering checkboxes
* [markdown-it-for-inline](https://github.com/benjycui/markdown-it-for-inline) - this is used to allow inline images from your ownCloud (eg. `![](/Photos/Paris.jpg)`)


Requirements
---

This requires ownCloud and the files_texteditor app to be installed..

Installation
---

- Clone the app into the owncloud apps directory:

    ``git clone https://github.com/mdusher/files_markdown.git``

- Activate the App.

    ``occ app:enable files_markdown``
