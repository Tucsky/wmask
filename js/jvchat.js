/*
JV Chat, Copyright (c) 2011 JV Flux <http://jvflux.com/> Tous droits réservés.
*/

/* VARIABLES GLOBALES. */
/**
 * Temps de rafraichissement.
 * @typedef {{defaut: number,
 *            minimum: number}}
 */
var _refresh_time = {defaut: 3000, minimum: 1500};

/**
 * @type {{string}}
 */
var _avatars_url = {};

/**
 * Si un pseudo est banni, la clé est le pseudo et la valeur est true.
 * @type {{string}}
 */
var _banned = {};

/**
 * Dernier message envoyé.
 * @type {string}
 */
var _last_post;

var _tab = [],
	_tab_count = 0,
	_tab_current = 0;

var window_visible = true;

var error_timer, error_timer2;

var opening_hash;

/* DEFINES. */
var TITLE = 'JV Chat bêta';
var DEFAULT_AVATAR_URL = '//image.jeuxvideo.com/avatars/default.jpg';
var MAX_LAST_TOPICS = 20;
var TAB_BLINKING_FREQUENCY = 1000;
var TAB_BLINKING_MAX_ITERATIONS = 3;
var NEWTAB_ID = 1;

/**
 * Correspondance Windows-1252 -> utf-8 des caractères 128 à 255.
 * Chaque index contient le code utf-8 du 128ème caractère après lui.
 */
var COWARD_CHARS = [
	'%E2%82%AC', '%C2%81', '%E2%80%9A', '%C6%92', '%E2%80%9E', '%E2%80%A6', '%E2%80%A0', '%E2%80%A1', '%CB%86', '%E2%80%B0', '%C5%A0', '%E2%80%B9', '%C5%92', '%C2%8D', '%C5%BD', '%C2%8F',
	'%C2%90', '%E2%80%98', '%E2%80%99', '%E2%80%9C', '%E2%80%9D', '%E2%80%A2', '%E2%80%93', '%E2%80%94', '%CB%9C', '%E2%84%A2', '%C5%A1', '%E2%80%BA', '%C5%93', '%C2%9D', '%C5%BE', '%C5%B8',
	'%C2%A0', '%C2%A1', '%C2%A2', '%C2%A3', '%C2%A4', '%C2%A5', '%C2%A6', '%C2%A7', '%C2%A8', '%C2%A9', '%C2%AA', '%C2%AB', '%C2%AC', '%C2%AD', '%C2%AE', '%C2%AF',
	'%C2%B0', '%C2%B1', '%C2%B2', '%C2%B3', '%C2%B4', '%C2%B5', '%C2%B6', '%C2%B7', '%C2%B8', '%C2%B9', '%C2%BA', '%C2%BB', '%C2%BC', '%C2%BD', '%C2%BE', '%C2%BF',
	'%C3%80', '%C3%81', '%C3%82', '%C3%83', '%C3%84', '%C3%85', '%C3%86', '%C3%87', '%C3%88', '%C3%89', '%C3%8A', '%C3%8B', '%C3%8C', '%C3%8D', '%C3%8E', '%C3%8F',
	'%C3%90', '%C3%91', '%C3%92', '%C3%93', '%C3%94', '%C3%95', '%C3%96', '%C3%97', '%C3%98', '%C3%99', '%C3%9A', '%C3%9B', '%C3%9C', '%C3%9D', '%C3%9E', '%C3%9F',
	'%C3%A0', '%C3%A1', '%C3%A2', '%C3%A3', '%C3%A4', '%C3%A5', '%C3%A6', '%C3%A7', '%C3%A8', '%C3%A9', '%C3%AA', '%C3%AB', '%C3%AC', '%C3%AD', '%C3%AE', '%C3%AF',
	'%C3%B0', '%C3%B1', '%C3%B2', '%C3%B3', '%C3%B4', '%C3%B5', '%C3%B6', '%C3%B7', '%C3%B8', '%C3%B9', '%C3%BA', '%C3%BB', '%C3%BC', '%C3%BD', '%C3%BE', '%C3%BF'
];
/**
 * Correspondance cp1252 -> iso-8859-1
 * Chaque sous-array a des index contenant le code iso-8859-1 des index cp1252 marqués en commentaires.
 */
var EXTREMELY_COWARD_CHARS_SOLUTIONS = [
	['%8A', '%8B', '%8C', '%8D', '%8E', '%8F'], // 138 .. 143
	['%9A', '%9B', '%9C', '%9D', '%9E', '%9F'], // 154 .. 159
	['%C9', '%CA', '%CB', '%CC', '%CD', '%CE', '%CF'], // 201 .. 207
	['%D9', '%DA', '%DB', '%DC', '%DD', '%DE', '%DF']  // 217 .. 223
];

/* FONCTIONS. */
/**
 * @param {string} id L'identifiant.
 * @return {!Element} L'élement.
 */
function geid(id) {
	return document.getElementById(id);
}

/**
 * @param {string} className La classe.
 * @return {[Element]} Les élements.
 */
function gec(className) {
	return document.getElementsByClassName(className);
}

/**
 * @param {string} name Le nom.
 * @return {[Element]} Les élements.
 */
function gen(name) {
	return document.getElementsByName(name);
}

/**
 * @param {string} tagName Le nom de la balise.
 * @return {[Element]} Les élements.
 */
function getag(tagName) {
	return document.getElementsByTagName(tagName);
}

/**
 * @param {string} error L'erreur à afficher.
 * @param {bool} innerHTML |error| doit-il être considéré comme du HTML.
 */
function showError(error, innerHTML) {
	/* Création de la boîte de dialogue. */
	if ( ! geid('error_message')) {
		ce('div', {id: 'error_message'}, document.body);
		ce('small', {write: 'Cliquez pour fermer'}, 'error_message');
		addEvent(geid('error_message'), 'click', hideError);
	}
	if (innerHTML)
		ce('p', {innerHTML: error}, 'error_message');
	else
		ce('p', {write: error}, 'error_message');
	clearTimeout(error_timer);
	error_timer = setTimeout('hideError()', 2000);
	clearTimeout(error_timer2);
	geid('error_message').style.opacity = 1;
}

function hideError() {
	if ( ! geid('error_message')) {
		return;
	}
	var e = geid('error_message');
	var opacity = e.style.opacity || 1;
	if (opacity < .11) { // javascript croit que 0.10 = 0.10000000000000014
		removeElement('error_message');
		clearTimeout(error_timer2);
	}
	else {
		opacity -= .1;
		e.style.opacity = opacity;
		error_timer2 = setTimeout('hideError()', 20);
	}
}

/**
 * @return {Object} Un objet XMLHttpRequest JavaScript, ou ActiveX si inexistant.
 */
function getXhr() {
	return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('MSXML2.XMLHTTP.3.0');
}

/**
 * Supprime des éléments du DOM.
 * @param {...string} Les identifiants des éléments à supprimer.
 */
function removeElement() {
	for (var i = 0; i < arguments.length; i++) {
		var id = arguments[i];
		if (geid(id))
			geid(id).parentNode.removeChild(geid(id));
	}
}

/**
 * Crée un élément ("create element").
 * @param {string} tagName Le nom de la balise de l'élément.
 * @param {!{...attributs: !string}?} args Les attributs à donner à l'élément. Si l'attribut est 'write', la valeur sera ajouté en tant que texte dans l'élément.
 * @param {!Element?} parent L'élément (ou son id) auquel rattacher celui qu'on vient de créer.
 * @return {Element} L'élément créé.
 */
