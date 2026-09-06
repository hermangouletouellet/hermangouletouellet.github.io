
(function () {
    "use strict";

    // language depend strings
    const LANG_STR = {
        journal: { fr: "Revues scientifiques", en: "Peer-reviewed journals" },
        proceedings: { fr: "Actes de conférences", en: "Conference proceedings" },
        preprint: { fr: "Prépublications", en: "Preprints" },
        thesis: { fr: "Thèse", en: "Thesis" },
        abstract: { fr: "Résumé", en: "Abstract" },
        and: { fr: "et", en: "and"},
        in: { fr: "dans", en: "in" },
        ed: { fr: "éd. par", en: "ed. by" },
    };

    // types of publications
    const PUB_TYPES = ["journal", "proceedings", "preprint", "thesis"];

    // language of the site, defaults to french
    const LANG = (document.documentElement.lang || "fr").split("-")[0];

    // toggle logic for abstract
    window.toggleAbstract = function (id, checkbox) {
        const elt = document.getElementById(`abstract-${id}`);
        if (!elt) return;
        elt.classList.toggle("is-expanded", checkbox.checked);    
    };

    //FIXME language dependent tooltips
    function buildArxivLink(arxivId) {
        if (!arxivId) return "";
        let url = `https://arxiv.org/abs/${arxivId}`
        let tooltip = (LANG === "en") ? "View on arXiv" : "Voir sur arXiv";
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="${tooltip}"> arXiv </a>`;
    }

    function buildDoiLink(doi) {
        if (!doi) return "";
        let url = `https://doi.org/${doi}`
        let tooltip = (LANG === "en") ? "DOI link" : "Lien DOI";
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="${tooltip}"> doi </a>`;
    }

    function buildHalLink(halId) {
        if (!halId) return "";
        let url = `https://hal.science/${halId}`
        let tooltip = (LANG === "en") ? "View on HAL" : "Voir sur HAL" ;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="${tooltip}"> hal </a>`;
    }

    function buildUrlLink(url) {
        if (!url) return "";
        let tooltip = (LANG === "en") ? "Citation URL" : "URL de la citation";
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="${tooltip}"> url </a>`;
    }

    function buildCitation(row) {
        let authorStr = (row.authors.length>1) 
            ? [row.authors.slice(0,-1).join(", "),row.authors.slice(-1)[0]].join(` ${LANG_STR.and[LANG]} `)
            : row.authors[0];

        let html = `${authorStr}. <em>${row.title}</em>,`;

        if (row.type === "journal" && row.journal) {
            html += ` ${row.journal}` ;
            html += (row.volume) ? `, <strong>${row.volume}</strong> (${row.year})` : ` (${row.year})` ;
            if (row.issue) html += `, no. ${row.issue}`;
            if (row.artno) html += `, art. ${row.artno}`;
            if (row.pages) html += `, pp. ${row.pages}`;
            html += ".";

        } else if (row.type === "proceedings") {
            html += ` ${LANG_STR.in[LANG]}: <em>${row.booktitle}</em>`;
            if (row.editors) html += `, ${LANG_STR.ed[LANG]}: ${row.editors}`;
            html += ` (${row.year})`
            if (row.series) html += `, ${row.series}`;
            if (row.volume) html += `, vol. ${row.volume}`;
            if (row.artno) html += `, art. ${row.artno}`;
            if (row.pages) html += `, pp. ${row.pages}`;
            html += ".";

        } else if (row.type === "thesis") {
            html += ` <em>${row.institution}</em>, ${row.year}.`;
            
        } else if (row.year) {
            html += ` ${row.year}.`;
        }

        return html;
    }

    function renderRow(row) {
        const tr = document.createElement("tr");

        const tdCitation = document.createElement("td");
        let citationHtml = buildCitation(row);
        tdCitation.innerHTML = citationHtml;

        const arxivHtml = buildArxivLink(row.arxiv);
        const doiHtml = buildDoiLink(row.doi);
        const halHtml = buildHalLink(row.hal);
        const urlHtml = buildUrlLink(row.url);

        if (arxivHtml || doiHtml || halHtml || urlHtml) {
            const linksDiv = document.createElement("div");
            linksDiv.className = "pub-links";
            linksDiv.innerHTML = `${doiHtml}${arxivHtml}${halHtml}${urlHtml}`;
            tdCitation.appendChild(linksDiv);
        }

        tr.appendChild(tdCitation);


        const abstractText = row.abstract?.[LANG] || row.abstract?.en;

        if (abstractText && typeof abstractText === "string") {
            const abstractWrapper = document.createElement("div");
            abstractWrapper.id = `abstract-${row.id}`;
            abstractWrapper.className = "abstract-wrapper";

            const abstractInner = document.createElement("div");
            abstractInner.className = "abstract-inner";
            abstractInner.innerHTML = abstractText;

            abstractWrapper.appendChild(abstractInner);
            tdCitation.appendChild(abstractWrapper);
        }

        const tdAbstractToggle = document.createElement("td");
        tdAbstractToggle.style.textAlign = "center";

        if (abstractText && typeof abstractText === "string") {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.onclick = () => toggleAbstract(row.id, checkbox);
            tdAbstractToggle.appendChild(checkbox);
        }   

        tr.appendChild(tdAbstractToggle);
        return tr;
    }

    function renderSectionHeader(label) {
        const tr = document.createElement("tr");
        const th1 = document.createElement("th");
        th1.textContent = label;
        const th2 = document.createElement("th");
        th2.style.textAlign = "center";
        th2.style.width = "8ex";
        th2.textContent = LANG_STR.abstract[LANG];
        tr.appendChild(th1);
        tr.appendChild(th2);
        return tr;
    }

    function render(rows) {
        const table = document.getElementById("pub-table");
        if (!table) return;
        table.innerHTML = "";

        const byType = {};
        for (const row of rows) {
            if (!byType[row.type]) byType[row.type] = [];
            byType[row.type].push(row);
        }

        for (const type of PUB_TYPES) {
            const group = byType[type];
            if (!group || group.length === 0) continue;

            group.sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));

            table.appendChild(renderSectionHeader(LANG_STR[type][LANG]));
            for (const row of group) {
                table.appendChild(renderRow(row));
            }
        }

        if (window.MathJax && typeof MathJax.whenReady === 'function') {
            MathJax.whenReady(() => {
                MathJax.typesetPromise([table]).catch((err) => console.error('MathJax error:', err));
            });
        }
    }

    async function init() {
        try {
            const response = await fetch("/data/publications.json");
            render(await response.json());
        } catch (err) {
            console.error("Data load failed:", err);
            const table = document.getElementById("pub-table");
            if (table) table.innerHTML = '<tr><td colspan="2">Error loading publications.</td></tr>';
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
