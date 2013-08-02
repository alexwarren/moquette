var _heatherTextCount = 0;

function heatherText() {
	$("<div/>", {
		id: "heatherText"
	}).css({
		position: "absolute",
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
	var maxLeft = $(window).width();
	var maxTop = $(window).height();
	$("<div/>", {
		text: "Heather"
	}).css({
		position: "absolute",
		left: Math.random() * maxLeft,
		top: Math.random() * maxTop,
		"font-size": getRandomInt(8, 100) + "px",
		"font-family": "Georgia, serif",
		color: getRandomGrey(),
		opacity: Math.random(),
	}).appendTo("#heatherText");
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomGrey() {
	var hex = Math.floor(Math.random() * 256).toString(16);
	return "#" + hex + hex + hex;
}