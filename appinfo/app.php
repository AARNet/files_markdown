<?php

$eventDispatcher = \OC::$server->getEventDispatcher();
$eventDispatcher->addListener(
	'OCA\Files::loadAdditionalScripts',
	function () {
		\OCP\Util::addscript( 'files_markdown', 'editor');
		\OCP\Util::addStyle( 'files_markdown', 'preview' );
		\OCP\Util::addStyle( 'files_markdown', 'markdown' );
		\OCP\Util::addStyle( 'files_markdown', 'highlight-github' );
		\OCP\Util::addStyle( 'files_markdown', 'katex' );
		\OCP\Util::addStyle( 'files_markdown', 'texmath' );
	}
);

