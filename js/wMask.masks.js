/********
WMASK.JS
© xzl 
*****/

//////////////////
// WMASK->VARS //
////////////////

	var wMask = {
		dflt: "sample.jpg",
		cell: 8,
		coef: 1,

		drag: {
			dragging: false,
			draggable: false
		},

		trgt: {
			drawing: false,
			drawn: false,
			x: null,
			y: null,
			w: null,
			h: null
		},

		history: {
			undo: [],
			redo: [],
			count: 0
		}
	};

///////////////////
// WMASK->F.LIB //
/////////////////

	wMask.init = function() {
		wMask.canvas = document.getElementById("paper");
		wMask.temp = {canvas: document.getElementById("temp")};

		wMask.ctx = wMask.canvas.getContext("2d"); 
		wMask.temp.ctx = wMask.temp.canvas.getContext("2d");  

		wMask.trgt.init();
		wMask.drag.init();
		wMask.event.ui(1000);
		wMask.load("img/"+wMask.dflt);
	}

	wMask.load = function(d) {
		if (!d) {
			$('#workzone').fadeOut('500', function() {
				wMask.clear(true);
				core.state = 0;
			});
			return false;
		}

		wMask.image = new Image();  
		wMask.image.src = d;  

		var tid = core.timeout.length;
		core.timeout[tid] = setTimeout(function() { 
			alert('Error : Timeout reached'); 
			core.dragndrop.leave(); 
			core.state = 1; 
		}, 10000);
		core.state = 3;

		$(wMask.image).load(function() {
			clearTimeout(core.timeout[tid]);

			wMask.size(wMask.image.width, wMask.image.height, null, true);
			wMask.ctx.drawImage(wMask.image, 0, 0); 

			core.dragndrop.leave();
			core.state = 1;
		});
	}

	wMask.clear = function(all) {
		if (!all) {
			wMask.ctx.drawImage(wMask.image, 0, 0); 
		} else {
			wMask.ctx.clearRect(0, 0, wMask.image.width, wMask.image.height);
			wMask.temp.ctx.clearRect(0, 0, wMask.image.width, wMask.image.height);
		}

		rhY(null, true); // DOM <li>
		rhN(0); // History counter
		wMask.history.redo = wMask.history.undo = [];
		chB();
	}

	wMask.zoom = function(c) {
		if (!c) { return false; } else if (c > 3 && c < 0) { return false; }

		$('#safezone').css({'zoom':c,'-ms-transform':'scale('+c+')','-o-transform':'scale('+c+')','-moz-transform':'scale('+c+')'});
		$('#workzone').css({width: (wMask.image.width*c), height: (wMask.image.height*c)});
		wMask.coef = c;
	}

	wMask.undo = function() {
		var i = wMask.history.undo.length-1,
			d = unD(wMask.history.undo[i],null);

		if (d) {
			if (d.id == 'meko' || d.id == 'tv') { 
				d.p = d.p == 'm' ? 'p' : 'm';
			}
			if (d.id == 'rgb') { d.p = 'revert'; }
			wMask.mask(d.id,d.x,d.y,d.w,d.h,d.p,'undo');

			wMask.history.redo.push(d);
			rhY(d.hid);
			wMask.history.undo.splice(i,1);
		}
		chB();
	}

	wMask.redo = function() {
		var i = wMask.history.redo.length-1;
			d = unD(wMask.history.redo[i],null);

		if (d) {
			if (d.id == 'meko' || d.id == 'tv') { 
				d.p = d.p == 'm' ? 'p' : 'm';
			}
			//if (d.id == 'rgb') { d.p = 'revert'; }
			wMask.mask(d.id,d.x,d.y,d.w,d.h,d.p,'redo');
			
			wMask.history.undo.push(d);
			shY(d.hid,d.id,d.x,d.y,d.w,d.h,d.p);
			wMask.history.redo.splice(i,1);
		}
		chB();
	}

	wMask.size = function(w,h,c,p) {
		var w = unD(w,null),
			h = unD(h,null),
			c = unD(c,wMask.canvas,null),
			p = unD(p,null);
			
		if (c != null) {
			$(c).width(w).height(h);
			c.height = h;
			c.width = w;
		}

		if (p != false) {
			$('#workzone, #safezone').width(w).height(h);
		}
	}

	wMask.export = function(x,y,w,h,t) {
		var t = unD(t,'jpg'),
			m = (t == 'jpg' ? 'jpeg' : t);

		wMask.size(w,h,wMask.temp.canvas);
		wMask.temp.ctx.drawImage(wMask.canvas, x, y, w, h, 0, 0, w, h);

		var dataURL = wMask.temp.canvas.toDataURL("image/"+m),
			$form = $('<form></form>', {method: "POST", action: "src/export.php"});

			$form.append('<input type="hidden" name="dataURL" value="'+dataURL.substr(dataURL.indexOf(',') + 1).toString()+'">');
			$form.append('<input type="hidden" name="mimeURL" value="'+m+'">');
			$form.append('<input type="hidden" name="fileURL" value="export">');

		$form.submit();
	}

	wMask.mask = function (id,x,y,w,h,p,a) {
		if (wMask.mask[id] && core.state == 1) {

			var x = parseInt(unD(x,wMask.trgt.x,0)),
				y = parseInt(unD(y,wMask.trgt.y,0)),
				w = parseInt(unD(w,wMask.trgt.w,wMask.image.width)),
				h = parseInt(unD(h,wMask.trgt.h,wMask.image.height)),
				p = unD(p, null),
				a = unD(a, null);

			var parm = [x,y,w,h],
				args = arguments;

			if (!chK(x,y,w,h)) { return false; } else { core.state = 2 }

			console.log('wMask.mask',arguments);

			for (var i=5; i<args.length; i++) {
				if (args[i]) { parm.push(args[i]) }
			}

			wMask.mask[id](x,y,w,h,p,a);

			if (!a) {
				wMask.history.redo = [];
				var hid = rnD(10);
				wMask.history.undo.push({id:id,x:x,y:y,w:w,h:h,p:p,hid:hid});
				shY(hid,id,x,y,w,h,p);
			}
			
			core.state = 1;
			chB();

		} else {
			return false;
		}
	}

