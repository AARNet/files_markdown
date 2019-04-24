ownCloud Markdown Editor
=================

Extends the text editor in ownCloud with a live preview of markdown files. 

The previewer has 3 separate views:
* Editor only
* Side by side (editor and preview)
* Preview only

The editor uses the [markdown-it](https://github.com/markdown-it/markdown-it) parser and has the following plugins enabled:
* [markdown-it-texmath](https://github.com/goessner/markdown-it-texmath)
* [markdown-it-checkboxes](https://github.com/benjycui/markdown-it-checkboxes)

Through markdown-it-texmath, there is support for TeX math which is rendered using KaTeX. This can be used by surrounding math in `$$`

Requirements
---

This requires ownCloud and the files_texteditor app to be installed..

Installation
---

- Clone the app into the owncloud apps directory:

    ``git clone https://github.com/mdusher/files_markdown.git``

- Activate the App.

    ``occ app:enable files_markdown``
