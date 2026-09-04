if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {document.body.classList.add('loaded');});
} else {
    document.body.classList.add('loaded');
}