const toggleEl = document.getElementsByClassName('js-nav-toggle')[0]
const menuEl = document.getElementsByClassName('js-header-list')[0]

document.body.addEventListener('click', function (event) {
    const srcElementClass = event.target.className;
    console.log("CLICK")
	if (srcElementClass.match('js-nav-toggle')) {
		menuEl.classList.toggle('hidden')
	} else {
		menuEl.classList.add('hidden')
	}
});