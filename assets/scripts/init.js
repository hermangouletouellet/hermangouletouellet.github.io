(function () {

    window.MathJax = { tex: { inlineMath: { '[+]': [['$', '$']] } } };
    const LANG = (document.documentElement.lang || "fr").split("-")[0];
    const description = LANG === "en" ? "Herman Goulet-Ouellet personnal website" : "Site web de Herman Goulet-Ouellet" ;

    const elements = [
        // meta properties
        { tag: "meta", name: "viewport", content: "width=device-width,initial-scale=1" },
        { tag: "meta", name: "description", content: `${description}` },

        // fonts
        { tag: "link", rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap" },
        { tag: "link", rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Playfair+Display&family=Roboto:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap" },

        // scripts
        { tag: "script", src: "https://cdn.jsdelivr.net/npm/mathjax@4/tex-chtml.js", defer: true },
        { tag: "script", src: "/assets/scripts/footer.js", defer: true },
        { tag: "script", src: "/assets/scripts/navbar.js", defer: true },
        { tag: "script", src: "/assets/scripts/fade-in.js", defer: true }
    ];

    // loading elements
    for (const item of elements) {
        const el = document.createElement(item.tag);
        for (const [key, value] of Object.entries(item)) {
            if (key !== "tag") el.setAttribute(key, value);
        }
        if (item.tag === "script") {
            el.async = false;
        }
        document.head.appendChild(el);
    }
})();