function ce(tagName, args, parent) {
	var elem = document.createElement(tagName);
	if (typeof args == 'object') {
		for (var i in args) {
			if (i == 'write')
				elem.appendChild(document.createTextNode(args[i]));
			else
				elem[i] = args[i];
		}
	}
	if (typeof parent == 'string')
		parent = geid(parent);
	if (parent)
		parent.appendChild(elem);
	return elem;
}

/**
 * Assignation de gestionnaire d'évènement.
 * @param {!Element} elem L'élément (ou son id) auquel ajouter le gestionnaire d'évènement.
 * @param {string} type Le type d'évènement à enregistrer.
 * @param {function} listener La fonction qui sera lancé lorsque l'évènement se produira.
 */
function addEvent(elem, type, listener) {
	if (typeof elem == 'string')
		elem = geid(elem);
	if (elem.addEventListener)
		elem.addEventListener(type, listener, false);
	else if (elem.attachEvent)
		elem.attachEvent('on'+type, listener);
}

/**
 * Extrait l'id du forum et l'id du topic d'une URL ou d'un bout d'URL.
 * @param {string} url L'URL.
 * @return {{forum_id: number, topic_id: number}} Un tableau avec l'id du forum et l'id du topic. Les id valent 0 si l'URL est invalide.
 */
function getTopicFromUrl(url) {
	var retour = {forum_id: 0, topic_id: 0};
	url_parts = url.split('-');
	if (url.length < 6 || url_parts.length < 3)
		return retour;
	retour.forum_id = url_parts[1];
	retour.topic_id = url_parts[2];
	return retour;
}

/**
 * @return {{forum_id: number, topic_id: number}} Array avec id forum et id topic extrait du hash dans l'URL.
 */
function getTopicFromHash() {
	return getTopicFromUrl(location.hash.substring(1));
}