///////////////////
// WMASK->MASKS //
/////////////////

	// NEG : Invertion des valeurs RGB (255-VAL)
	// RGB : Rotation des couleurs sur le cercle chromatique (1/3 HUE)
	// FLIP(v/h) : Effet miroir vertical ou horizontales
	// LINE(v/h) : Effet miroir divisé verticalement ou horizontalement
	// Q0 : Combo prédéfini : LINE(v+h) + NEG
	// WIN(v/h) : Mouvement des lignes verticales ou horizontales basées sur le trie algorithmique MEKO
	// W0 : Combo : WIN(v+h) + NEG
	// MEKO(+/-) : Mouvement incrémentable des cellules basées sur le trie algorithmique MEKO
	// FL : Mouvement des cellules en spirale
	// PW : Mouvement des cellules basées basée sur une entrée alpha-numérique

	wMask.mask.neg = function(x,y,w,h) {
		var img = wMask.ctx.getImageData(x, y, w, h),
			pixl = img.data,
	    	nump = img.width * img.height;

		for (var i = 0; i < nump; i++) {  
		    pixl[i*4] = 255-pixl[i*4];
		    pixl[i*4+1] = 255-pixl[i*4+1];
		    pixl[i*4+2] = 255-pixl[i*4+2];
		};  
		
		wMask.ctx.putImageData(img, x, y);  
	}

	wMask.mask.rgb = function(x,y,w,h) {
		var coef = (arguments.length == 6) ? (arguments[5] == 'undo' ? ((1/3)*2) : (1/3)) : (1/3);

		var img = wMask.ctx.getImageData(x, y, w, h),
			pixl = img.data,
	    	nump = img.width * img.height,
	    	hue = 0,
	    	hsl = [],
	    	rgb = [];

	    for (var i = 0; i < nump; i++) {  
	    	hsl = r2H(pixl[i*4], pixl[i*4+1], pixl[i*4+2]);
	    	var bak = hsl[0];
	    	hue = hsl[0]+coef;
	    	hsl[0] = hue > 1 ? hue-1 : hue;
	    	rgb = h2R(hsl[0], hsl[1], hsl[2]);
			pixl[i*4] = rgb[0];
			pixl[i*4+1] = rgb[1];
			pixl[i*4+2] = rgb[2];
	    }

	    wMask.ctx.putImageData(img, x, y);
	}

	wMask.mask.flip = function(x,y,w,h,t) {
		var t = unD(t,'h'),
			tw = (t == 'h') ? -1 : 1,
			th = (t == 'v') ? -1 : 1;

		wMask.size(w,h,wMask.temp.canvas);
		wMask.temp.ctx.scale(tw,th);
		wMask.temp.ctx.drawImage(wMask.canvas, x, y, w, h, 0, 0, w*tw, h*th);

	    wMask.ctx.drawImage(wMask.temp.canvas, 0, 0, w, h, x, y, w, h);

		return true;
	}

	wMask.mask.line = function(x,y,w,h,t) {
		var t = unD(t,'h'),
			tw = (t == 'h') ? w : wMask.cell,
			th = (t == 'v') ? h : wMask.cell,
			sw = (t == 'h') ? 1 : -1,
			sh = (t == 'v') ? 1 : -1;

		wMask.size(tw,th,wMask.temp.canvas);
		wMask.temp.ctx.scale(sw,sh);

		var lng = (t == 'h' ? h : w);
		var occ = Math.round(lng/wMask.cell);
		for (var i=0; i<occ; i++) {
			if (lng-(i*wMask.cell) < wMask.cell) {
				var _tw = (t == 'h') ? w : lng-(i*wMask.cell),
					_th = (t == 'v') ? h : lng-(i*wMask.cell);
				wMask.temp.ctx.drawImage(wMask.canvas, (sw == -1 ? x+(i*wMask.cell) : x), (sh == -1 ? y+(i*wMask.cell) : y), _tw, _th, 0, 0, _tw*sw, _th*sh);
			    wMask.ctx.drawImage(wMask.temp.canvas, 0, 0, _tw, _th, (sw == -1 ? x+(i*wMask.cell) : x), (sh == -1 ? y+(i*wMask.cell) : y), _tw, _th);
			} else {
				wMask.temp.ctx.drawImage(wMask.canvas, (sw == -1 ? x+(i*wMask.cell) : x), (sh == -1 ? y+(i*wMask.cell) : y), tw, th, 0, 0, tw*sw, th*sh);
			    wMask.ctx.drawImage(wMask.temp.canvas, 0, 0, tw, th, (sw == -1 ? x+(i*wMask.cell) : x), (sh == -1 ? y+(i*wMask.cell) : y), tw, th);
			}
		}
	}

	wMask.mask.win = function(x,y,w,h,t) {
		var t = unD(t,'h');

		var ce = wMask.cell >= 16 ? wMask.cell : wMask.cell*2,
			qs = gsT((ce > 16 ? ce : 0), [12,8,6,15,9,13,2,11,1,4,14,7,0,5,10,3]);
			tm = [];

		core.qs = qs;

		wMask.size(w,h,wMask.temp.canvas);
		wMask.temp.ctx.drawImage(wMask.canvas, x, y, w, h, 0, 0, w, h);

		var occ = Math.floor((t == 'h' ? h : w)/ce);
	    for (var r=0; r<occ; r++) {
	        for (i=0; i<ce; i++) {
		    	if (t == 'h') {
		    		wMask.ctx.drawImage(wMask.temp.canvas, 0, (r*ce+i), w, 1, x, (y+(r*ce+qs[i])), w, 1);
		    	} else {
		    		wMask.ctx.drawImage(wMask.temp.canvas, (r*ce+i), 0, 1, h, x+(r*ce+qs[i]), y, 1, h);
		    	}
	        }
	    }
	}

	wMask.mask.tv = function(x,y,w,h,t) {
		var t = unD(t,'p'),
			tv = wMask.mask.tv,
			oc = (w > h ? Math.floor(w/wMask.cell) : Math.floor(h/wMask.cell));

		console.log('T:',t);
		tv._x = x;
		tv._y = y;
		tv._w = w;
		tv._h = h;
		tv._t = t;
		tv._i = 0;

		for (var i=0; i<oc; i++) {
			setTimeout(function() { 
				var tv = wMask.mask.tv;
				if (tv._t == 'p') {
					if ((tv._h-wMask.cell*tv._i) >= wMask.cell)  { 
						wMask.mask.win(tv._x,(tv._y+wMask.cell*tv._i),tv._w,(tv._h-wMask.cell*tv._i),'h');
					}
					if ((tv._w-wMask.cell*tv._i) >= wMask.cell)  { 
						wMask.mask.win((tv._x+wMask.cell*tv._i),tv._y,(tv._w-wMask.cell*tv._i),tv._h,'v');
					}
				} else {
					if ((wMask.cell+wMask.cell*tv._i) <= tv._h)  { 
						wMask.mask.win(tv._x,(grI(tv._h+tv._y)-(wMask.cell+wMask.cell*tv._i)),tv._w,(wMask.cell+wMask.cell*tv._i),'h');
					}
					if ((wMask.cell+wMask.cell*tv._i) <= tv._w)  { 
						wMask.mask.win((grI(tv._w+tv._x)-(wMask.cell+wMask.cell*tv._i)),tv._y,(wMask.cell+wMask.cell*tv._i),tv._h,'v');
					}
				}
				tv._i++;
			}, (10*i));
		}
	}

	wMask.mask.w0 = function(x,y,w,h,n) {
		console.log('W0',x,y,w,h);
		var ce = wMask.cell >= 16 ? wMask.cell : wMask.cell*2,
			qs = gsT((ce > 16 ? ce : 0), [12,8,6,15,9,13,2,11,1,4,14,7,0,5,10,3]);
			tm = [];

		core.qs = qs;

		wMask.size(w,h,wMask.temp.canvas);
		wMask.temp.ctx.drawImage(wMask.canvas, x, y, w, h, 0, 0, w, h);

	    for (var r=0; r<Math.floor(h/ce); r++) {
	        for (i=0; i<ce; i++) {
		    	wMask.ctx.drawImage(wMask.temp.canvas, 0, (r*ce+i), w, 1, x, (y+(r*ce+qs[i])), w, 1);
	        }
	    }

		wMask.temp.ctx.drawImage(wMask.canvas, x, y, w, h, 0, 0, w, h);

	    for (var r=0; r<Math.floor(w/ce); r++) {
	        for (i=0; i<ce; i++) {
		    	wMask.ctx.drawImage(wMask.temp.canvas, (r*ce+i), 0, 1, h, x+(r*ce+qs[i]), y, 1, h);
	        }
	    }

	    if (n !== true) {
	    	wMask.mask.neg(x,y,w,h);
	    }
	}

	wMask.mask.q0 = function(x,y,w,h) {
		var lng = h, tw = w, th = wMask.cell, sw = 1, sh = -1;
		wMask.size(tw,th,wMask.temp.canvas);
		wMask.temp.ctx.scale(sw,sh);

		var occ = Math.round(lng/wMask.cell);
		for (var i=0; i<occ; i++) {
			if (lng-(i*wMask.cell) < wMask.cell) {
				var _tw = w,
					_th = lng-(i*wMask.cell);
				wMask.temp.ctx.drawImage(wMask.canvas, x, (y+(i*wMask.cell)), _tw, _th, 0, 0, _tw*sw, _th*sh);
			    wMask.ctx.drawImage(wMask.temp.canvas, 0, 0, _tw, _th, x, (y+(i*wMask.cell)), _tw, _th);
			} else {
				wMask.temp.ctx.drawImage(wMask.canvas, x, (y+(i*wMask.cell)), tw, th, 0, 0, tw*sw, th*sh);
			    wMask.ctx.drawImage(wMask.temp.canvas, 0, 0, tw, th, x, (y+(i*wMask.cell)), tw, th);
			}
		}

		var lng = w, tw = wMask.cell, th = h, sw = -1, sh = 1;
		wMask.size(tw,th,wMask.temp.canvas);
		wMask.temp.ctx.scale(sw,sh);

		var occ = Math.round(lng/wMask.cell);
		for (var i=0; i<occ; i++) {
			if (lng-(i*wMask.cell) < wMask.cell) {
				var _tw = lng-(i*wMask.cell),
					_th = h;
				wMask.temp.ctx.drawImage(wMask.canvas, (x+(i*wMask.cell)), y, _tw, _th, 0, 0, _tw*sw, _th*sh);
			    wMask.ctx.drawImage(wMask.temp.canvas, 0, 0, _tw, _th, (x+(i*wMask.cell)), y, _tw, _th);
			} else {
				wMask.temp.ctx.drawImage(wMask.canvas, (x+(i*wMask.cell)), y, tw, th, 0, 0, tw*sw, th*sh);
			    wMask.ctx.drawImage(wMask.temp.canvas, 0, 0, tw, th, (x+(i*wMask.cell)), y, tw, th);
			}
		}

	    wMask.mask.neg(x,y,w,h);
	}

	wMask.mask.meko = function(x,y,w,h,t) {
		var meko = wMask.mask.meko;

		var t = unD(t,'p');
			meko.width = Math.floor(w/(wMask.cell*2));
			meko.height = Math.floor(h/(wMask.cell*2));
			meko.table = [];

		meko.init(x,y,w,h);
		meko.process(x,y,w,h,t);
	    wMask.mask.neg(x,y,Math.floor(w/(wMask.cell*2))*(wMask.cell*2),Math.floor(h/(wMask.cell*2))*(wMask.cell*2));
	}

	wMask.mask.meko.init = function(x,y,w,h) {
		var meko = wMask.mask.meko;

		wMask.size(w,h, wMask.temp.canvas);
		wMask.temp.ctx.drawImage(wMask.canvas, x, y, w, h, 0, 0, w, h);

	    for (var i=0; i<meko.width*meko.height; i++) {
	    	meko.table[i] = {n: i, r: core.algo[i]}
	    }
	    meko.table.sort(function(a,b) { return (a.r - b.r); }); 
	}

	wMask.mask.meko.process = function(x,y,w,h,t) {
		var meko = wMask.mask.meko;

		var i=0, srcX, srcY, dstX, dstY;
	    for (var iy=0; iy<meko.height; iy++) { 
	        for (var ix=0; ix<meko.width; ix++) {

				srcX = (wMask.cell*2) * (t == 'p' ? (meko.table[i].n % meko.width) : ix);
				srcY = (wMask.cell*2) * (t == 'p' ? Math.floor(meko.table[i].n / meko.width) : iy);
				dstX = (wMask.cell*2) * (t == 'm' ? (meko.table[i].n % meko.width) : ix);
				dstY = (wMask.cell*2) * (t == 'm' ? Math.floor(meko.table[i].n / meko.width) : iy);

				wMask.ctx.drawImage(wMask.temp.canvas, srcX, srcY, (wMask.cell*2), (wMask.cell*2), x+dstX, y+dstY, (wMask.cell*2), (wMask.cell*2));
				i++;
			}
		}
	}

	wMask.mask.fl = function(x,y,w,h) {
		var fl = wMask.mask.fl;

		fl.width = Math.floor(w/(wMask.cell));
		fl.height = Math.floor(h/(wMask.cell));
		fl.table = [];

		fl.init(x,y,w,h);
		fl.process(x,y,w,h);
	    wMask.mask.neg(x,y,w,h);
	}

	wMask.mask.fl.init = function(x,y,w,h) {
		var fl = wMask.mask.fl;

		wMask.size(w,h, wMask.temp.canvas);
		wMask.temp.ctx.drawImage(wMask.canvas, x, y, w, h, 0, 0, w, h);

		fl.table = [];
		fl.tx = [];
		fl.ty = [];
		var dx = [1, 0, -1, 0],
			dy = [0, -1, 0, 1];

		for (var iy = 0; iy < fl.height; iy++){
			fl.table[iy] = [];
			for (var ix = 0; ix < fl.width; ix++) {
				fl.table[iy][ix] = [];
				fl.table[iy][ix]['no'] = -1;
			}
		}

		for (var ix = 0, d = 0, i = 0, iy = (fl.height-1); i < fl.width*fl.height; i++){
			fl.tx[i] = ix;
			fl.ty[i] = iy;
			fl.table[iy][ix]['no'] = i;
			fl.table[iy][ix]['pair'] = fl.width*fl.height-i-1;
			ix += dx[d];
			iy += dy[d];
			if (ix < 0 || fl.width <= ix || iy < 0 || fl.height <= iy || 0 <= fl.table[iy][ix]['no']) {
				ix -= dx[d];
				iy -= dy[d];
				d = (d + 1) % 4;
				ix += dx[d];
				iy += dy[d];
			}
		}
	}

	wMask.mask.fl.process = function(x,y,w,h) {
		var fl = wMask.mask.fl;

		var srcX, srcY, dstX, dstY;
	    for (var iy=0; iy<fl.height; iy++) { 
	        for (var ix=0; ix<fl.width; ix++) {

	        	var inv = fl.table[iy][ix]['no'] != fl.table[iy][ix]['pair'],
	        		u = fl.tx[fl.table[iy][ix]['pair']],
	        		v = fl.ty[fl.table[iy][ix]['pair']];

				srcX = wMask.cell * ix;
				srcY = wMask.cell * iy;
				dstX = wMask.cell * u;
				dstY = wMask.cell * v;

				wMask.ctx.drawImage(wMask.temp.canvas, srcX, srcY, wMask.cell, wMask.cell, x+dstX, y+dstY, wMask.cell, wMask.cell);
			}
		}
	}

	wMask.mask.x = function(x,y,w,h,c) {
		var _x = wMask.mask.x;

		_x.password = unD($('#cppasswrd').val(),c,null);

		if (!_x.password) {
			return false;
		}

		var regcp = /^([a-z]*)$/g,
			regpw = /^[a-zA-Z0-9ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðòóôõöùúûüýÿ&~"#'{([\-\|`_\\\^@)\]°=}\+/\*-¨¤\$£€%ùµ§!:;,\?<>\.²]*$/;

		if (regcp.test(_x.password) && _x.password.length <= 16) {
			wMask.mask.cp(x,y,w,h); // "GMASK" algo (Alpha minuscules uniquement [a-z])
		} else if (regpw.test(_x.password)) {
			wMask.mask.pw(x,y,w,h); // "WMASK" algo (Apha-numerique [a-Z0-9] + accents + caractères speciaux)
		} else {
			return false;
		}

		return true;
	}

	wMask.mask.cp = function(x,y,w,h) {
		var cp = wMask.mask.cp;

		cp.password = wMask.mask.x.password;
		cp.algo = [16, 23, 19, 21, 9, 8, 10, 20, 6, 5, 22, 2, 13, 3, 1, 4, 25, 12, 15, 14, 18, 7, 11, 24, 17, 26];
		cp.table = [];
		cp.width = Math.floor(w/wMask.cell);
		cp.height = Math.floor(h/wMask.cell);

		cp.init(x,y,w,h);
		cp.process(x,y,w,h);
	    wMask.mask.neg(x,y,w,h);
	}

	wMask.mask.cp.init = function(x,y,w,h) {
		var cp = wMask.mask.cp;

		wMask.size(w,h, wMask.temp.canvas);
		wMask.temp.ctx.drawImage(wMask.canvas, x, y, w, h, 0, 0, w, h);

		var s = cp.width*cp.height,
			t = [],
			f = {a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:7,i:8,j:9,k:10,l:11,m:12,n:13,o:14,p:15,q:16,r:17,s:18,t:19,u:20,v:21,w:22,x:23,y:24,z:25}
			vl1 = s-1,
			vl2 = cp.password.length + s % cp.password.length;

		for (var i=0; i<s; i++) {
		    t[i] = -1;
		    cp.table[i] = {pair: i, flag: false};
		}
		for (var i=0; i<s; i++) {
			vl1 = cp.algo[f[cp.password[(i % cp.password.length)]]] + vl1 + vl2;
			if (s <= vl1) { vl1 %= s; }
			while (t[vl1] != -1) {
				if (i & 01) {
					if (vl1 == 0) vl1 = s;
					vl1--; 
				} else {
					if (s <= ++vl1) { vl1 = 0; }
				}
			}
			t[vl1] = i;
			vl2++;
		}

		for(i = 0, j = s-1; i < j; i++, j--){
			cp.table[t[i]].pair = t[j];
			cp.table[t[j]].pair = t[i];
			if ((t[i] ^ t[j]) & 0x01){
				cp.table[t[i]].flag = true;
				cp.table[t[j]].flag = true;
			}
		}
	}

	wMask.mask.cp.process = function(x,y,w,h) {
		var cp = wMask.mask.cp;

		var srcX, srcY, dstX, dstY;
	    for (var iy=0; iy<cp.height; iy++) { 
	        for (var ix=0; ix<cp.width; ix++) {

	        	var src = iy * cp.width + ix,
	        		dst = cp.table[src].pair,
	        		v = Math.floor(dst/cp.width),
	        		u = dst%cp.width;
	        		eff = cp.table[src].flag;

				srcX = wMask.cell * u;
				srcY = wMask.cell * v;
				dstX = wMask.cell * ix;
				dstY = wMask.cell * iy;

				if (eff) {
					for (var yy=0; yy<wMask.cell; yy++) {						
						for (var xx=0; xx<wMask.cell; xx++){
							wMask.ctx.drawImage(wMask.temp.canvas, srcX+yy, srcY+xx, 1, 1, x+dstX+xx, y+dstY+yy, 1, 1);				
						}
					}
				} else {
					wMask.ctx.drawImage(wMask.temp.canvas, srcX, srcY, wMask.cell, wMask.cell, x+dstX, y+dstY, wMask.cell, wMask.cell);
				}

			}
		}

		var img = wMask.ctx.getImageData(x, y, w, h),
			pixl = img.data,
	    	rgb = {};
	    for (var i = 0; i < img.width*img.height; i++) {  
	    	rgb = {r:pixl[i*4],g:pixl[i*4+1]};
			pixl[i*4] = rgb.g;
			pixl[i*4+1] = rgb.r;
	    }
		wMask.ctx.putImageData(img, x, y);
	}

	wMask.mask.pw = function(x,y,w,h) {
		var pw = wMask.mask.pw;

		pw.password = wMask.mask.x.password;
		pw.temp = [];
		pw.table = [];
		pw.hash = 0;
		pw.charint = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRTSUVWXYZ0123456789ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðòóôõöùúûüýÿ&~\"#'{([-|`_^@)]°=}+*-¨¤$£€%ùµ§!:;,?<>.²";
		pw.width = Math.floor(w/wMask.cell);
		pw.height = Math.floor(h/wMask.cell);

		pw.init(x,y,w,h);
		pw.process(x,y,w,h);
	    wMask.mask.neg(x,y,w,h);
	}

	wMask.mask.pw.init = function(x,y,w,h) {
		var pw = wMask.mask.pw;

		wMask.size(w,h, wMask.temp.canvas);
		wMask.temp.ctx.drawImage(wMask.canvas, x, y, w, h, 0, 0, w, h);

	    for (var i=0; i<pw.password.length; i++) {
	    	pw.hash += pw.charint.indexOf(pw.password[i]);
	    }

	    for (var i=0; i<pw.width*pw.height; i++) {
	    	pw.temp[i] = {n: i, r: core.algo[pw.charint.indexOf(pw.password[i % pw.password.length])]+pw.charint.indexOf(pw.charint[pw.hash % pw.charint.length])};
	    	pw.hash+=i;
	    }

	    pw.temp.sort(function(a,b) { return (a.r - b.r); }); 

	    for (var i=0; i<pw.temp.length; i++) {
	    	pw.table[i] = pw.temp[i].n;
	    }

	    for (var i=0; i<pw.temp.length; i++) {
			var v = pw.table.indexOf(i), 
				m = pw.table[i]; 
			pw.table[pw.table.indexOf(v)] = m; 
			pw.table[i] = v; 
		}
	}

	wMask.mask.pw.process = function(x,y,w,h) {
		var pw = wMask.mask.pw;

		var i=0, srcX, srcY, dstX, dstY;
	    for (var iy=0; iy<pw.height; iy++) { 
	        for (var ix=0; ix<pw.width; ix++) {

				srcX = wMask.cell * (pw.table[i] % pw.width);
				srcY = wMask.cell * (Math.floor(pw.table[i] / pw.width));
				dstX = wMask.cell * ix;
				dstY = wMask.cell * iy;

				wMask.ctx.drawImage(wMask.temp.canvas, srcX, srcY, wMask.cell, wMask.cell, x+dstX, y+dstY, wMask.cell, wMask.cell);
				
				i++;
			}
		}
	}

	wMask.mask.pttr = function(x,y,w,h,c) {
		var pttr = wMask.mask.pttr;

		pttr.password = unD($('#pttrpasswrd').val(),c,'115');
		if (!pttr.password) { return false; } else { pttr.password = pttr.password.toLowerCase(); }
		console.log('password used',pttr.password);
		pttr.temp = [];
		pttr.table = [];
		pttr.hash = 0;
		pttr.charint = "abcdefghijklmnopqrstuvwxyz0123456789àéèêëïîöôùûü&-,.;:!*%( )_ç@+=°$<][|#~^/>";
		pttr.width = Math.floor(w/wMask.cell);
		pttr.height = Math.floor(h/wMask.cell);

		pttr.init(x,y,w,h);
		pttr.process(x,y,w,h);
	    wMask.mask.neg(x,y,w,h);
	}

	wMask.mask.pttr.init = function(x,y,w,h) {
		var pttr = wMask.mask.pttr;

		wMask.size(w,h, wMask.temp.canvas);
		wMask.temp.ctx.drawImage(wMask.canvas, x, y, w, h, 0, 0, w, h);

	    for (var i=0; i<pttr.width*pttr.height; i++) {
	    	pttr.temp[i] = {n: i, r: core.algo[pttr.charint.indexOf(pttr.password[i % pttr.password.length])]};
	    }

	    pttr.temp.sort(function(a,b) { return (a.r - b.r); }); 

	    for (var i=0; i<pttr.temp.length; i++) {
	    	pttr.table[i] = pttr.temp[i].n;
	    }

	    for (var i=0; i<pttr.temp.length; i++) {
			var v = pttr.table.indexOf(i), 
				m = pttr.table[i]; 
			pttr.table[pttr.table.indexOf(v)] = m; 
			pttr.table[i] = v; 
		}
	}

	wMask.mask.pttr.process = function(x,y,w,h) {
		var pttr = wMask.mask.pttr;

		var i=0, srcX, srcY, dstX, dstY;
	    for (var iy=0; iy<pttr.height; iy++) { 
	        for (var ix=0; ix<pttr.width; ix++) {

				srcX = wMask.cell * (pttr.table[i] % pttr.width);
				srcY = wMask.cell * (Math.floor(pttr.table[i] / pttr.width));
				dstX = wMask.cell * ix;
				dstY = wMask.cell * iy;

				wMask.ctx.drawImage(wMask.temp.canvas, srcX, srcY, wMask.cell, wMask.cell, x+dstX, y+dstY, wMask.cell, wMask.cell);
				
				i++;
			}
		}
	}

	wMask.mask.xor = function(x,y,w,h) {
		var img = wMask.ctx.getImageData(x, y, w, h),
			pixl = img.data,
	    	nump = img.width * img.height,
	    	rgb = [];

	    for (var i = 0; i < nump; i++) {
			pixl[i*4]^=32;
			pixl[i*4+1]^=64;
			pixl[i*4+2]^=128;
	    }

	    wMask.ctx.putImageData(img, x, y);

		return true;
	}

	wMask.mask.export = function(x,y,w,h,t) {
		wMask.export(x,y,w,h,t);

		return true;
	}

////////////////////
// WMASK->TARGET //
//////////////////

	wMask.trgt.init = function() {

		$("#cntr").mousedown(function(e) {
		    switch (e.which) {
		        case 1:
					if (!wMask.drag.draggable) {
						
						$('#context').fadeOut(100);

						// Clear target
						wMask.trgt.redraw(false);

						// Start drawing
						wMask.trgt.drawing = true;

						// Get true coordinate
						var x = ((e.pageX - $(this).offset().left)-($('#safezone').offset().left*wMask.coef))/wMask.coef;
						var y = (e.pageY -($('#safezone').offset().top*wMask.coef))/wMask.coef;

						// Grid it
						x1 = Math.floor(x/wMask.cell)*wMask.cell;
						y1 = Math.floor(y/wMask.cell)*wMask.cell;

					}
		            break;
		        case 2:
		            //alert('Middle mouse button pressed');
		            break;
		        case 3:
		            if (wMask.trgt.drawing) {

						// Stop drawing
					    wMask.trgt.drawing = false;

					}

					// Get true coordinate
					var x = (e.pageX - $(this).offset().left);
					var y = (e.pageY);

					$('#context').css({top:y,left:x}).fadeIn(100);
		            break;
		        default:
		            //alert('You have a strange mouse');
		    }
		});

		$('#cntr').mousemove(function(e) {
			if (!wMask.drag.draggable) {

				if (wMask.trgt.drawing) {

					// Get true coordinate
					var x = ((e.pageX - $(this).offset().left)-($('#safezone').offset().left*wMask.coef))/wMask.coef;
					var y = (e.pageY -($('#safezone').offset().top*wMask.coef))/wMask.coef;

					// Grid it
					x2 = Math.round(x/wMask.cell)*wMask.cell;
					y2 = Math.round(y/wMask.cell)*wMask.cell;

					// Set left-top width-height
					var x = (x1 < x2) ? x1 : x2, // css left
						y = (y1 < y2) ? y1 : y2, // css top
						w = (x1 < x2) ? x2 - x1 : x1 - x2, // css width
						h = (y1 < y2) ? y2 - y1 : y1 - y2; // css height

					// Draw temporary target
					wMask.trgt.redraw(true,x,y,w,h);

				}

			}
		});

		$('#cntr').mouseup(function(e) {
			if (!wMask.drag.draggable) {

				// Stop drawing
			    wMask.trgt.drawing = false;

			    if (wMask.trgt.drawn) {

			    	// Get target
			    	var x = wMask.trgt.x,
			    		y = wMask.trgt.y,
			    		w = wMask.trgt.w,
			    		h = wMask.trgt.h;

			    	// Redraw target (fit in wMask.image)
					w = (x < 0) ? w+x : w;
					h = (y < 0) ? h+y : h;
					w = (w > wMask.image.width) ? w-(w-wMask.image.width) : w;
					h = (h > wMask.image.height) ? h-(h-wMask.image.height) : h;
					w = (x+w > wMask.image.width) ? wMask.image.width-x : w;
					h = (y+h > wMask.image.height) ? wMask.image.height-y : h;
					x = (x < 0) ? 0 : x;
					y = (y < 0) ? 0 : y;
					if (w < 0 || h < 0) { 
						wMask.trgt.redraw(false);
					} else {
						wMask.trgt.redraw(true,x,y,w,h);
					}

			    }

			} else {

				// Stop drawing
			    wMask.trgt.drawing = false;

			}
		});
	}

	wMask.trgt.redraw = function(d,x,y,w,h) {
		if (!d) {
			$("#workzone .trgt.real").css({left: 0, top: 0, width: 0, height: 0, 'background-position': -0+'px '+-0+'px'});
			wMask.trgt.drawn = false;
			wMask.trgt.x = null;
			wMask.trgt.y = null;
			wMask.trgt.w = null;
			wMask.trgt.h = null;
		} else {


			$("#workzone .trgt.real").css({left: (x-1), top: (y-1), 'background-position': -x+'px '+-y+'px'});
			wMask.trgt.drawn = true;
			wMask.trgt.x = x;
			wMask.trgt.y = y;
			wMask.trgt.w = w; $("#workzone .trgt.real").css({width: w});
			wMask.trgt.h = h; $("#workzone .trgt.real").css({height: h});
		}
	}

/////////////////////////
// WMASK->KEY BINDING //
///////////////////////

	wMask.drag.init = function() {

		var cbMousewheel = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";

		$('#workzone').bind(cbMousewheel, function(e){
			if(e.originalEvent.wheelDelta /120 > 0) {
				wMask.zoom(wMask.coef/0.75);
			} else{
				wMask.zoom(wMask.coef*0.75);
			}
		});

		$(document).keyup(function(evt) {
			if (evt.keyCode == 32) { wMask.drag.draggable = false; }
			if (wMask.history.step && evt.keyCode == 17) { wMask.history.step = false; }
		}).keydown(function(evt) {
			if (evt.keyCode == 32) { wMask.drag.draggable = true; }
			if (wMask.history.step) {
				if (evt.keyCode == 90) { wMask.undo(); } 
				else if (evt.keyCode == 89) { wMask.redo(); }
			} else {
				if (evt.keyCode == 17) { wMask.history.step = true; } 
			}
		});

		$('#workzone').draggable({
			start: function(event, ui) {
				if (!wMask.drag.draggable) { 
					return false;
				}
			}
		});

	}

///////////////////
// WMASK->EVENT //
/////////////////

	wMask.event = {
		ui: function(n) {
			var n = unD(n,1000);

			setInterval(function(){

				$("[m]").each(function() {
					if (typeof $._data($(this)[0], "events") === 'undefined' || (typeof $._data($(this)[0], "events") !== 'undefined' && typeof $._data($(this)[0], "events").click === 'undefined')) {
						$(this).click(function() {
							var args = $(this).attr('m').split('-'),
								base = args[0].split(',');
							if (base.length > 0) {
								if (base.length < 5) {
									for (var i=1; i<5; i++) {
										if (!base[i]) {
											base[i] = null;
										}
									}
								}
								if (args.length == 2) {
									var parm = args[1].split(',');
								}
								args = (base && parm) ? base.concat(parm) : base;
								wMask.mask.apply(this, args);
							}
						});
					}
				});

				$("[w]").each(function() {
					if (typeof $._data($(this)[0], "events") === 'undefined' || (typeof $._data($(this)[0], "events") !== 'undefined' && typeof $._data($(this)[0], "events").click === 'undefined')) {
						$(this).click(function() {
							var arg = $(this).attr('w');
							if (eval(core.action[arg]) && !$(this).attr('disabled')) {
								eval(core.action[arg])();
							}
						});
					}
				});

				$('div[dial="history"] li[hid] span.time').each(function() {
					$(this).html(agO($(this).attr('time')));
				});

				$('span.historycount').html(wMask.history.count);

			}, n);
		},
		debug: function() {
		}
	}