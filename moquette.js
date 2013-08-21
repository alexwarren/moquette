function endAct0() {
	$("#divOutput").effect("drop");
	setTimeout(function() {
		ASLEvent("StartAct1", "");
	}, 1000);
}

function startAct1() {
	$("#divOutput").show();
}

var _heatherTextCount = 0;

function heatherText() {
	$("<div/>", {
		id: "heatherText"
	}).css({
		position: "fixed",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		overflow: "hidden"
	}).appendTo("body");
	doHeatherText();
}

function doHeatherText() {
	_heatherTextCount++;
	if (_heatherTextCount < 150) {
		setTimeout(function() {
			doHeatherText();
		}, 20);
	}
	else {
		$("#heatherText").fadeOut(2000, function() {
			$(this).remove();
		});
		setTimeout(function() {
			ASLEvent("JSFinish_HeatherText", "");
		}, 500);
	}
	var minLeft = -100;
	var minTop = -100;
	var maxLeft = $(window).width();
	var maxTop = $(window).height();
	for (var i = 0; i < 3; i++) {
		$("<div/>", {
			text: "Heather"
		}).css({
			position: "absolute",
			left: getRandomInt(minLeft, maxLeft),
			top: getRandomInt(minTop, maxTop),
			"font-size": getRandomInt(8, 100) + "px",
			"font-family": "Georgia, serif",
			color: getRandomGrey(),
			opacity: Math.random(),
		}).appendTo("#heatherText");
	}
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomGrey() {
	var hex = Math.floor(Math.random() * 256).toString(16);
	return "#" + hex + hex + hex;
}

function blackout() {
	setTimeout(function() {
		$("<div/>", {
			id: "blackout"
		}).css({
			position: "fixed",
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
			background: "black",
			display: "none"
		}).appendTo("body");
		$("#blackout").fadeIn({
			duration: 10000,
			easing: "easeInQuad",
		});
		speckles();
		setTimeout(function () {
			$("#speckles").remove();
			ASLEvent("JSFinish_Blackout", "");
		}, 11000);
		setTimeout(function () {
			$("#blackout").fadeOut({
				duration: 10000,
				easing: "easeInQuad",
				complete: function() {
					console.log("remove");
					$(this).remove();
				}
			});
		}, 12000);
	}, 1000);
}

function speckles() {
	$("<div/>", {
		id: "speckles"
	}).css({
		position: "fixed",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		overflow: "hidden"
	}).appendTo("body");
	doSpeckles();
}

var _speckleCount = 0;
var _speckleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

function doSpeckles() {
	_speckleCount++;
	if (_speckleCount < 150) {
		setTimeout(function() {
			doSpeckles();
		}, 50);
	}
	var minLeft = -10;
	var minTop = -10;
	var maxLeft = $(window).width();
	var maxTop = $(window).height();
	for (var i = 0; i < 20; i++) {
		$("<div/>", {
			text: _speckleChars.charAt(Math.floor(Math.random() * _speckleChars.length))
		}).css({
			position: "absolute",
			left: getRandomInt(minLeft, maxLeft),
			top: getRandomInt(minTop, maxTop),
			"font-size": getRandomInt(4, 10 + _speckleCount) + "px",
			"font-family": "Georgia, serif"
		}).appendTo("#speckles");
	}
}

function heatherTube() {
	setTimeout(function () {
		$("body").css("overflow-x", "hidden");
		$("<div/>", {
			id: "heathertube",
			text: "HEATHER"
		}).css({
			position: "relative",
			left: "1200px",
			top: "0px",
			"font-size": "36pt",
			"font-family": "Georgia, serif"
		}).appendTo(getCurrentDiv());
		animateHeatherTube(200);
	}, 2000);
}

function animateHeatherTube(duration) {
	if (duration >= 2000) {
		$("#heathertube").animate({
			left: "0px"
		}, duration, "swing", function () {
			$("body").css("overflow-x", "inherit");
			$("#heathertube").fadeOut(1000, function() {
				ASLEvent("JSFinish_HeatherTube", "");
			});
		});
	}
	else {
		$("#heathertube").animate({
			left: "-1200px"
		}, duration, "linear", function () {
			$("#heathertube").css("left", "1200px");
			duration = duration * 1.5;
			animateHeatherTube(duration);
		});
	}
}