function startTheEngine() {
	addEvent(window, 'blur', function() {
		window_visible = false;
		setTitleAlerts();
	});
	addEvent(window, 'focus', function() {
		window_visible = true;
		unalertTab(_tab_current);
		setTitleAlerts();
		/*if (geid('_jvchat_localhost')) {
			showError('setTitleAlerts window.onfocus '+microtime());
		}*/
	});

	document.title = TITLE;
	
	/* CSS */
	var elem = ce('style');
	elem.setAttribute('type', 'text/css');
	elem.innerHTML = '\
		/* CSS généré par JV Chat */ \
		#page {\
			padding: 10px;\
			width: 965px;\
		}\
		#input_area {\
			position: fixed !important;\
			bottom: 0;\
			left: 0;\
			width: 100%;\
			height: 110px;\
			background: #f0f0f0 !important;\
		}\
		#error_message {\
			position: fixed;\
			top: 15px;\
			right: 20px;\
			background: #c33;\
			background: -webkit-linear-gradient(top, #fff 0%, #f8f8f8 100%);\
			background: -moz-linear-gradient(top, #fff 0%, #f8f8f8 100%);\
			padding: 5px 15px 10px;\
			border: 2px solid #ccc;\
			z-index: 2025;\
			box-shadow: 0 0 20px rgba(0, 0, 0, .5);\
		}\
		#error_message small {\
			font-size: 70%;\
			letter-spacing: 1px;\
			color: #333;\
		}\
		#error_message p {\
			padding-top: 5px;\
			text-align: left;\
		}\
		.chat big {\
			font-size: 300%;\
			color: #53637d;\
			letter-spacing: 2px;\
		}\
		section {\
			border-top: 1px solid #eee;\
			padding: 15px 0;\
		}\
		section p {\
			color: #222;\
			margin-bottom: 5px;\
		}\
		#form_newtopic #topic_addr { width: 400px; }\
		#tabs { max-width: 965px; }\
		#tabs {\
			position: fixed;\
			top: 0px;\
			padding: 10px 0; \
			z-index: 2024;\
			background: -webkit-linear-gradient(rgba(255, 255, 255, .7), rgba(255, 255, 255, 0));\
			background: -moz-linear-gradient(rgba(255, 255, 255, .7), rgba(255, 255, 255, 0));\
		}\
		#tabs li {\
			display: inline-block;\
			padding: 5px 7px;\
			margin: 0 7px 7px 0;\
			font-size: 105%;\
			font-weight: bold;\
			border: 1px solid rgba(0, 0, 0, .2);\
			background: rgba(234, 238, 243, 1);\
			color: #426dc9;\
			text-shadow: white 0 1px 1px;\
			cursor: default;\
			-webkit-user-select: none;\
			-moz-user-select: none;\
		}\
		#tabs li[blink_on] {\
			border: 1px solid rgba(0, 0, 0, .1);\
			background: rgba(234, 238, 243, .5);\
		}\
		#tabs li small {\
			display: inline-block;\
			width: 11px;\
			height: 11px;\
			background: url(//image.jeuxvideo.com/css_img/defaut/mprives/supp_dest.png);\
			border-radius: 5px;\
			opacity: .5;\
		}\
		#tabs li span {\
			display: none;\
		}\
		#tabs li[alerted] span {\
			display: inline-block;\
			color: white;\
			text-shadow: none;\
			background: black;\
			font-size: 70%;\
			min-width: 14px;\
			min-height: 14px;\
			line-height: 14px;\
			text-align: center;\
			border-radius: 999px;\
		}\
		#tabs li.tab_visible small, #tabs li small:hover {\
			opacity: 1;\
		}\
		#tabs li small:hover {\
			background-position: right;\
		}\
		#tabs li small:active {\
			opacity: .5;\
		}\
		.tab_visible {\
			box-shadow: 0px 1px 0px #ddd;\
			background: #d3deee !important;\
			border: 1px solid #8faad9 !important;\
			color: black !important;\
			text-shadow: rgba(255, 255, 255, 0.5) 0 1px 1px !important;\
		}\
		#tabs li:active {\
			border: 1px solid #8faad9;\
			background: #f1f4f7;\
		}\
		big, .titre_page,  #error_message {\
			cursor: default;\
		}\
		#post {\
			border-top: 1px solid #eee;\
			padding: 5px;\
			clear: both;\
			background: -webkit-linear-gradient(top, #fff 0%, #f8f8f8 100%);\
			background: -moz-linear-gradient(top, #fff 0%, #f8f8f8 100%);\
		}\
		#my {\
			text-align: center;\
			width: 90px;\
		}\
		#my #avatar {\
			display: table-cell;\
			width: 90px;\
			height: 90px;\
			vertical-align: middle;\
		}\
		#my #avatar img {\
			max-width: 70px;\
			max-height: 70px;\
			box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4);\
		}\
		#form {\
			width: 787px;\
			float: right;\
		}\
		textarea {\
			border: 1px solid #D9D9D9;\
			border-radius: 2px;\
			padding: 5px 6px;\
		}\
		textarea:focus {\
			box-shadow: 0 0 20px #ccc;\
		}\
		#area {\
			width: 690px;\
			height: 80px;\
			font-family: Arial, Helvetica, sans-serif;\
			font-size: 98%;\
			outline: none;\
		}\
		input[type="submit"] {\
			border-radius: 2px;\
			box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);\
			background: -webkit-linear-gradient(#fafafa, #f4f4f4 40%, #e5e5e5);\
			background: -moz-linear-gradient(#fafafa, #f4f4f4 40%, #e5e5e5);\
			-webkit-user-select: none;\
			-moz-user-select: none;\
			border: 1px solid #aaa;\
			color: #444;\
			margin-bottom: 0px;\
			min-width: 4em;\
			padding: 3px 12px;\
		}\
		#firefox input[type="submit"] {\
			padding: 2px 8px;\
		}\
		input[type="submit"]:hover {\
			box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);\
			background: #ebebeb -webkit-linear-gradient(#fefefe, #f8f8f8 40%, #e9e9e9);\
			background: #ebebeb -moz-linear-gradient(#fefefe, #f8f8f8 40%, #e9e9e9);\
			border-color: #999;\
			color: #222;\
		}\
		input[type="submit"]:active, input[type="submit"][disabled] {\
			box-shadow: inset 0px 1px 3px rgba(0, 0, 0, 0.2);\
			background: #ebebeb -webkit-linear-gradient(#f4f4f4, #efefef 40%, #dcdcdc);\
			background: #ebebeb -moz-linear-gradient(#f4f4f4, #efefef 40%, #dcdcdc);\
			color: #333;\
		}\
		input[type="submit"][disabled] { color: #888; }\
		input[type="text"] {\
			border: 1px solid #aaa;\
			border-radius: 2px;\
			padding: 3px;\
		}\
		#form #div {\
			float: right;\
		}\
		.chat_original {\
			display: none;\
		}\
		.msg > div {\
			display: inline;\
		}\
		.msg .pseudo.moderateur a {\
			color: #c00 !important;\
		}\
		.msg .pseudo.myself a {\
			color: #06f !important;\
		}\
		.msg .pseudo a[adios] {\
			color: #666 !important;\
		}\
		.msg .pseudo a {\
			width: 18%;\
			color: #111 !important;\
			font-weight: bold;\
			float: left;\
			word-wrap: break-word;\
			text-align: right;\
			vertical-align: middle;\
		}\
		.msg .pseudo a:hover {\
			text-decoration: underline;\
		}\
		.msg .pseudo .avatar {\
			width: 28px;\
			height: 25px;\
			float: right;\
			margin-right: 8px;\
			vertical-align: bottom;\
		}\
		.msg .pseudo a img {\
			max-width: 22px;\
			max-height: 22px;\
		}\
		.msg .pseudo .text {\
			line-height: 20px;\
		}\
		.msg .message {\
			float: left;\
			width: 80%;\
			padding: 5px;\
			margin: 0 0 8px;\
			background: #f4f4f4;\
			word-wrap: break-word;\
			box-shadow: 0 0 8px rgba(0, 0, 0, .2);\
		}\
		.msg.msg1 .message {\
			background: white;\
		}\
		.msg.msg1 {\
			border: none; /* bugfix pour le skin JV jaune */\
		}\
		.msg .message a {\
			color: #3f6ec2 !important;\
		}\
		.msg .message a:hover {\
			text-decoration: underline;\
		}\
		.msg .message a i {\
			font-style: normal;\
			padding-right: 19px;\
			background: url(//image.jeuxvideo.com/css_img/defaut/liens_tronq.png) right -197px no-repeat;\
		}\
		.msg .message a span {\
			position: absolute;\
			left: -9999em;\
			letter-spacing: -1em;\
		}\
		.msg .date {\
			float: right;\
			background: -webkit-linear-gradient(#fafafa, #f4f4f4 40%, #eee);\
			background: -moz-linear-gradient(#fafafa, #f4f4f4 40%, #eee);\
			border: 1px solid #ccc;\
			border-radius: 2px;\
			color: #222;\
			padding: 1px 3px;\
			cursor: default;\
		}\
		.msg .date span {\
			color: #633;\
		}\
		::selection, ::moz-selection, ::webkit-selection {\
			background-color: #bbcee9;\
			color: white;\
		}\
		#options {\
			clear: both;\
			border-top: 1px solid #eee;\
			padding-top: 5px;\
			margin-top: 10px;\
		}\
		#options a {\
			margin-right: 10px;\
			color: #69c !important;\
		}\
		#options a:hover {\
			text-decoration: underline;\
		}\
		.derniers_topics li {\
			color: #3f6ec2;\
			cursor: pointer;\
		}\
		.derniers_topics li:hover {\
			text-decoration: underline;\
		}\
		.derniers_topics li.not_a_link { text-decoration: none; color: #99a; cursor: default; }\
		[historique] #form, [historique] #options { display: none; } \
		#tabs li#tab'+NEWTAB_ID+' { padding: 5px 12px; } \
		#fake_tabs { display: block; }\
	';
	/* CSS : Code de confirmation.
	La class confirm est appliquée sur #form quand le code de confirmation apparaît. */
	elem.innerHTML += '\
		#ccode img {\
			width: 100px;\
			height: 22px;\
			border-radius: 2px;\
		}\
		#confirmation {\
			width: 92px;\
			margin-top: 10px;\
		}\
		.confirm input[type="submit"] {\
			width: 100px;\
		}\
		.confirm #area {\
			width: 660px;\
		}\
	';
	getag('head')[0].appendChild(elem);
	/* Hacks Firefox. */
	if (navigator.userAgent.indexOf('Firefox') != -1)
		getag('html')[0].id = 'firefox';
	/* /CSS */
	
	removeElement('contenu', 'menu2', 'recherche', 'banner', 'header');
	
	/* Création des onglets. */
	ce('ul', {id: 'tabs'}, 'page');
	ce('ul', {id: 'fake_tabs', innerHTML: '&nbsp;'}, 'page');
	//ce('li', {id: 'tab_open', innerHTML: '&#10011;', title: 'Ouvrir un nouvel onglet'}, 'tabs');
	//addEvent(geid('tab_open'), 'click', openNewTab);
	
	/* Création de la zone de chat. */
	ce('div', {id: 'chat-area'}, 'page');
	var opening_hash = location.hash;
	var new_tab_id = openBlankTab();
	switchToTab(new_tab_id);
	openOldCurrentTabs();
	(function(){location.hash = opening_hash;})();
	adjustTabsPosition();
	
	/* Création du formulaire. */
	var my_pseudo = getMyPseudo();
	ce('div', {id: 'post'}, 'page');
		ce('form', {id: 'form', method: 'post', autocomplete: 'off'}, 'post');
			ce('p', {id: 'p'}, 'form');
				ce('div', {id: 'div'}, 'p');
					ce('div', {id: 'ccode'}, 'div');
					ce('input', {type: 'submit', value: 'Envoyer', tabIndex: 3, id: 'send'}, 'div');
				ce('textarea', {id: 'area', tabIndex: 1}, 'p');
				if (my_pseudo === null)
					geid('area').setAttribute('placeholder', 'Veuillez vous connecter via le bouton en haut de page. Après vous êtes connecté JV Chat apparaîtra normalement.');
				else
					geid('area').focus();
				ce('span', {id: 'hiddens'}, 'p');
		ce('div', {id: 'my'}, 'post');
			ce('div', {id: 'avatar', title: my_pseudo}, 'my');
			loadMyAvatar(my_pseudo);
		ce('div', {id: 'options'}, 'post');
			ce('a', {href: '#', write: 'topic', target: '_blank', id: 'topic_link'}, 'options');
			ce('a', {href: '#', write: 'forum', target: '_blank', id: 'forum_link'}, 'options');
			ce('a', {href: '#', write: 'statistiques', id: 'stats_link'}, 'options');
	addEvent(geid('form'), 'submit', postMessage);
	addEvent(geid('stats_link'), 'click', showStats);
	
	if ('onhashchange' in window)
		addEvent(window, 'hashchange', openNewTabFromHash);
	else
		showError('Votre navigateur est trop vieux et ne supportera pas certaines fonctions utilisant la technologie "onhashchange".');
	
	if ( ! localStorage)
		showError('Votre navigateur est trop vieux et ne supportera pas certaines fonctions utilisant la technologie "localStorage".');
	
	addEvent(window, 'scroll', adjustTabsPosition);
}

