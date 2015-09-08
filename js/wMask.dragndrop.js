/************
DRAGNDROP.JS
© xzl
*********/

function dragndrop(trg, ovr, cnt) {
	var that = this; // Reference (jquery issues)

	//////////////////////
	// DRAGNDROP->VARS //
	////////////////////

	that.trg = unD(trg, 'body');
	that.ovr = unD(ovr, '#dragndrop');
	that.cnt = unD(cnt, '.container');

	///////////////////////////
	// DRAGNDROP->FUNCTIONS //
	/////////////////////////

	that.enter = function() {
		$(that.ovr).fadeIn(200, function() { that.action = false; }); 
	}
	that.leave = function() {
		$(that.ovr).fadeOut(200, function() { that.action = false; }); 
		$(that.ovr+' '+that.cnt).removeClass('active'); 
	}
	that.drop = function(f,url) {
		if (url) {
			wMask.load(f);
		} else {
			var f = f[0],
				r = new FileReader();
			if (!f.type.match('image.*')) { that.leave(); return false; }  

			r.onload = function(f) { wMask.load(f.target.result); }
			r.readAsDataURL(f);
		}
	}

	///////////////////////
	// DRAGNDROP->EVENT //
	/////////////////////

	$(that.trg).on('dragenter', function(e) {
		if (!that.action) {
			that.action = true;
			that.enter();
		}
		return false;
	}).on('dragover', function(e) {
		return false;
	}).on('drop', function(e) {
		that.leave();
		return false;
	});

	$(that.ovr).on('dragleave', function(e) {
		if (!that.action) {
			that.action = true;
			that.leave();
		}
		return false;
	});

	$(that.ovr+' '+that.cnt).on('dragenter', function(e) {
		that.action = true;
		$(that.ovr+' '+that.cnt).addClass('active');
		return false;
	}).on('dragleave', function(e) {
		that.action = false;
		$(that.ovr+' '+that.cnt).removeClass('active');
		return false;
	});

	$(that.ovr+' '+that.cnt).on('drop', function(e) {
		if(e.originalEvent.dataTransfer){
			console.log('data transfer !');
			if(e.originalEvent.dataTransfer.files.length) {
				e.preventDefault();
				e.stopPropagation();
				that.drop(e.originalEvent.dataTransfer.files);
			} else if (e.originalEvent.dataTransfer.items.length) {
				e.originalEvent.dataTransfer.items[0].getAsString(function(url) { 
					$("<img>", {
						src: url,
						error: function() { 
							console.log('image invalide');
							that.leave();
						},
						load: function() {
							console.log('image valide');
							that.drop(url,true);
						}
					});
				});
			} else {
				that.leave();
			}
		} else {
			that.leave();
		}
		return false;
	});

}