const countLines = (el) =>
	Math.round(el.offsetHeight / parseInt(getComputedStyle(el).lineHeight));

const splitIntoLines = (el) => {
	if (el.previousHeight !== el.offsetHeight) {
		let lines = countLines(el);

		let content = el.querySelector("span")
			? el.querySelector("span").innerHTML
			: el.innerHTML;

		// 		console.log(el, lines, content);

		if (lines > 0) {
			el.innerHTML = "";

			while (!!lines--) {
				el.innerHTML += `<span>${content}</span>`;
			}
		}

		el.classList.add("split-lines");
		el.style.setProperty("--line-height", getComputedStyle(el).lineHeight);
		el.previousHeight = el.offsetHeight;
	}
};

const split_lines_elements =
	".hero-slide .hero-slide--text:not(.mobile-only) h2, .hero.text-image h1, .hero.text-image h2";

const splitElements = (selector) => {
	document.querySelectorAll(selector).forEach((el) => {
		splitIntoLines(el);
	});
};

splitElements(split_lines_elements);

window.addEventListener("resize", (e) => {
	splitElements(split_lines_elements);
});