function loadMyAvatar(pseudo) {
	if(pseudo === null) {
		pseudo = getMyPseudo();
	}
	pseudo = pseudo.toLowerCase();
	
	var xhr = getXhr();
	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4)
			return ;
		
		var my_avatar = '//image.jeuxvideo.com/avatars/' + strBetween(xhr.responseText, '<img src="http://image.jeuxvideo.com/avatars/', '" border="0"');
		if ( ! my_avatar || my_avatar == DEFAULT_AVATAR_URL) {
			_avatars_url[pseudo] = false;
		}
		else {
			_avatars_url[pseudo] = my_avatar;
			ce('img', {src: my_avatar}, 'avatar');
		}
	}
	xhr.open('GET', '/profil/'+pseudo+'.html', true);
	xhr.send(null);
}

function openNewTab(forum_id, topic_id) {
	_tab_count++;
	var tab_id = _tab_count;
	
	_tab[tab_id] = {
		refresh_timer: 0,
		forum_id: 0,
		topic_id: 0,
		url_name: 0,
		topic_name: '',
		forum_name: '',
		forum_url_name: 0,
		last_message_even: 0,
		last_refresh: 0,
		hiddens: 0,
		last_hiddens: 0,
		hiddens_ccode: 0,
		is_new: true,
		blink_timer: 0,
		blink_iterations: 0,
		yoffset: 0,
		textarea: ''
	};
	
	ce('li', {write: 'Nouvel Onglet', id: 'tab'+tab_id}, 'tabs');
	addEvent(geid('tab'+tab_id), 'click', function(e) { switchToTab(tab_id); });
	ce('div', {id: 'chat'+tab_id, className: 'chat'}, 'chat-area');
	
	if (typeof topic_id != 'undefined') {
		/* On vérifie si le topic n'est pas déjà présent. */
		in_a_tab = isTopicInATab(forum_id, topic_id)
		if (in_a_tab) {
			switchToTab(in_a_tab);
			closeTab(tab_id);
			return in_a_tab;
		}
		
		_tab[tab_id].forum_id = forum_id;
		_tab[tab_id].topic_id = topic_id;
		loadTopic(tab_id);
	}
	else {
		var data = getTopicFromHash();
		if (data.topic_id != 0 && ! topicExistsInAnyTab(data.forum_id, data.topic_id)) {
			_tab[tab_id].forum_id = data.forum_id;
			_tab[tab_id].topic_id = data.topic_id;
			
			loadTopic(tab_id);
		}
		else {
			if (isThereANewTab() && isThereANewTab() != tab_id) {
				switchToTab(isThereANewTab());
				closeTab(tab_id);
				return false;
			}
			
			geid('tab'+tab_id).innerHTML = '&nbsp;';
			
			geid('chat'+tab_id).innerHTML += '\
			<big>Nouvel Onglet</big> \
			<section> \
				<p>Entrez l\'adresse d\'un topic :</p> \
				<form id="form_newtopic"><input type="text" id="topic_addr" placeholder="http://www.jeuxvideo.com/forums/*" /><input type="submit" value="Charger" /></form> \
			</section> \
			';
			
			geid('chat'+tab_id).innerHTML += '\
			<section> \
				<p>Ou, accédez à l\'un des '+MAX_LAST_TOPICS+' derniers topics visités :</p> \
				<ul id="derniers_topics'+tab_id+'" class="derniers_topics"></ul>\
			</section> \
			';
			updateLastTopicsList();
			
			addEvent(geid('form_newtopic'), 'submit', function(e) { loadTopicFromInput(e, tab_id); });
		}
	}
	
	switchToTab(tab_id);
	
	return tab_id;
}

function openBlankTab(forum_id, topic_id) {
	_tab_count++;
	var tab_id = _tab_count;
	
	_tab[tab_id] = {
		refresh_timer: 0,
		forum_id: 0,
		topic_id: 0,
		url_name: 0,
		topic_name: '',
		forum_name: '',
		forum_url_name: 0,
		last_message_even: 0,
		last_refresh: 0,
		hiddens: 0,
		last_hiddens: 0,
		hiddens_ccode: 0,
		is_new: true,
		blink_timer: 0,
		blink_iterations: 0,
		yoffset: 0,
		textarea: ''
	};
	
	ce('li', {write: 'Nouvel Onglet', id: 'tab'+tab_id}, 'tabs');
	addEvent(geid('tab'+tab_id), 'click', function(e) { switchToTab(tab_id); });
	ce('div', {id: 'chat'+tab_id, className: 'chat'}, 'chat-area');
	
	var data = getTopicFromHash();

	if (isThereANewTab() && isThereANewTab() != tab_id) {
		switchToTab(isThereANewTab());
		closeTab(tab_id);
		return false;
	}
	
	geid('tab'+tab_id).innerHTML = '&nbsp;';
	
	geid('chat'+tab_id).innerHTML += '\
	<big>Historique</big> \
	<section style="display: none"> \
		<p>Entrez l\'adresse d\'un topic :</p> \
		<form id="form_newtopic"><input type="text" id="topic_addr" placeholder="http://www.jeuxvideo.com/forums/*" /><input type="submit" value="Charger" /></form> \
	</section> \
	';
	/* On cache sans supprimer car utilisé en interne avec LoadTopicFromInput() */
	
	geid('chat'+tab_id).innerHTML += '\
	<section> \
		<!--<p>Ou, accédez à l\'un des '+MAX_LAST_TOPICS+' derniers topics visités :</p>--> \
		<ul id="derniers_topics'+tab_id+'" class="derniers_topics"></ul>\
	</section>';
	updateLastTopicsList();
	
	addEvent(geid('form_newtopic'), 'submit', function(e) { loadTopicFromInput(e, tab_id); });
	
	switchToTab(tab_id);
	
	return tab_id;
}

function updateLastTopicsList() {
	if (!geid('derniers_topics'+NEWTAB_ID)) { // l’élément n’existe pas s’il n’y a pas d’historique
		return;
	}
	geid('derniers_topics'+NEWTAB_ID).innerHTML = '';
	geid('topic_addr').value = '';
	var elem;
	var last_topics = getLastTopics();
	if (last_topics.length == 0) {
		elem = ce('li', {write: 'Vous n’avez encore visité aucun topic.', className: 'not_a_link'}, 'derniers_topics'+NEWTAB_ID);
	}
	for (var i in last_topics) {
		elem = ce('li', {innerHTML: last_topics[i][3]+' ('+last_topics[i][4]+')'}, 'derniers_topics'+NEWTAB_ID);
		elem.dataset.url = '3-'+last_topics[i][0]+'-'+last_topics[i][2]+'-1-0-1-0-'+last_topics[i][1]+'.htm';
		addEvent(elem, 'click', function(e) {
			geid('topic_addr').value = e.target.dataset.url;
			loadTopicFromInput(e);
		});
	}
}

/* ouvre un onglet *uniquement* si le topic dans le hash est valide */
function openNewTabFromHash() {
	var data = getTopicFromHash();
	if (data.topic_id != 0) {
		if (isTopicInATab(data)) {
			switchToTab(isTopicInATab(data));
		}
		else {
			openNewTab(data.forum_id, data.topic_id);
		}
	}
}

