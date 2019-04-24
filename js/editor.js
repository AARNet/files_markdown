OCA.Files_Markdown = {};

OCA.Files_Markdown.mathJaxLoaded = false;
OCA.Files_Markdown.markedLoadPromise = null;
OCA.Files_Markdown.highlightLoaded = null;

OCA.Files_Markdown.Preview = function () {
	this.renderer = null;
	this.head = document.head;
	this.preview = _.throttle(this.previewText, 500);
};

OCA.Files_Markdown.Preview.prototype = {
	init: function () {
		var getUrl = this.getUrl.bind(this);

		$.when(
			this.loadMarked(),
			this.loadHighlight()
		).then(function () {
			this.renderer = new marked.Renderer();
			this.renderer.image = function (href, title, text) {
				var out = '<img src="' + getUrl(href) + '" alt="' + text + '"';
				if (title) {
					out += ' title="' + title + '"';
				}
				out += this.options.xhtml ? '/>' : '>';
				return out;
			};

			marked.setOptions({
				highlight: function (code) {
					return hljs.highlightAuto(code).value;
				},
				renderer: this.renderer,
				headerPrefix: 'md-',
				sanitize: true
			});
		}.bind(this));
		this.loadMathJax();
	},

	getUrl:  function (path) {
		if (!path) {
			return path;
		}
		if (path.substr(0, 7) === 'http://' || path.substr(0, 8) === 'https://' || path.substr(0, 3) === '://') {
			return path;
		} else {
			if (path.substr(0, 1) !== '/') {
				path = OCA.Files_Texteditor.file.dir + '/' + path;
			}
			return OC.generateUrl('apps/files/ajax/download.php?dir={dir}&files={file}', {
				dir: OC.dirname(path),
				file: OC.basename(path)
			});
		}
	},

	previewText: function (text, element) {
		OCA.Files_Markdown.Preview.addActions();
		var html = marked(OCA.Files_Markdown.Preview.prepareText(text));
		element.html(html);
		if (window.MathJax) {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, element[0]]);
		}
	},

	loadMarked: function () {
		if (!OCA.Files_Markdown.markedLoadPromise) {
			OCA.Files_Markdown.markedLoadPromise = OC.addScript('files_markdown', 'marked');
		}
		return OCA.Files_Markdown.markedLoadPromise;
	},

	loadHighlight: function () {
		if (!OCA.Files_Markdown.highlightLoadPromise) {
			OCA.Files_Markdown.highlightLoadPromise = OC.addScript('files_markdown', 'highlight.pack');
		}
		return OCA.Files_Markdown.highlightLoadPromise;
	},

	loadMathJax: function () {
		if (OCA.Files_Markdown.mathJaxLoaded) {
			return;
		}
		OCA.Files_Markdown.mathJaxLoaded = true;
		var script = document.createElement("script");
		script.type = "text/x-mathjax-config";
		script[(window.opera ? "innerHTML" : "text")] =
			"MathJax.Hub.Config({\n" +
			"  tex2jax: { inlineMath: [['$','$'], ['\\\\(','\\\\)']] }\n" +
			"});";
		this.head.appendChild(script);

		var path = OC.filePath('files_markdown', 'js', 'mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML');

		//insert using native dom to prevent jquery from removing the script tag
		script = document.createElement("script");
		script.src = path;
		this.head.appendChild(script);
	}
};

OCA.Files_Markdown.Preview.prepareText = function (text) {
	text = text.trim();
	if (text.substr(0, 3) === '+++') {
		text = text.substr(3);
		text = text.substr(text.indexOf('+++') + 3);
	}

	return text;
};

OCA.Files_Markdown.Preview.addActions = function () {
	editor_controls = $('#editor_controls');
	if (editor_controls.data('md_toggles') !== 'true') {	
		$('<button id="md-view-preview">').text('Preview').addClass("editor_control").appendTo('#editor_controls');
		$("#md-view-preview" ).bind( "click", function() { OCA.Files_Markdown.Preview.toggleView('preview'); });
		$('<button id="md-view-sidebyside">').text('Side By Side').addClass("editor_control").appendTo('#editor_controls');
		$("#md-view-sidebyside" ).bind( "click", function() { OCA.Files_Markdown.Preview.toggleView('sidebyside'); });
		$('<button id="md-view-editor">').text('Editor').addClass("editor_control").appendTo('#editor_controls');
		$("#md-view-editor" ).bind( "click", function() { OCA.Files_Markdown.Preview.toggleView('editor'); });

		editor_controls.data('md_toggles', 'true');
	}
};


OCA.Files_Markdown.Preview.toggleView = function (view) {
	var preview = $('#preview_wrap');
	var editor = $('#editor');

	preview.removeClass('md-hidden').removeClass('md-full');
	editor.removeClass('md-hidden').removeClass('md-full');

	switch(view) {
		case 'preview':
			preview.addClass('md-full');
			editor.addClass('md-hidden');
			break;
		case 'editor':
			editor.addClass('md-full');
			preview.addClass('md-hidden');
			break;
		default:
		        preview.removeClass('md-hidden').removeClass('md-full');
		        editor.removeClass('md-hidden').removeClass('md-full');
	}
}

$(document).ready(function () {
	if (OCA.Files_Texteditor && OCA.Files_Texteditor.registerPreviewPlugin) {
		OCA.Files_Texteditor.registerPreviewPlugin('text/markdown', new OCA.Files_Markdown.Preview());
	}
});
