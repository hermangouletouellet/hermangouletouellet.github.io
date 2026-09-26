function toggle(button) {
    const expanded = button.getAttribute('aria-expanded')==="true";
    const target = document.getElementById(button.getAttribute('aria-controls'));

    button.setAttribute('aria-expanded', !expanded);
    if (target) target.classList.toggle('is-expanded', !expanded);
}