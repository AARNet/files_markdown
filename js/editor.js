OCA.Files_Markdown = {
	pluginPromises: {},
	dirtyPluginLoaded: {}
};

OCA.Files_Markdown.Preview = function () {
	this.renderer = null;
	this.head = document.head;
	this.preview = _.throttle(this.renderMarkdown, 500);
};

OCA.Files_Markdown.Preview.prototype = {
	init: function () {
		$.when(
			this.loadPlugin('markdown-it'),
			this.loadPlugin('markdown-it-anchor'),
			this.loadPlugin('markdown-it-checkbox'),
			this.loadPlugin('markdown-it-for-inline'),
			this.loadPlugin('highlight.pack'),
			this.loadPlugin('katex')
		).then(function () {
		}.bind(this));
		this.dirtyLoadPlugin('texmath.js');
	},

	getImageUrl:  function (path) {
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

	renderMarkdown: function (text, element) {
		OCA.Files_Markdown.Preview.setupTextEditor();
		var md = OCA.Files_Markdown.MarkdownIt();
		var html = md.render(text.trim());
		element.html(html);
	},

	loadPlugin: function (plugin) {
		if (!OCA.Files_Markdown.pluginPromises[plugin]) {
			OCA.Files_Markdown.pluginPromises[plugin] = OC.addScript('files_markdown', plugin);
		}
		return OCA.Files_Markdown.pluginPromises[plugin];
	},

	dirtyLoadPlugin: function (plugin) {
	        // Inserts using the native DOM to prevent jQuery removing the script tag
		if (!OCA.Files_Markdown.dirtyPluginLoaded[plugin]) {
                	var path = OC.filePath('files_markdown', 'js', plugin);
	                script = document.createElement("script");
        	        script.src = path;
	                this.head.appendChild(script);
			OCA.Files_Markdown.dirtyPluginLoaded[plugin] = 'true';
		}
	}
};

OCA.Files_Markdown.MarkdownIt = function () {
	var md = window.markdownit({
		linkify: true,
		highlight: function (str, lang) {
			var block = '';
			if (lang && hljs.getLanguage(lang)) {
				try {
					block = hljs.highlight(lang, str, true).value ;
				} catch (__) {}
			} else {
				block = hljs.highlightAuto(str).value;
			}
			return '<pre class="hljs"><code>' + block + '</code></pre>';
		}
	});
	// load texmath plugin	
	var tm = texmath.use(katex);
	md.use(tm, {delimiters:'dollars',macros:{"\\RR": "\\mathbb{R}"}});

	// load checkbox plugin
	md.use(markdownitCheckbox,{
		disabled: false,
		divWrap: false,
		divClass: 'checkbox',
		idPrefix: 'cbx_',
		ulClass: 'task-list',
		liClass: 'task-list-item'
	});

	// load inline plugin for image replacement
	md.use(window.markdownitForInline, 'internal_image_link', 'image', function(tokens, idx) {
		tokens[idx].attrSet('src', OCA.Files_Markdown.Preview.prototype.getImageUrl(tokens[idx].attrGet('src')));
	});

	// Correct anchors to work with editor
	editorSlugify = function (s) { return 'editor/'+encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-')) };
	md.use(window.markdownItAnchor, { slugify: editorSlugify });
        md.use(window.markdownitForInline, 'url_new_win', 'link_open', function (tokens, idx) {
		href = tokens[idx].attrGet('href');
		if (href[0] !== '#') {
			tokens[idx].attrPush(['target', '_blank']);
			tokens[idx].attrPush(['rel', 'noopener']);
		} else {
			tokens[idx].attrSet('href', '#' + editorSlugify(href.substr(1)));
		}
        });

	return md;
}

OCA.Files_Markdown.Preview.setupTextEditor = function () {
	editor_controls = $('#editor_controls');
	if (editor_controls.data('md_toggles') !== 'true') {	
		// Add a border to the bottom of the editor controls panel
		editor_controls.addClass('md-header');
		// Unbind text editor close on click outside of editor
		$(document).unbind('mouseup', OCA.Files_Texteditor._onClickDocument);

		// Setup text editor to not close when an anchor is clicked
		window.onpopstate = OCA.Files_Markdown.onAnchorChange;
		if (!OCA.Files_Markdown.anchorChange) {
			OCA.Files_Markdown.anchorChange = window.onpopstate;
		}

		// Add view controls
		$('<button id="md-view-preview">').text('Preview').addClass("editor_control").appendTo('#editor_controls');
		$("#md-view-preview" ).bind( "click", function() { OCA.Files_Markdown.Preview.toggleView('preview', this); });
		$('<button id="md-view-sidebyside">').text('Side By Side').addClass("editor_control").appendTo('#editor_controls');
		$("#md-view-sidebyside" ).bind( "click", function() { OCA.Files_Markdown.Preview.toggleView('sidebyside', this); });
		$('<button id="md-view-editor">').text('Editor').addClass("editor_control").appendTo('#editor_controls');
		$("#md-view-editor" ).bind( "click", function() { OCA.Files_Markdown.Preview.toggleView('editor', this); });
		$('#md-view-sidebyside').addClass('active');

		editor_controls.data('md_toggles', 'true');
	}
};


OCA.Files_Markdown.onAnchorChange = function (event) {
	const anchor = window.location.hash.substr(1)
	if (anchor.substr(0, 6) !== 'editor' && OCA.Files_Markdown.anchorChange) {
		OCA.Files_Markdown.anchorChange.call(window, event);
	}
}

OCA.Files_Markdown.Preview.toggleView = function (view, button) {
	var preview = $('#preview_wrap');
	var editor = $('#editor');
	var controls = $('#editor_controls button.editor_control');
	
	controls.removeClass('active');
	preview.removeClass('md-hidden').removeClass('md-full');
	editor.removeClass('md-hidden').removeClass('md-full');

	switch(view) {
		case 'preview':
			$(button).addClass('active');
			preview.addClass('md-full');
			editor.addClass('md-hidden');
			break;
		case 'editor':
			$(button).addClass('active');
			editor.addClass('md-full');
			preview.addClass('md-hidden');
			break;
		default:
			$('#md-view-sidebyside').addClass('active');
		        preview.removeClass('md-hidden').removeClass('md-full');
		        editor.removeClass('md-hidden').removeClass('md-full');
	}
}

$(document).ready(function () {
	if (OCA.Files_Texteditor && OCA.Files_Texteditor.registerPreviewPlugin) {
		OCA.Files_Texteditor.registerPreviewPlugin('text/markdown', new OCA.Files_Markdown.Preview());
	}
});
