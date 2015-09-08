/*******
CORE.JS
© xzl 
****/

/////////////////
// CORE->VARS //
///////////////

	var core = {
		state: 0,

		timeout: [],

		scroller: {
			enabled: false,
			speed: 0,
			side: "+",
		},

		lettrnd: {
			rand: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890&(-_)=/*+ ",
			stat: [],
		},

		action: {
			undo: 'wMask.undo',
			redo: 'wMask.redo',
			//api: 'wMask.api',
			clear: 'wMask.clear',
		}
	}

////////////////
// PROTOTYPE //
//////////////

	String.prototype.capitalize = function() {
	    return this.charAt(0).toUpperCase() + this.slice(1);
	}

//////////////////
// CORE->F.LIB //
////////////////

	function inT() {
		/* 	
		 * Initialise wMask
		 *
		 * @empty
		*/
		wMask.init();
		core.dragndrop = new dragndrop();

		core.loading = setInterval(function() {
			if (core.state == 1) {
				rsZ(true);
				$('#wMask').fadeIn(200);
				clearInterval(core.loading);
			}
		},50);
	}

	function unD() {
		/* 	
		 * Retourne la premiere variable valide passée en parametre
		 *
		 * @{params}		Multi		?		Les variables
		*/
		var args = arguments;
		for(var i=0; i<args.length; i++){
			if (args[i] !== false && typeof args[i] !== 'undefined' && args[i] !== null && args[i] !== '') {
				return args[i];
			}
		}
		return false;
	}

	function grI(n) {
		/* 	
		 * Retourne le même nombre, multiple de 8, arrondi à l'inferieur
		 *
		 * @param		Int		nb		Nombre non multiple de 8
		*/
		var n = unD(n,0);
		return Math.floor(n/wMask.cell)*wMask.cell;
	}

	function chK(x,y,w,h) {
		/* 	
		 * Vérifie que les décalages x, y et que la largeur, hauteur sont des nombres
		 * Vérifie aussi que la largeur et la hauteur soient supérieures à 0
		 *
		 * @param		Int		x		Décalage abscisse
		 * @param		Int		y		Décalage ordonnée
		 * @param		Int		w		Largeur
		 * @param		Int		h		Hauteur
		*/
		if (!isNaN(x+y+w+h)) {
			if (w > 0 && h > 0) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	function rnD(l,c) {
		/* 	
		 * Gere une chaine de caractères aléatoires
		 *
		 * @param		Int		l		Taille de la chaine
		 * @param		String	c		Caractères admis (optionnel)
		*/
		if (!c) { c = '0123456789abcdefghijklmnopqrstuvwxyz'; }
	    var r = '';
	    for (var i = l; i > 0; --i) r += c[Math.round(Math.random() * (c.length - 1))];
	    return r;
	}

	function shF(o) {
		/* 	
		 * Mélange un tableau
		 *
		 * @param		Array	o		Tableau original
		*/
	    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	    return o;
	}

	function agO(t) {
		/* 	
		 * Gère la convertion d'un timestamp en un format lisible pour l'homme
		 * Ex: 1383431541 => 10 minutes ago
		 *
		 * @param		Int		t		Timestamp
		*/
		var p = ["second", "minute", "hour", "day", "week", "month", "year", "decade"],
			l = ["60","60","24","7","4.35","12","10"],
			n = new Date().getTime(),
			d = (n / 1000) - (t / 1000);

		for(j=0; d >= l[j] && j < l.length-1; j++) { d /= l[j]; }
		d = Math.round(d);
		if(d != 1) { p[j] += "s"; }

		return d+" "+p[j]+" ago";
	}

	function gsT(n,b,c) {
		/* 	
		 * Genere un tableau semi aléatoire à index récursif
		 * Où tableau[x] = x;
		 *
		 * @param		Int		n		Taille du tableau
		 * @param		Array	b		Préfixe du tableau (optionnel)
		 * @param		Funct	c		Condition de trie (optionnel)
		*/
		var n = unD(n,'16'),
			b = unD(b,false),
			c = unD(c,function(a,b) { return core.algo[a] - core.algo[b]; }),
			t = [];

		if (b) { n = n-b.length; }

		for (var i=0; i<n; i++) { 
			t[i] = i+(b ? b.length : 0); 
		} 

		t.sort(c);

		if (b) {
			t = b.concat(t);
		}

		for (var i=(b ? b.length : 0); i<t.length; i++) { 
			var v = t.indexOf(i), 
				m = t[i]; 
			t[t.indexOf(v)] = m; 
			t[i] = v; 
		} 

		return t; 
	}

	function rsZ(i) {
		/* 	
		 * Redimentionne la workzone en fonction de la taille de la fenetre et de la hauteur du header
		 * Répete la fonction toute les 0.05 secondes si i
		 *
		 * @param		Boolean		i		Condition d'initiation d'intervale
		*/
		var bH = $('body').height(),
			hH = $('header').height(),
			cH = bH - hH;

		$('table#cntr').height(cH);

		if (i) { setInterval(rsZ,100); }
	}

	function gpA(src,obj,exep) {
		/* 	
		 * Geres l'attribus "params" du DOM
		 *
		 * @param		String	src		Chaine de parametres "key:value,key:value..."
		 * @param		Object	obj		Objet de parametres original (optionnel)
		 * @param		Array	exep	Tableau regroupant les exeptions (optionnel)
		*/
		var obj = unD(obj,{}),
			exep = unD(exep,[]);
		if (src.length) {
			var str = src.split(',');
			for (var i=0; i<str.length; i++) {
				param = str[i].split(':');
				if (exep.indexOf(param[0]) < 0) {
					obj[param[0]] = (param[1] === 'true' ? true : (param[1] === 'false' ? false : param[1]));
				}
			}
		}
		return obj;
	}

	function r2H(r,g,b){
		/* 	
		 * Convertie un tableau rgb [rouge, vert, bleu] en hsl [teinte, saturation, luminosité]
		 *
		 * #source	http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
		 *
		 * @param		Int		r		Rouge
		 * @param		Int		g		Vert
		 * @param		Int		b		Bleu
		*/
	    r /= 255, g /= 255, b /= 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;

	    if(max == min){
	        h = s = 0;
	    }else{
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }

	    return [h, s, l];
	}

	function h2R(h,s,l){
		/* 	
		 * Convertie un tableau hsl [teinte, saturation, luminosité] en rgb [rouge, vert, bleu]
		 *
		 * #source	http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
		 *
		 * @param		Int		h		Teinte
		 * @param		Int		s		Saturation
		 * @param		Int		l		Luminosité
		*/
	    var r, g, b;

	    if(s == 0){
	        r = g = b = l;
	    }else{
	        function hue2rgb(p, q, t){
	            if(t < 0) t += 1;
	            if(t > 1) t -= 1;
	            if(t < 1/6) return p + (q - p) * 6 * t;
	            if(t < 1/2) return q;
	            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	            return p;
	        }

	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1/3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1/3);
	    }
	    return [r * 255, g * 255, b * 255];
	}

////////////////
// CORE->DOM //
//////////////

	function srM() {
		/* 	
		 * Gere le scroller des masques en fonction des propriété de status, vitesse, coté
		 * Ces propriété sont fixé avant l'appel de la fonction depuis la fonction attaché à l'evenement mousemove de la sidebar
		 *
		 * @empty
		*/
		if (core.scroller.enabled == true && core.scroller.speed > 0) {
			if ((core.scroller.side == '+' && parseInt($('aside#masks ul').css('top')) < $('header').height()) || (core.scroller.side == '-' && parseInt($('aside#masks ul').css('top')) > ($('aside#masks ul').height() - $('body').height())*-1)) {
				var crntop = parseInt($('aside#masks ul').css('top'))*-1,
					maxtop = $('aside#masks ul').height() - $('body').height(),
					mintop = $('header').height()*-1,
					crndif = (1*((1-(core.scroller.speed/100))*100)/2),
					maxdif = (core.scroller.side == '+' ? crntop - mintop : maxtop - crntop),
					next = srM;

				if (maxdif < crndif) {
					core.scroller.enabled = false;
					core.scroller.forceoff = true;
					crndif = maxdif;
					next = function() { core.scroller.forceoff = false; }
				}

				$('aside#masks ul').animate({
					'top': core.scroller.side+'='+crndif,
				}, core.scroller.speed, "linear", next);
			} else {
				core.scroller.enabled = false;
			}
		} else {
			core.scroller.enabled = false;
		}
	}

	function sfT(id,x,y,w,h,lid) {
		/* 	
		 * Gere la fausse selection lors du hover sur des opérations précédement effectuées
		 * Redimensionne la séléction, et affiche le nom du masque selectionné par appel de la fonction swM
		 *
		 * @param		String	id		Id brut du masque
		 * @param		Int		x		Décalage abscisse
		 * @param		Int		y		Décalage ordonnée
		 * @param		Int		w		Largeur
		 * @param		Int		h		Hauteur
		 * @param		String	lid		Masque
		*/
		if (id == 'clear') {
			$('#workzone .trgt.fake').fadeOut(100,function() { wMask.trgt.fake = false; });
		} else {
			swM(lid,id,$('#workzone .trgt.fake .mask'));
			$('#workzone .trgt.fake').css({width:w,height:h,left:(x-1),top:(y-1)}).fadeIn(100, function() { wMask.trgt.fake = true; });
		}
	}

	function shY(hid,id,x,y,w,h,a) {
		/* 	
		 * Gere les ajouts d'elements dans la liste physique de l'historique
		 * Ainsi que les évènements qui s'y rattachent
		 *
		 * @param		String	hid		Id unique de l'opération
		 * @param		String	id		Id brut du masque
		 * @param		Int		x		Décalage abscisse
		 * @param		Int		y		Décalage ordonnée
		 * @param		Int		w		Largeur
		 * @param		Int		h		Hauteur
		 * @param		String	a		Spécificitée (vertical, horizontal, password etc...)
		*/
		var t = new Date().getTime(),
			v = {p:'+',m:'-'},
			s = ['flip','line','win','meko','tv','x','pttr'].indexOf(id) != -1,
			m = ['p','m'].indexOf(a) != -1,
			o = ['v','h'].indexOf(a) != -1,
			a = unD(a, null);

		var n = id.capitalize()+(s && a ? (m ? ' '+v[a] : ' ('+a.toUpperCase()+')') : ''),
			c = '<b><i title="X Offset">'+x+'</i>x<i title="Y Offset">'+y+'</i> <i title="Width">'+w+'</i>x<i title="Height">'+h+'</i></b>';

		var li = $('<li hid="'+hid+'" style="display:none;"></li>')
			.append($('<span class="coord">'+c+'</span>'))
			.append($('<span class="name">'+n+'</span>'))
			.append($('<span class="time" time="'+t+'">'+agO(t)+'</span>'))
			.click(function() {
				wMask.mask(id,x,y,w,h,a);
			})
			.mouseenter(function(e) {
				sfT(n,x,y,w,h,$('#workzone .trgt.fake .mask').html());
			});
		
		$('div[dial="history"] .container ul').append(li).mouseleave(function() {
			sfT('clear');
		});

		$('div[dial="history"] .container ul li:last').fadeIn(100);

		rhN('+');
	}

	function rhY(hid,all) {
		/* 	
		 * Gere les suppression d'éléments dans la liste physique de l'historique
		 *
		 * @param		String	hid		Id unique de l'opération
		 * @param		Boolean	all		Condition pour supprimer tout les éléments
		*/
		if (all) {
			$('div[dial="history"] .container  ul').html('');
		} else {
			if ($('div[dial="history"] .container  li[hid="'+hid+'"]').length) {
				rhN('-');
				$('div[dial="history"] .container  li[hid="'+hid+'"]').fadeOut(100,function() {
					$(this).remove();
				});
			}
		}
	}

	function rhN(n) {
		/* 	
		 * Gere les pastilles de l'historique
		 *
		 * @param		String	lvl		Plus (+) ou moins (-)
		 * @param		Boolean	all		Remove all
		*/
		var notice = $('span.historycount');

		!isNaN(n) ? wMask.history.count = n : (n == '+' ? wMask.history.count++ : wMask.history.count--);

		notice.html(wMask.history.count);
		if (!notice.is(":visible")) {
			notice.fadeIn('fast');
		} else if(wMask.history.count == 0) {
			notice.fadeOut('fast');
		}
	}

	function chB() {
		/* 	
		 * Gere les boutons dynamiques
		 *
		 * @empty
		*/
		core.state == 1 && wMask.history.undo.length ? $('[w=undo]').removeAttr('disabled') : $('[w=undo]').attr('disabled','disabled');
		core.state == 1 && wMask.history.redo.length ? $('[w=redo]').removeAttr('disabled') : $('[w=redo]').attr('disabled','disabled');
		core.state == 1 && wMask.history.count ? $('[w=api], [w=clear]').removeAttr('disabled') : $('[w=api], [w=clear]').attr('disabled','disabled');
	}

	function rwR(p,l) {
		/* 	
		 * Remplace la lettre d'une chaine de caractère (core.lettrnd.n ou core.lettrnd.o) en position p, par la lettre suivante selon core.lettrnd.rand
		 * La lettre de remplacement peut être précisée à la place de l'ordre établis par core.lettrnd.rand
		 *
		 * @param		Int		p		Index, position du curseur
		 * @param		String	l		Lettre, ou chaine de caractère (optionnel)
		*/
		var out = '';
		var tmp = (core.lettrnd.n.length > core.lettrnd.o.length) ? core.lettrnd.n : core.lettrnd.o;
		var rpl = (typeof l !== 'undefined') ? l : core.lettrnd.rand[(core.lettrnd.rand.indexOf(core.lettrnd.o[p])+1)%core.lettrnd.rand.length];
		for (var i=0; i<tmp.length; i++) {
			if (core.lettrnd.o.length >= (i+1)) {
				if (i == p) {
					out += rpl;
				} else {
					out += core.lettrnd.o[i];
				}
			} else {
				out += core.lettrnd.rand[Math.floor(Math.random() * ((core.lettrnd.n.length-1) - 0 + 1)) + 0];
			}
		}
		return out;
	}

	function rLL(p,e) {
		/* 	
		 * Gere le remplacement annimé d'une lettre par répétition
		 * Fonction répétée tant que la lettre n'est pas remplacée
		 *
		 * @param		Int		p		Index, position du curseur
		 * @param		Element	e		Element du DOM qui contiendra la nouvelle chaine
		*/
		if (core.lettrnd.stat[p] !== false) {
			var ctr = rwR(p),
				elm = unD(e,$('#workzone .trgt.fake .mask'));
			elm.html(ctr);
			core.lettrnd.o = ctr;
			if (core.lettrnd.o[p] != core.lettrnd.n[p] && core.lettrnd.n.length >= (p+1) && core.lettrnd.stat[p] === true) {
				if (core.lettrnd.n[p] == ' ') {
					core.lettrnd.stat[p] = Math.floor(Math.random() * ((20-1) - 0 + 1)) + 0;
				}
				setTimeout(function() {
					rLL(p,elm);
				}, 10);
			} else if (core.lettrnd.o[p] == core.lettrnd.n[p] && core.lettrnd.stat[p] == true) {
				core.lettrnd.stat[p] = false;
			} else if (core.lettrnd.n.length < (p+1) || !isNaN(core.lettrnd.stat[p])) {
				if (core.lettrnd.stat[p] === true) {
					core.lettrnd.stat[p] = 10;
				} 
				if (!isNaN(core.lettrnd.stat[p])) {
					if (core.lettrnd.stat[p] > 0) {
						setTimeout(function() {
							rLL(p,elm);
						}, 10);
						core.lettrnd.stat[p]--;
					} else if (core.lettrnd.stat[p] == 0) {
						core.lettrnd.o = rwR(p,' ');
					}
				}
			}
		}
	}

	function swM(o,n,e) {
		/* 	
		 * Gere le remplacement animé d'une chaine de caractère
		 *
		 * @param		String	o		Chaine originale
		 * @param		String	n		Nouvelle chaine
		 * @param		Element	e		Element du DOM qui contiendra la nouvelle chaine
		*/
		core.lettrnd.o = o.trim();
		core.lettrnd.n = n;
		shF(core.lettrnd.rand);
		for (var i=0; i<core.lettrnd.o.length; i++) {
			core.lettrnd.stat[i] = true;
			rLL(i,e);
		}
	}

//////////////////
// CORE->EVENT //
////////////////

	$(document).ready(function() {

		$("#cntr, #context").bind("contextmenu",function(e){
		      return false;
		}); 

		// Initialize tooltips
			$('.tooltip.bottom').tooltipster({animation: 'fall', delay: 0});
			$('.tooltip.right').tooltipster({animation: 'fall', delay: 0, position: 'right'});

		// Initialize mask scroller
			$('aside#masks').mousemove(function(e) {
				var at = lt = ($('body').height() - $('header').height())*0.45,
					x = e.pageX - this.offsetLeft,
					y = e.pageY - this.offsetTop-$('header').height(),
					ah = $('body').height() - $('header').height(),
					ab = ah - at,
					lb = false;

				if (y < at) {
					lb = true;
					var cf = y / at;
					core.scroller.speed = cf*100;
					core.scroller.side = '+';
				}

				if (y > ab) {
					lb = true;
					var cf = (ah - y) / at;
					core.scroller.speed = cf*100;
					core.scroller.side = '-';
				}

				if (!lb) {
					core.scroller.enabled = false;
				} else if (!core.scroller.enabled && !core.scroller.forceoff) {
					core.scroller.enabled = true;
					srM();
				}
			});

			$('aside#masks li tooltip').mousemove(function(e) {
				e.stopPropagation();
				return false;
			});

			$('aside#masks').mouseleave(function(e) {
		    	e.stopPropagation();
				core.scroller.enabled = false;
			});

		// Initialize mask tooltip
			$('aside#masks li').mouseenter(function(e) {
				$(this).children('tooltip').css('display','block').animate({
					left:'74',
					opacity: 1
				}, 100);
			}).mouseleave(function(e) {
				$(this).children('tooltip').animate({
					left:'0',
					opacity: 0
				}, 100, function() {
					$(this).hide();
				});
			});

		// Initialize slimscrolls
			$('div[slimscroll]').each(function(){
				$(this).slimScroll(gpA($(this).attr('params')));
			});

		// Initialize dialogs
			$('div[dial]').each(function(){
				var params = {
					open: function(event, ui) {
						if ($('header .menu li#li-'+$(this).attr('dial')).length) {
							$('header .menu li#li-'+$(this).attr('dial')).addClass('active');
						}
					},
					close: function(event, ui) {
						if ($('header .menu li#li-'+$(this).attr('dial')).length) {
							$('header .menu li#li-'+$(this).attr('dial')).removeClass('active');
						}
					}
				};
				$(this).dialog(gpA($(this).attr('params'),params,['open','close']));
			});

		// Initialize dialogs links
			$('[todial]').each(function(){ 
				if ($(this).attr('todial').length && $('div[dial="'+$(this).attr('todial')+'"]').hasClass('ui-dialog-content')) {
					$(this).click(function() {
						$('div[dial="'+$(this).attr('todial')+'"]').dialog( "isOpen" ) ? $('div[dial="'+$(this).attr('todial')+'"]').dialog('close') : $('div[dial="'+$(this).attr('todial')+'"]').dialog('open');
					});
				}
			});

		// Startup
			inT();

	});


