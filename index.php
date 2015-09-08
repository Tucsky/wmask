<html>
<head>
	<title>Wmask</title>
	<meta charset="UTF-8">
	<meta name="description" content="Default description" />
	<meta name="keyword" content="Default keyword" />
	<meta name="robot" content="noindex, nofollow" />
	<link type="text/css" href="css/sandbox/jQueryUI.css" rel="stylesheet" />
	<link type="text/css" href="css/style.css" rel="stylesheet" />
	<script type="text/javascript" src="js/jQuery.js"></script>
	<script type="text/javascript" src="js/jQueryUI.js"></script>
	<script type="text/javascript" src="js/lib/tooltipster/tooltipster.min.js"></script>
	<script type="text/javascript" src="js/lib/filereader.min.js"></script>
	<script type="text/javascript" src="js/lib/slimscroll.js"></script>
	<script type="text/javascript" src="js/wMask.core.js"></script>
	<script type="text/javascript" src="js/wMask.masks.js"></script>
	<script type="text/javascript" src="js/wMask.algo.js"></script>
	<script type="text/javascript" src="js/wMask.dragndrop.js"></script>
</head>
<body>
<div id="wMask">

	<!-- DRAGNDROP OVERLAY -->
	<div id="dragndrop">
		<table><tr><td>
			<div class="container">
			</div>
		</td></tr></table>
	</div>

	<!-- MASKS LIST -->
	<aside id="masks">
		<div class="bttmcorner"></div>
		<div class="backgrnd"></div>
		<ul>
			<li m="neg"><tooltip><span>NEG </span>Inverser</tooltip></li>
			<li m="rgb"><tooltip><span>RGB </span>Rotation RGB</tooltip></li>
			<li m="xor"><tooltip><span>XOR </span>Xor</tooltip></li>
			<li m="flip-v"><tooltip><span>FV </span>Miroir verticale</tooltip></li>
			<li m="flip-h"><tooltip><span>FH </span>Miroir horizontale</tooltip></li>
			<li m="line-v"><tooltip><span>LV </span>Réflections verticales</tooltip></li>
			<li m="line-h"><tooltip><span>LH </span>Réflections horizontales</tooltip></li>
			<li m="q0"><tooltip><span>Q0 </span> LV + LH + NEG</tooltip></li>
			<li m="win-v"><tooltip><span>WINV </span> Random Y</tooltip></li>
			<li m="win-h"><tooltip><span>WINH </span> Random X</tooltip></li>
			<li m="w0"><tooltip><span>W0 </span> WINV + WINH</tooltip></li>
            <li m="tv-p"><tooltip><span>TV+ </span> TV brouillée +</tooltip></li>
            <li m="tv-m"><tooltip><span>TV- </span> TV brouillée -</tooltip></li>
			<li m="meko-p"><tooltip><span>MEKO+ </span> Random +</tooltip></li>
			<li m="meko-m"><tooltip><span>MEKO- </span> Random -</tooltip></li>
			<li m="fl"><tooltip><span>FL </span> Random spirale</tooltip></li>
			<li m="x"><tooltip><span>CP </span> Trie par mot de passe</tooltip></li>
			<li m="pttr"><tooltip><span>PATT </span> Motifs par mot de passe</tooltip></li>
		</ul>
		</div>
	</aside>

	<!-- HEADER -->
	<header id="header">
		<div class="menu">
			<ul>
				<li id="li-export" todial="export" class="tooltip bottom" m="export-png" title="Exporter en .png">Export</li 
				><li id="li-history" todial="history" class="tooltip bottom" title="Historique et sauvegardes">Historique<span class="historycount">0</span></li>
				<!--
				><li id="li-gallery" todial="gallery" class="tooltip bottom" title="Accéder à la galerie">Galerie</li
				><li id="li-settings" todial="settings" class="tooltip bottom" title="Paramètres">Options</li>
				-->
			</ul>
		</div>
		<div class="logo"></div>
	</header>

	<!-- WORKZONE -->
	<table id="cntr"><tr><td>
		<div id="workzone">
			<div id="safezone">
				<div class="trgt real"></div>
				<div class="trgt fake" style="display:none;"><div class="mask">Meko +</div></div>
				<canvas id="paper"></canvas>
				<canvas id="temp" style="display:none;"></canvas>
			</div>
		</div>
	</td></tr></table>

</div>

<!-- DIALOGS -->

<div dial="history" title="Historique" params="dialogClass:nopadd,height:300,autoOpen:false">
	<header>
		<ul>
			<li id="li-undo" w="undo" title="Annuler la dernière opération" disabled>Undo</li>
			<li id="li-redo" w="redo" title="Rétablir la dernière opération annulée" disabled>Redo</li>
			<li id="li-api" w="api" title="Générer une clef wMask" class="warning" disabled><?php echo htmlentities('<api>'); ?></li>
			<li id="li-clear" w="clear" title="Rétablir l'image" class="error" disabled>Clear</li>
		</ul>
	</header>
	<div class="container nopadd">
		<div slimscroll params="height:100%">
			<ul>
			</ul>
		</div>
	</div>
</div>

<div dial="settings" title="Options" params="height:400,autoOpen:false">
	<div class="container">
		<div slimscroll params="height:100%">
			<form>
				<p><b>Séléction</b></p>
				<label for="op-sel-active" class="ef checkbox">
					<span>Autorisée</span>
				    <input id="op-sel-active" type="checkbox" name="check" value="check1">  
				    <label class="fk-check" for="op-sel-active"> </label>  
				</label>
				<label for="op-sel-inactiveo" class="ef radio">
					<span>Coefficient</span>
				    <input id="op-sel-inactive1" type="radio" name="radio" value="radio1">  
				    <label class="fk-check" for="op-sel-inactive1">x8</label>  
				    <input id="op-sel-inactive2" type="radio" name="radio" value="radio2">  
				    <label class="fk-check" for="op-sel-inactive2">x16</label>
				    <input id="op-sel-inactiveo" type="text" name="radio" value="" maxlength="7">
				</label>
				<br>
				<p><b>Masques</b></p>
				<label for="op-mask-xor" class="ef">
					<span>Xor</span>
				    <input id="op-mask-xor" type="text">
				</label>
				<label for="op-mask-tv" class="ef">
					<span>Effect</span>
				    <input id="op-mask-xor" type="text">
				</label>
				<label for="op-sys-wcode" class="ef textarea">
					<span>wCode</span>
					<textarea id="op-sys-wcode"></textarea>
				</label>
			</form>
		</div>
	</div>
</div>

<!-- CONTEXTMENU -->

<div id="context">
	<ul>
		<li w="undo" disabled>Annuler<span class="historycount"></span></li>
		<li w="redo" disabled>Rétablir</li>
		<li class="separator"></li>
		<li class="separator end"></li>
		<li>Modifier la selection</li>
	</div>
</div>

</body>
</html>