function switchToTab(tab_id) {
	if (geid('chat'+tab_id) == null) {
		/* L'onglet n'existe pas, ça arrive quand on clique sur le bouton de fermeture de l'onglet. */
		return ;
	}
	
	if (tab_id == NEWTAB_ID) {
		updateLastTopicsList();
		document.body.setAttribute('historique', '');
	}
	else {
		document.body.removeAttribute('historique');
	}
	
	if (_tab_current != 0 && geid('chat'+_tab_current) != null) {
			geid('chat'+_tab_current).style.display = 'none';
			geid('tab'+_tab_current).className = '';
	}
	geid('chat'+tab_id).style.display = 'block';
	geid('tab'+tab_id).className = 'tab_visible';
	
	if (geid('area')) {
		_tab[_tab_current].textarea = geid('area').value;
	}
	
	_tab_current = tab_id;
	
	updateHashFromTab(tab_id);
	
	unalertTab(tab_id);
	setTitleAlerts();
	
	if (geid('topic_link'))
		geid('topic_link').href = '/forums/1-'+_tab[tab_id].forum_id+'-'+_tab[tab_id].topic_id+'-1-0-1-0-'+_tab[tab_id].url_name+'.htm';
	if (geid('forum_link'))
		geid('forum_link').href = '/forums/0-'+_tab[tab_id].forum_id+'-0-1-0-1-0-'+_tab[tab_id].forum_url_name+'.htm';
	
	scrollTo(0, _tab[_tab_current].yoffset);
	if (geid('area')) {
		geid('area').value = _tab[_tab_current].textarea;
	}
}

/* Met à jour le hash dans la barre d'adresse en fonction du topic visité. */
function updateHashFromTab(tab_id) {
	if (typeof tab_id == 'undefined') {
		tab_id = _tab_current;
	}
	
	if (_tab[tab_id].forum_id != 0 && _tab[tab_id].topic_id != 0) {
		location.hash = '#3-'+_tab[tab_id].forum_id+'-'+_tab[tab_id].topic_id+'-1-0-1-0-'+_tab[tab_id].url_name+'.htm';
	}
	else {
		location.hash = '';
	}
}

function loadTopic(tab_id) {
	if ( ! isTabValid(tab_id)) {
		showError('loadTopic invalid tab'+tab_id);
		return;
	}
	_tab[tab_id].is_new = false;
	geid('chat'+tab_id).innerHTML = '';
	ce('big', {write: 'Chargement…', id: 'tab_big'+tab_id}, 'chat'+tab_id);
	refreshTopic(tab_id);
	return false;
}

function loadTopicFromInput(event, input) {
	event.preventDefault();
	
	var tab_id = _tab_current;
	var addr = input || geid('topic_addr').value;
	if ( ! addr) {
		showError("Adresse vide");
		return;
	}
	var data = getTopicFromUrl(addr);
	if (data.topic_id == 0) {
		geid('topic_addr').setAttribute('placeholder', geid('topic_addr').value);
		geid('topic_addr').value = '';
		showError("Adresse invalide");
		return;
	}
	if (isTopicInATab(data)) {
		switchToTab(isTopicInATab(data));
		//closeTab(tab_id);
	}
	else {
		openNewTab(data.forum_id, data.topic_id);
		/*_tab[tab_id].forum_id = data.forum_id;
		_tab[tab_id].topic_id = data.topic_id;
		
		loadTopic(tab_id);*/
	}
}

function refreshTopic(tab_id) {
	if (typeof tab_id == 'object') {
		for (var i in _tab) {
			if ( _tab[i].forum_id == tab_id[0] && _tab[i].topic_id == tab_id[1] ) {
				tab_id = i;
				break;
			}
		}
	}
	
	if ( ! isTabValid(tab_id)) {
		/* Arrive parfois quand on vient tout juste de fermer l'onglet, l'onglet est supprimé mais le timer n'a pas eu le temps de se terminer. */
		return;
	}
	
	var xhr = getXhr();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status != 200 && status !== '') { // status === '' quand on quitte la page et qu'une requête charge
				showError('HTTP '+status);
			}
			
			_tab[tab_id].last_refresh = microtime();
			
			removeElement('tab_big'+tab_id); // "Chargement..."
			
			updateHashFromTab(); // On ne donne pas tab_id pour ne pas interférer si on est sur un autre onglet
			
			/* Afficher les messages dans le chat, et arrêter s'il y a une erreur. */
			if ( ! textToMessages(tab_id, xhr.responseText)) {
				return false;
			}
			
			/* Mise à jour formulaire */
			textToFormData(tab_id, xhr.responseText);
			
			/* Mise à jour timer */
			_tab[tab_id].refresh_timer = setTimeout('refreshTopic('+tab_id+')', _refresh_time.defaut);
			
			/* url_name */
			if (_tab[tab_id].url_name === 0) {
				var temp = strBetween(xhr.responseText, '<td class="revenir"><a href="http://www.jeuxvideo.com/forums/', '"><img');
				var url_name = '';
				for (var i = 7; i < temp.split('-').length; i++) {
					var name_part = temp.split('-')[i];
					if (name_part.split('.').length == 1) { // pas de .htm
						url_name += name_part + '-';
					}
					else {
						url_name += name_part.split('.')[0];
					}
				}
				_tab[tab_id].url_name = url_name;
			}
			
			/* Mise à jour derniers topics visités */
			updateLastTopics(tab_id);
			
			/* Sauvegarde des onglets en cours. */
			saveCurrentTabs();
			
			/* forum_url_name */
			if (_tab[tab_id].forum_url_name === 0) {
				var forum_url_name = strBetween(xhr.responseText, '<td class="nouveau"><a href="http://www.jeuxvideo.com/forums/0-'+_tab[tab_id].forum_id+'-0-1-0-1-0-', '.htm');
				if ( ! forum_url_name) {
					forum_url_name = 0;
				}
				_tab[tab_id].forum_url_name = forum_url_name;
			}
			
			/* Mise à jour des liens vers topic/forum. */
			if (_tab_current == tab_id) {
				if (geid('topic_link'))
					geid('topic_link').href = '/forums/1-'+_tab[tab_id].forum_id+'-'+_tab[tab_id].topic_id+'-1-0-1-0-'+_tab[tab_id].url_name+'.htm';
				if (geid('forum_link'))
					geid('forum_link').href = '/forums/0-'+_tab[tab_id].forum_id+'-0-1-0-1-0-'+_tab[tab_id].forum_url_name+'.htm';
			}
		}
	};
	xhr.open('GET', '/forums/3-'+_tab[tab_id].forum_id+'-'+_tab[tab_id].topic_id+'-1-0-1-0-'+_tab[tab_id].url_name+'.htm', true);
	xhr.send(null);
}

