if (document.readyState === 'complete') {
    document.documentElement.classList.remove('hidden');
} else {
    window.addEventListener('load', () => {
        document.documentElement.classList.remove('hidden');
    });
}

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.documentElement.classList.add('hidden');
        requestAnimationFrame(() => {
            document.documentElement.classList.remove('hidden');
        });
    }
});