function moquetteResetScroll() {
	setTimeout(function(){
		$('html, body').animate({ scrollTop: scrollTo }, 200);
		markScrollPosition();
		$("#divOutput").css("min-height", 0);
	}, 250);
}