function textToMessages(tab_id, text) {
	var parsed = strBetween(text, '</h4>', '<div class="bloc_forum">');
	if ( ! parsed && ! geid('chat_original'+tab_id)) {
		showError('Un topic n\'existait pas/plus. L\'onglet a été fermé.');
		closeTab(tab_id);
		return false;
	}
	parsed = stringToDom(parsed.replace(/<div id="message_/g, '<div id="mayssage-'+_tab[tab_id].forum_id+'_'));
	if ( ! geid('chat_original'+tab_id)) {
		ce('div', {id: 'chat_original'+tab_id, className: 'chat_original'}, document.body);
	}
	geid('chat_original'+tab_id).innerHTML = '';
	geid('chat_original'+tab_id).appendChild(parsed);
	for (var i in geid('chat_original'+tab_id).children) {
		var child = geid('chat_original'+tab_id).children[i];
		
		if(typeof child.id != 'undefined' && child.id != '') {
			var message_id = child.id.replace(/mayssage/g, 'message');
			if ( ! geid(message_id)) {
				if (child.children[0].children[0].className == 'suite_sujet') {
					/* Le "message" est un split, on ignore. */
					continue;
				}
				_tab[tab_id].last_message_even = _tab[tab_id].last_message_even ? 0 : 1;
				ce('div', {id: message_id, className: 'msg msg'+_tab[tab_id].last_message_even}, 'chat'+tab_id);
				/* Pseudo */
				var pseudoElem = child.children[0].children[0].children;
				pseudoElem = pseudoElem[pseudoElem.length - 2];
				var pseudoClassName = '';
				var pseudo = pseudoElem.innerHTML;
				var pseudo_low = pseudo.toLowerCase();
				
				if (pseudo_low == getMyPseudo().toLowerCase()) {
					pseudoClassName = 'myself';
				}
				else if (pseudoElem.className && pseudoElem.className == 'moderateur') {
					pseudoClassName = 'moderateur';
				}
				
				var avatar_url = getAvatarFromPseudo(pseudo);
				ce('div', {className: 'pseudo '+pseudoClassName, innerHTML: '<a href="/profil/'+pseudoElem.innerHTML+'.html" target="profil" title="'+pseudo_low+'"><div class="avatar">'+(avatar_url ? '<img src="'+avatar_url+'" class="avatar_img" />' : '')+'</div><div class="text">'+pseudo+'</div></a>'}, message_id);
				
				/* Message */
				var message = child.children[0].children[2].innerHTML;
				var e = ce('div', {className: 'message', innerHTML: message}, message_id);
				
				/* Date */
				var date = strBetween(child.children[0].children[1].innerHTML, 'le ', '<').trim();
				date = date.split('à').pop().trim();
				var via_mobile = strBetween(child.children[0].children[1].innerHTML, '<span>', '</span>');
				if (via_mobile)
					via_mobile = '<span>mobile</span> ';
				else
					via_mobile = '';
				if (child.children[0].children[2].innerHTML.indexOf(String.fromCharCode(32,28,31,29,30)) != -1)
					via_mobile = '<span>armé</span> ';
				e.innerHTML = '<div class="date">'+via_mobile+date+'</div>' + e.innerHTML;
				
				/* tabclose+tab_id n'existe pas encore si on vient d'ouvrir l'onglet. */
				if (geid('tabclose'+tab_id) && (tab_id != _tab_current || ! window_visible)) {
					alertTab(tab_id);
				}
				setTitleAlerts();
			}
		}
	}
	_tab[tab_id].topic_name = strBetween(text, '&laquo;&nbsp;', '&nbsp;&raquo;');
	_tab[tab_id].forum_name = strBetween(text, 'Forum : </span>', '</h3>');
	if (geid('tabclose'+tab_id) == null) {
		geid('tab'+tab_id).innerHTML = _tab[tab_id].topic_name+' ('+_tab[tab_id].forum_name+') ';
		geid('tab'+tab_id).innerHTML += '<span id="alerte'+tab_id+'">0</span> ';
		
		ce('small', {id: 'tabclose'+tab_id, innerHTML: ''}, 'tab'+tab_id);
		addEvent('tabclose'+tab_id, 'click', function(e) { closeTab(this); });
		addEvent('tab'+tab_id, 'mouseup', function(e) {
			if (e.which == 2) // clic molette
				closeTab(this);
			});
		
		adjustTabsPosition();
	}
	
	return true;
}

function stringToDom(str) {
	var range = document.createRange();
	range.selectNode(document.body);
	return range.createContextualFragment(str);
}

function strBetween(origin, begin, end) {
	var _1 = origin.split(begin)[1];
	if (typeof _1 == 'undefined') {
		return false;
	}
	var _2 = _1.split(end)[0];
	return _2;
}

function postMessage(event) {
	event.preventDefault();
	
	var tab_id = _tab_current;
	
	var post_data_raw = {};
	
	/* Désactivation du bouton pour poster. */
	geid('send').setAttribute('disabled', '');
	setTimeout("geid('send').removeAttribute('disabled')", 1000);
	
	geid('hiddens').innerHTML = '';
	if (_tab[tab_id].hiddens_ccode) {
		geid('hiddens').appendChild(_tab[tab_id].hiddens_ccode);
	}
	else {
		var now = microtime();
		if (_tab[tab_id].last_refresh > now) {
			_tab[tab_id].last_refresh -= 60;
		}
		if (now - _tab[tab_id].last_refresh < 1) {
			geid('hiddens').appendChild(_tab[tab_id].last_hiddens);
		}
		else {
			geid('hiddens').appendChild(_tab[tab_id].hiddens);
		}
	}
	
	for (var i in geid('hiddens').children) {
		var child = geid('hiddens').children[i];
		if (typeof child.value != 'undefined') {
			post_data_raw[child.name] = child.value;
		}
	}
	
	var xhr = getXhr();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status != 200) {
				showError('post status: '+xhr.status);
			}
			
			/* On n'a plus besoin du code de confirmation. */
			geid('ccode').innerHTML = '';
			geid('form').className = '';
			_tab[tab_id].hiddens_ccode = 0;
			
			/* Gestion des alertes. */
			var alerte = strBetween(xhr.responseText, '<p class="alerte">', '</p>');
			if (alerte) { // Erreur du formulaire de jeuxvideo.com
				if (xhr.responseText.indexOf('<p class="confirm">') != -1) {
					localStorage.alerte_ccode = alerte; // Pour le débug.
					showCcode(xhr.responseText);
					alert(xhr.responseText);
				}
				else {
					showError('<u>Formulaire</u> : '+alerte, true);
				}
			}
			else {
				alert(xhr.responseText);
				// Message posté (supposément) correctement
				if ( ! geid('text_back')) {
					ce('a', {id: 'text_back', href: '#', write: 'récupérer texte'}, 'options');
					addEvent(geid('text_back'), 'click', getTextBack);
				}
				if (tab_id == _tab_current) { // on vérifie qu’on a pas changé d’onglet entre temps
					_last_post = geid('area').value;
					geid('area').value = '';
					geid('area').focus();
				}
				updateNbMessages();
			}
			
			clearTimeout(_tab[tab_id].refresh_timer);
			refreshTopic(tab_id);
		}
	};
	xhr.open('POST', '/cgi-bin/jvforums/forums.cgi', true);
	var post_data = 'yournewmessage='+escapeURIComponent(geid('area').value);
	for (var i in post_data_raw) {
		post_data += '&'+i+'='+post_data_raw[i];
	}
	if (geid('confirmation')) {
		post_data += '&session='+gen('session')[0].value;
		post_data += '&code='+parseInt(gen('code')[0].value);
		post_data += '&Submit.x=0&Submit.y=0';
	}
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send(post_data);
}

function textToFormData(tab_id, text, ccode) {
	var parsed = stringToDom('<input'+strBetween(text, "<fieldset>\n<input", '<div class="login_memo">'));
	if (ccode) {
		_tab[tab_id].hiddens_ccode = parsed;
	}
	_tab[tab_id].last_hiddens = _tab[tab_id].hiddens;
	_tab[tab_id].hiddens = parsed;
}

