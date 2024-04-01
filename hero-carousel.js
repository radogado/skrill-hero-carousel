if (document.querySelector(".hero .carousel")) {
	window.updateURLParameter = (url, param, paramVal) => {
		// return input string with updated/added URL parameter
		var hash = url.match("#") ? "#" + url.split("#")[1] : "";
		url = url.split("#")[0];
		var newAdditionalURL = "";
		var tempArray = url.split("?");
		var baseURL = tempArray[0];
		var additionalURL = tempArray[1];
		var temp = "";
		if (additionalURL) {
			tempArray = additionalURL.split("&");
			for (var i = 0; i < tempArray.length; i++) {
				if (tempArray[i].split("=")[0] !== param) {
					newAdditionalURL += temp + tempArray[i];
					temp = "&";
				}
			}
		}
		var rows_txt = temp + "" + param + "=" + paramVal;
		return baseURL + "?" + newAdditionalURL + rows_txt + hash;
	};
	document.querySelector(".hero .carousel .carousel-item.active .hero-slide--image").addEventListener("animationend", () => {
		document.querySelector(".hero .carousel").dataset.revealed = true;
		delete document.querySelector(".hero .carousel").dataset.animating;
	});
	document.querySelector(".hero .carousel .carousel-item.active .hero-slide--image").addEventListener("animationstart", () => {
		document.querySelector(".hero .carousel").dataset.animating = true;
	});
	const updateIndicators = (index) => {
		let indicators = document.querySelectorAll(".hero .carousel-indicators-hero .carousel-indicators-hero-list");
		indicators[0].style.webkitMaskPositionX = `calc(${indicators[0].children[index].offsetLeft}px - 1.875em)`;
		indicators[0].style.webkitMaskSize = `calc(${indicators[0].children[index].getBoundingClientRect().width}px + 1.875em) auto`;
		indicators[0].querySelector(".active").classList.remove("active");
		indicators[0].children[index].classList.add("active");
		indicators[0].scrollLeft = (index * indicators[0].offsetWidth) / 3 - indicators[0].offsetWidth / 3; // Because scrollTo() is unsupported by Old Edge
		if (index === indicators[0].children.length - 1) {
			indicators[0].dataset.lastActive = true;
		} else {
			delete indicators[0].dataset.lastActive;
		}
		indicators[1].querySelector(".active").classList.remove("active");
		indicators[1].children[index].classList.add("active");
		indicators[0].children[index].querySelector("button").click();
	};
	document.querySelectorAll(".hero .carousel-indicators-hero .carousel-indicators-hero-list button").forEach((el) => {
		el.addEventListener("click", (e) => {
			// console.log(e.isTrusted);
			let tab = e.target.closest("li");
			let content = document.querySelector(".hero .carousel-inner");
			let index = [...tab.parentNode.children].indexOf(tab);
			content.querySelector(".active").classList.remove("active");
			content.children[index].classList.add("active");
			updateIndicators(index);
			if (window.matchMedia("(max-width: 899.9px)").matches) {
				content.scrollTo(content.offsetWidth * index, 0);
				delete document.querySelector(".hero .carousel").dataset.revealed;
			}
			// let tab_param = tab.dataset.homepageTab;
			let tab_param = el.closest('.carousel').querySelector('.carousel-inner').children[parseInt(el.closest('li').dataset.slideTo)].id;
			if (!!tab_param && e.isTrusted) { // isTrusted means invoked by user, not programmatically
				document.querySelectorAll("a[href]:not([href^='#'])").forEach((el) => {
					el.href = updateURLParameter(el.getAttribute('href'), 'homepage_tab', tab_param.toLowerCase()); // Not sourcing el.href, because it converts relative links to absolute ones
				});
			}
		});
	});
	document.querySelector(".carousel-indicators-hero").addEventListener("keydown", (e) => {
		if (e.key === "Tab") {
			document.querySelector(".carousel-indicators-hero").dataset.tabbing = true;
		}
	});
	updateIndicators(0);
	document.querySelectorAll(".indicators-scroll > button").forEach((el) => {
		el.onclick = (e) => {
			let el = e.target;
			let indicators = el.parentNode.querySelector(".carousel-indicators-hero-list:first-of-type");
			let index = [...indicators.children].indexOf(indicators.querySelector(".active"));
			let new_index;
			if ([...el.parentNode.children].indexOf(el) > 0) {
				// Forwards
				new_index = index === indicators.children.length - 1 ? 0 : index + 1;
			} else {
				// Backwards
				new_index = index === 0 ? indicators.children.length - 1 : index - 1;
			}
			indicators.children[new_index].querySelector("button").click();
		};
	});

	function afterSlide(e) {
		let index = [...e.target.querySelector(".carousel-inner").children].indexOf(e.target.querySelector(".carousel-inner .active"));
		updateIndicators(index);
	}
	if (!window.jQuery) { // Bootstrap 5, no jQuery
		document.querySelector(".hero .carousel").addEventListener('slid.bs.carousel', afterSlide);
	} else { // jQuery Bootstrap 4
		$(".hero .carousel").on("slid.bs.carousel", afterSlide);
	}

	let resize_timeout;
	window.addEventListener("resize", (e) => {
		let carousel = document.querySelector(".hero .carousel");
		if (window.matchMedia("(min-width: 900px)").matches) {
			carousel.querySelector(".carousel-item.active .hero-slide--image").style.display = "none";
			setTimeout(() => {
				carousel.querySelector(".carousel-item.active .hero-slide--image").style.display = "";
			}, 0);
			if (!!carousel.dataset.mobile) {
				carousel.querySelector(".carousel-inner").style.opacity = 0;
			}
			delete carousel.dataset.mobile;
		} else {
			carousel.dataset.mobile = true;
		}
		delete carousel.dataset.revealed;
		clearTimeout(resize_timeout);
		resize_timeout = setTimeout(() => {
			carousel.querySelector(".carousel-inner").style.opacity = "";
			carousel.dataset.revealed = true;
		}, parseFloat(getComputedStyle(carousel).getPropertyValue("--duration")) * 1000);
		let indicators = carousel.querySelector(".carousel-indicators-hero ol:last-of-type");
		updateIndicators([...indicators.children].indexOf(indicators.querySelector(".active")));
	});
	let isChrome = () => !!navigator.userAgent.match("Chrome");
	let isRTL = (el) => getComputedStyle(el).direction === "rtl";
	let scrollStart = (el) => (isRTL(el) && isChrome() ? el.scrollWidth - el.scrollLeft - el.offsetWidth : (isRTL(el) && !isChrome() ? -1 : 1) * el.scrollLeft); // Get correct start scroll position for LTR and RTL
	var isScrolling;
	var lastScrollX;
	let scrollStopped = (e) => {
		if (window.matchMedia("(max-width: 899.9px)").matches) {
			// Clear our timeout throughout the scroll
			let el = e.target;
			clearTimeout(isScrolling);
			lastScrollX = scrollStart(el);
			// Set a timeout to run after scrolling ends
			isScrolling = setTimeout(function() {
				if (lastScrollX === scrollStart(el) && scrollStart(el) % el.offsetWidth === 0) {
					// Also if scroll is in snap position
					// 					console.log( 'Scrolling has stopped.', el, scrollStart(el), el.scrollWidth, Math.round(scrollStart(el)/el.scrollWidth*el.children.length));
					let new_index = Math.round((scrollStart(el) / el.scrollWidth) * el.children.length);
					updateIndicators(new_index);
				}
			}, 66);
		}
	};
	document.querySelector(".hero .carousel-inner").addEventListener("scroll", scrollStopped);
	document.addEventListener("visibilitychange", e => {
		document.querySelectorAll(".carousel").forEach((el) => {
			if (!window.jQuery) { // Bootstrap 5, no jQuery
				var carouselObject = new bootstrap.Carousel(el);
				if (document.hidden === true) {
					carouselObject.pause();
				} else {
					carouselObject.cycle();
				}
			} else { // jQuery Bootstrap 4
				$(el).carousel(document.hidden === true ? "pause" : "cycle");
			}
		});
	}, false);
	document.querySelector(".hero .carousel").addEventListener("animationstart", (e) => {
		// Safari glitch when navigating back to the page
		if (e.animationName === "hero-right-arrow") {
			delete e.target.dataset.revealed;
		}
	});
}