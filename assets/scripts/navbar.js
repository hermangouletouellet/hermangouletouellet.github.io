document.addEventListener("DOMContentLoaded", function() {
    const LANG = (document.documentElement.lang || "fr").split("-")[0];

    const pages = [
        { name: {fr: "Accueil", en: "Home"}, path: "/" },
        { name: {fr: 'Publications', en: 'Publications'}, path: '/publications/' },
        { name: {fr: 'Exposés', en: 'Talks'}, path: '/exposes/' },
    ];

    const navbar = document.createElement('div');
    navbar.className = 'navbar';

    for (const page of pages) {
        let path = page.path + (LANG === "en" ? "en/" : "");
        const a = document.createElement('a');
        a.href = path;
        a.textContent = page.name[LANG] || page.name.fr;

        if (path === window.location.pathname) {
            a.className = 'active';
        }
        navbar.appendChild(a);
    }

    // 3. Create the right-side container for language toggles
    const rightDiv = document.createElement('div');
    rightDiv.className = 'navbar-right';

    const frLink = document.createElement('a');
    frLink.href = LANG === "en" ? "../" : "./";
    frLink.textContent = "fr";

    const enLink = document.createElement('a');
    enLink.href = LANG === "en" ? "./" : "en/";
    enLink.textContent = "en";

    if (LANG === 'en') {
        enLink.className = "active";
     } else {
        frLink.className = "active"
     };

    rightDiv.appendChild(frLink);
    rightDiv.appendChild(enLink);

    navbar.appendChild(rightDiv);

    document.body.prepend(navbar);
});