function escapeURIComponent(str) {
	str = encodeURIComponent(str);
	
	var i, pkmn, len, index, evolution;
	for (i = 0; i < str.length; i++) {
		if (str[i] == '%') { // un caractère spécial apparaît
		
			if (str[i + 1] == 'E') { // le caractère prend 3 bits
				len = 9; // %xx%xx%xx
			}
			else { // 2 bits
				len = 6; // %xx%xx
			}
			
			pkmn = str.substr(i, len);
			
			index = COWARD_CHARS.indexOf(pkmn);
			if (index != -1) {
				index += 128;
				if ((index >= 138 && index <= 143)
				|| (index >= 154 && index <= 159)
				|| (index >= 201 && index <= 207)
				|| (index >= 217 && index <= 223)) {
					if (index <= 143) {
						evolution = EXTREMELY_COWARD_CHARS_SOLUTIONS[0][index - 138];
					}
					else if (index <= 159) {
						evolution = EXTREMELY_COWARD_CHARS_SOLUTIONS[1][index - 154];
					}
					else if (index <= 207) {
						evolution = EXTREMELY_COWARD_CHARS_SOLUTIONS[2][index - 201];
					}
					else if (index <= 223) {
						evolution = EXTREMELY_COWARD_CHARS_SOLUTIONS[3][index - 217];
					}
					else {
						showError('EXTREMELY_COWARD_CHARS_SOLUTIONS not found');
					}
				}
				else {
					evolution = index.toString(16);
					if (evolution.length == 1) {
						evolution = '0' + evolution;
					}
					evolution = '%' + evolution;
				}
				
				str = str.substr(0, i) + evolution + str.substr(i + len);
			}
		}
	}
	return str;
}

function getTextBack(event) {
	event.preventDefault();
	geid('area').value = _last_post;
}

function showStats(event) {
	event.preventDefault();
	_last_post = geid('area').value;
	geid('area').value = 'Nombre de messages postés sur JV Chat\n¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯';
	var messages = getNbMessages();
	var stats = [], max_idx, leave_it;
	for (var _ in messages) {
		stats.push(messages[_]);
	}
	for (var i in stats)
		geid('area').value += '\n'+stats[i][0]+' › '+stats[i][1]+' messages postés';
}

function getAvatarFromPseudo(pseudo) {
	pseudo = pseudo.toLowerCase();
	
	if (typeof _avatars_url[pseudo] != 'undefined') {
		return _avatars_url[pseudo];
	}
	_avatars_url[pseudo] = false;
	
	var url, url_id;
	var xhr = getXhr();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			url_id = strBetween(xhr.responseText, '<img src="http://image.jeuxvideo.com/avatars/', '" border="0"');
			if (url_id) { // url_id = false quand pseudo banni
				url = '//image.jeuxvideo.com/avatars/' + url_id;
			}
			else {
				url = false;
			}
			_avatars_url[pseudo] = url;
			
			if (url !== false) {
				for (var i in gec('avatar')) {
					var e = gec('avatar')[i];
					if (e.parentNode && e.parentNode.title) {
						if (e.parentNode.title === pseudo) {
							if (url != DEFAULT_AVATAR_URL) {
								ce('img', {src: url}, e);
							}
						}
					}
				}
			}
			
			if (url == DEFAULT_AVATAR_URL) {
				_avatars_url[pseudo] = false;
			}
			
			/* Détection d'un éventuel bannissement. */
			if (xhr.responseText.indexOf('<p class="banni">') != -1) {
				_banned[pseudo] = true;
				for (var i in getag('a')) {
					var e = getag('a')[i];
					if (e.title === pseudo) {
						e.setAttribute('adios', '')
					}
				}
			}
		}
	};
	xhr.open('GET', '/profil/'+pseudo+'.html', true);
	xhr.send(null);
	
	return false;
}

function isTabValid(tab_id) {
	return tab_id in _tab && _tab[tab_id].topic_id != 0;
}

function topicExistsInAnyTab(forum_id, topic_id) {
	for (var i in _tab) {
		if (typeof _tab[i].topic_id != 'undefined') {
			if (_tab[i].topic_id == topic_id && _tab[i].forum_id == forum_id) {
				return true;
			}
		}
	}
	return false;
}

function updateLastTopics(tab_id) {
	updateLastTopicsFormat();
	if (localStorage.last_topics2) {
		var is_in = isInLastTopics(_tab[tab_id].forum_id, _tab[tab_id].topic_id); // sans variable javascript réévalue la fonction dans else
		if (is_in) {
			/* Supprimer l'ancienne place du topic et le mettre en tête de liste */
			var old_list = getLastTopics();
			var new_list = [[_tab[tab_id].forum_id, _tab[tab_id].url_name, _tab[tab_id].topic_id, _tab[tab_id].topic_name, _tab[tab_id].forum_name].join('<')];
			for (var i in old_list) {
				if (!(old_list[i][0] == _tab[tab_id].forum_id && old_list[i][2] == _tab[tab_id].topic_id) && i < MAX_LAST_TOPICS) {
					new_list.push(old_list[i].join('<'));
				}
			}
			localStorage.last_topics2 = new_list.join('<<');
		}
		else {
			localStorage.last_topics2 = [_tab[tab_id].forum_id, _tab[tab_id].url_name, _tab[tab_id].topic_id, _tab[tab_id].topic_name, _tab[tab_id].forum_name].join('<') + '<<' + localStorage.last_topics2;
		}
	}
	else {
		localStorage.last_topics2 = [_tab[tab_id].forum_id, _tab[tab_id].url_name, _tab[tab_id].topic_id, _tab[tab_id].topic_name, _tab[tab_id].forum_name].join('<');
	}
}

function getLastTopics() {
	if (!localStorage.last_topics2 && !localStorage.last_topics) { // listes vides
		return [];
	}
	updateLastTopicsFormat();
	//return localStorage.last_topics.split('<');
	
	var retour = localStorage.last_topics2.split('<<');
	for (var i in retour) {
		retour[i] = retour[i].split('<');
	}
	return retour;
}

function isInLastTopics(forum_id, topic_id) {
	var topics = getLastTopics();
	for (var i in topics) {
		if (topics[i][0] == forum_id && topics[i][2] == topic_id) {
			return true;
		}
	}
	return false;
}

function updateLastTopicsFormat() {
	if (localStorage.last_topics) { // l’ancienne liste est là
		var new_list_raw = [];
		var i;
		for (i in localStorage.last_topics.split('<')) {
			var parts = localStorage.last_topics.split('<')[i].split('-');
			var url_name_start = 0;
			for (var j = 0; j < 7; j++) {
				url_name_start += parts[j].length + 1;
			}
			var url_name = localStorage.last_topics.split('<')[i].substring(url_name_start);
			url_name = url_name.substr(0, url_name.length - 4);
			new_list_raw.push(parts[1]+'<'+url_name+'<'+parts[2]+'<'+url_name+'<'+parts[1]);
		}
		localStorage.last_topics1 = localStorage.last_topics;
		localStorage.removeItem('last_topics');
		localStorage.last_topics2 = new_list_raw.join('<<');
	}
}

function isTopicInATab(data, topic_id_) {
	if (topic_id_) {
		data = {forum_id: data, topic_id: topic_id_};
	}
	for (var i = 1; i < _tab.length; i++) {
		if (_tab[i].forum_id == data.forum_id && _tab[i].topic_id == data.topic_id) {
			return i;
		}
	}
	return false;
}

function isThereANewTab() {
	for (var i = 1; i < _tab.length; i++) {
		if (_tab[i].is_new) {
			return i;
		}
	}
	return false;
}

function closeTab(tab_id) {
	if (typeof tab_id == 'object') { // appelé via addEvent
		if (tab_id.id.length > 8 ) // tabclose*
			tab_id = parseInt(tab_id.id.substr(8)); // tabclose*
		else
			tab_id = parseInt(tab_id.id.substr(3)); // tab*
	}
	
	if (_tab[tab_id].refresh_timer != 0) {
		clearTimeout(_tab[tab_id].refresh_timer);
		updateLastTopics(tab_id);
	}
	
	_tab[tab_id] = {
		refresh_timer: 0,
		forum_id: 0,
		topic_id: 0,
		url_name: 0,
		topic_name: '',
		forum_name: '',
		forum_url_name: 0,
		last_message_even: 0,
		last_refresh: 0,
		hiddens: 0,
		last_hiddens: 0,
		hiddens_ccode: 0,
		is_new: false,
		blink_timer: 0,
		blink_iterations: 0,
		yoffset: 0,
		textarea: ''
	};
	
	updateHashFromTab(tab_id);
	
	removeElement('tab'+tab_id, 'chat'+tab_id);
	
	if (tab_id == _tab_current) { // On est sur l'onglet qui se ferme
		switchToAnyTab();
	}
	
	saveCurrentTabs();
	adjustTabsPosition();
}

