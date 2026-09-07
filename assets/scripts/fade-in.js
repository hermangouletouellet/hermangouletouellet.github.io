setVisible = () => { 
    document.documentElement.classList.remove('hidden');
}

if (document.readyState === 'complete') {
    setVisible();
} else {
    window.addEventListener('load', setVisible);
}

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.documentElement.classList.add('hidden');
        requestAnimationFrame(() => {
            document.documentElement.classList.remove('hidden');
        });
    }
});