var _heatherTextCount = 0;

function heatherText() {
	_heatherTextCount++;
	if (_heatherTextCount < 150) {
		setTimeout(function() {
			heatherText();
		}, 30);
	}
	else {
		ASLEvent("JSFinish_HeatherText", "");
	}
	var maxLeft = $(window).width();
	var maxTop = $(window).height();
	$("<div/>", {
		"class": "temp",
		text: "Heather"
	}).css({
		position: "absolute",
		left: Math.random() * maxLeft,
		top: Math.random() * maxTop,
		"font-size": getRandomInt(8, 100) + "px",
		"font-family": "Georgia, serif"
	}).appendTo("body");
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}