function switchToAnyTab() {
	var tabs = [];
	for (var i = 1; i < _tab.length; i++) {
		if (geid('tab'+i) != null) {
			tabs.push(i);
		}
	}
	if (tabs.length) {
		switchToTab(tabs[tabs.length - 1]);
		return;
	}
	openNewTab();
}

function microtime() {
	var date = new Date();
	return date.getSeconds() + date.getMilliseconds() / 1000;
}

function updateNbMessages(pseudo) {
	/* Récupération du pseudo. */
	if ( ! pseudo) {
		pseudo = getMyPseudo();
	}
	pseudo = pseudo.toLowerCase();
	
	/* Récupération des messages. */
	var messages = [];
	if (localStorage.messages) {
		messages = localStorage.messages.split(',');
		var split;
		for (var i in messages) {
			split = messages[i].split(':');
			messages[i] = [split[0], parseInt(split[1])];
		}
	}
	
	/* Mise à jour du nombre de messages. */
	var found = false;
	for (var i in messages) {
		if (messages[i][0] == pseudo) {
			found = true;
			messages[i][1] += 1;
			break;
		}
	}
	if ( ! found) {
		messages.push([pseudo, 1]);
	}
	
	var local_storage_string = '';
	for (var i in messages) {
		local_storage_string += messages[i][0]+':'+messages[i][1]+',';
	}
	local_storage_string = local_storage_string.substr(0, local_storage_string.length - 1); // Suppression de la dernière virgule.
	localStorage.messages = local_storage_string;
}

function getNbMessages(pseudo) {
	if (typeof pseudo != 'undefined') {
		pseudo = pseudo.toLowerCase();
		var got = getNbMessages();
		for (var i in got)
			if (got[i][0] == pseudo)
				return got[i][1];
		return 0;
	}
	
	var messages = [];
	if (localStorage.messages) {
		var messages_raw = localStorage.messages.split(',');
		var split;
		for (var i in messages_raw) {
			split = messages_raw[i].split(':');
			split[0] = filtre_pseudo(split[0]);
			/* On cherche si le pseudo n'existe pas déjà, il peut exister en double s'il comporte des caractères spéciaux à cause d'un ancien bug. */
			var leave_it = false;
			for (var j in messages) {
				if (messages[j][0] == split[0]) {
					messages[j][1] += parseInt(split[1]);
					leave_it = true;
					break;
				}
			}
			if ( ! leave_it) {
				messages[i] = [split[0], parseInt(split[1])];
			}
		}
	}
	
	return messages;
}

function saveCurrentTabs() {
	var local_storage_string = '';
	for (var i = 1; i < _tab.length; i++) {
		if (_tab[i].forum_id != 0) {
			local_storage_string += _tab[i].forum_id+'-'+_tab[i].topic_id+'-'+_tab[i].url_name+',';
		}
	}
	local_storage_string = local_storage_string.substr(0, local_storage_string.length - 1); // Suppression de la dernière virgule.
	localStorage.currentTabs = local_storage_string;
}

function openOldCurrentTabs() {
	if ( ! localStorage.currentTabs) {
		return ;
	}
	
	var tabs = localStorage.currentTabs.split(',');
	var parts;
	for (var i in tabs) {
		parts = tabs[i].split('-');
		openNewTab(parseInt(parts[0]), parseInt(parts[1]));
	}
}

function showCcode(html) {
	/* Récupération de 'session' et de l'url de l'image du code. */
	var html_parts = strBetween(html, '* Confirmation : </label>', '" width');
	html_parts = html_parts.split('<img src="');
	var html_session = html_parts[0];
	alert(html_session);
	var img_src = html_parts[1].replace(/&amp;/g, '&');
	
	/* Ajout au formulaire. */
	textToFormData(_tab_current, html, true);
	geid('ccode').innerHTML = html_session;
	ce('img', {src: img_src, alt: 'Code de confirmation'}, 'ccode');
	ce('br', false, 'ccode');
	ce('input', {type: 'text', tabIndex: 2, id: 'confirmation', name: 'code', maxLength: 4}, 'ccode').focus();
	geid('form').className = 'confirm';
}

function getMyPseudo() {
	if (typeof this.tehlogin == 'undefined') {
		this.tehlogin = lire_cookie("tehlogin");
		/* On vérifie que |this.tehlogin| n'est pas null pour ne pas que filtre_pseudo() (base.js) râle. */
		if (this.tehlogin != null)
			this.tehlogin = filtre_pseudo(this.tehlogin);
	}
	return this.tehlogin;
}

function alertTab(tab_id) {
	/* Onglet. */
	geid('tab'+tab_id).setAttribute('alerted', '');
	geid('alerte'+tab_id).innerHTML = parseInt(geid('alerte'+tab_id).innerHTML) + 1;
	
	if (_tab[tab_id].blink_timer != 0) { // Un clignotement est déjà en cours.
		clearTimeout(_tab[tab_id].blink_timer);
		_tab[tab_id].blink_timer = 0;
	}
	_tab[tab_id].blink_timer = setTimeout('toggleTabBlinking('+tab_id+')', TAB_BLINKING_FREQUENCY / 2);
	
	adjustTabsPosition();
}

function unalertTab(tab_id) {
	if (geid('tab'+tab_id).hasAttribute('alerted')) {
		geid('tab'+tab_id).removeAttribute('alerted');
		geid('alerte'+tab_id).innerHTML = '0';
		clearTimeout(_tab[tab_id].blink_timer);
	}
}

function setTitleAlerts(no_timer) {
	// http://heyman.info/2010/oct/7/google-chrome-bug-when-setting-document-title/
	if (typeof no_timer == 'undefined') {
		if (navigator.userAgent.indexOf('Safari') != -1) {
			setTimeout('setTitleAlerts(true)', 50);
			return;
		}
	}
	if (window_visible) {
		document.title = TITLE;
		return;
	}
	var all_alerts = 0;
	for (var i = 1; i <= _tab_count; i++)
		if (geid('alerte'+i))
			all_alerts += parseInt(geid('alerte'+i).innerHTML);
	if (all_alerts != 0)
		document.title = '('+all_alerts+') '+TITLE;
	else
		document.title = TITLE;
}

function toggleTabBlinking(tab_id) {
	var has = geid('tab'+tab_id).hasAttribute('blink_on');
	if (has) {
		geid('tab'+tab_id).removeAttribute('blink_on');
		_tab[tab_id].blink_iterations++;
	}
	else {
		geid('tab'+tab_id).setAttribute('blink_on', '');
	}
	if (_tab[tab_id].blink_iterations < TAB_BLINKING_MAX_ITERATIONS) {
		_tab[tab_id].blink_timer = setTimeout('toggleTabBlinking('+tab_id+')', TAB_BLINKING_FREQUENCY / 2);
	}
	else {
		_tab[tab_id].blink_timer = 0;
		_tab[tab_id].blink_iterations = 0;
	}
}

function adjustTabsPosition() {
	geid('fake_tabs').style.height = (geid('tabs').offsetHeight - 10) + 'px';
	_tab[_tab_current].yoffset = pageYOffset;
}

startTheEngine();






























