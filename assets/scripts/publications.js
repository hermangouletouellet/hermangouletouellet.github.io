
(function () {
    "use strict";

    // language depend strings
    const LANG_STR = {
        fr: {
            journal: "Revues scientifiques",
            proceedings: "Actes de conférences",
            preprint: "Prépublications",
            thesis: "Thèse",
            abstractCol: "Résumé",
            in: "Dans",
            ed: "Éd. par",
        },
        en: {
            journal: "Peer-reviewed journals",
            proceedings: "Conference proceedings",
            preprint: "Preprints",
            thesis: "Thesis",
            abstractCol: "Abstract",
            in: "In",
            ed: "Ed. by",
        },
    };

    // types of publications
    const PUB_TYPES = ["journal", "proceedings", "preprint", "thesis"];

    // language of the site, defaults to french
    const LANG = (document.documentElement.lang || "fr").split("-")[0];

    // toggle logic for abstract
    window.toggleAbstract = function (id, checkbox) {
        const elt = document.getElementById(`abstract-${id}`);
        if (!elt) return;
        elt.style.display = checkbox.checked ? "block" : "none";
    };

    //FIXME language dependent tooltips
    function buildArxivLink(arxivId) {
            if (!arxivId) return "";
            const url = `https://arxiv.org/abs/${arxivId}`
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="View on arXiv"> arxiv </a>`;
    }

    //FIXME language dependent tooltips
    function buildDoiLink(doi) {
        if (!doi) return "";
        const url = `https://doi.org/${doi}`
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="View DOI"> doi </a>`;
    }

    //FIXME language dependent tooltips
    function buildHalLink(halId) {
        if (!halId) return "";
        const url = `https://hal.science/${halId}`
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="View HAL"> hal </a>`;
    }

    //FIXME language dependent tooltips
    function buildUrlLink(url) {
        if (!url) return "";
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" title="View Link"> url </a>`;
    }

    function buildCitation(row, strings) {

        let html = `${row.authors}. <em>${row.title}</em>,`;

        if (row.type === "journal" && row.journal) {
            html += ` ${row.journal},` ;
            html += (row.volume) ? ` <strong>${row.volume}</strong> (${row.year})` : ` (${row.year})` ;
            if (row.issue) html += `, no. ${row.issue}`;
            if (row.artno) html += `, art. ${row.artno}`;
            if (row.pages) html += `, pp. ${row.pages}`;
            html += ".";

        //FIXME fix proceedings formatting
        } else if (row.type === "proceedings") {
            const venue = row.booktitle || row.journal || "Proceedings";
            html += ` ${strings.in} <em>${venue}</em>, ${row.year}.`;

        //FIXME fix thesis formatting
        } else if (row.type === "thesis") {
            const school = row.school || row.institution || "";
            html += ` <em>${school}</em>, ${row.year}.`;
            
        } else if (row.year) {
            html += ` ${row.year}.`;
        }

        return html;
    }

    function renderRow(row, strings) {
        const tr = document.createElement("tr");

        const tdCitation = document.createElement("td");
        let citationHtml = buildCitation(row, strings);
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

        const abstractText = row.abstract?.[LANG] || row.abstract?.en;

        if (abstractText && typeof abstractText === "string") {
            const abstractEl = document.createElement("div");
            abstractEl.id = `abstract-${row.id}`;
            abstractEl.className = "pub-abstract";
            abstractEl.style.display = "none";
            abstractEl.innerHTML = abstractText;
            tdCitation.appendChild(abstractEl);
        }

        const tdAbstractToggle = document.createElement("td");
        tdAbstractToggle.id = "centered";

        if (abstractText && typeof abstractText === "string") {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.onclick = () => toggleAbstract(row.id, checkbox);
            tdAbstractToggle.appendChild(checkbox);
        }   

        tr.appendChild(tdCitation);
        tr.appendChild(tdAbstractToggle);
        return tr;
    }

    function renderSectionHeader(label, strings) {
        const tr = document.createElement("tr");
        const th1 = document.createElement("th");
        th1.textContent = label;
        const th2 = document.createElement("th");
        th2.id = "centered";
        th2.style.width = "8ex";
        th2.textContent = strings.abstractCol;
        tr.appendChild(th1);
        tr.appendChild(th2);
        return tr;
    }

    function render(rows) {
        const strings = LANG_STR[LANG];
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

            table.appendChild(renderSectionHeader(strings[type], strings));
            for (const row of group) {
                table.appendChild(renderRow(row, strings));
            }
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
