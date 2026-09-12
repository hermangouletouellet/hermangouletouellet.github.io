(() => {
    const path = window.location.pathname;
    const link = document.querySelector(`.navbar a[href="${path}"]`);
    if (link) link.classList.add('active');
})();