
(function () {
    "use strict";

    const T = {
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

    const TYPE_ORDER = ["journal", "proceedings", "preprint", "thesis"];

    const lang = typeof SITE_LANG !== "undefined" ? SITE_LANG : "fr";

    let abstractsCache=null;

    window.toggleAbstract = async function (id, checkbox) {
        const elt = document.getElementById(id);
        if (!elt) return;

        if (elt.style.display === "block") {
            elt.style.display = "none";
            return;
        }

        if (!abstractsCache) {
            try {
                const response = await fetch("/data/publications_abstracts.json");
                abstractsCache = await response.json();
            } catch (err) {
                console.error("Failed to load abstracts.json:", err);
                elt.innerHTML = "<em>Error loading abstract.</em>";
                elt.style.display = "block";
                return;
            }
        }

        const entry = abstractsCache[id];
        const text = entry ? (entry[lang] || entry["abstract_en"] || "") : "";

        elt.innerHTML = text || "<em>No abstract available.</em>";
        elt.style.display = "block";
    };

    // TODO check if used
    window.toggle = function (id) {
        const elt = document.getElementById(id);
        if (!elt) return;
        elt.style.display = elt.style.display === "block" ? "none" : "block";
    };

    // TODO inline this
    function fillTokens(html, strings) {
        return html
            .replace(/\{\{in\}\}/g, strings.in)
            .replace(/\{\{ed\}\}/g, strings.ed);
    }

    function buildArxivLink(arxivId) {
        if (!arxivId) return "";
        const url = "https://arxiv.org/abs/${arxivId}"
        return `
            <a href="${url}" target="_blank" rel="noopener noreferrer" title="View on arXiv">
                <img src="/assets/img/arxiv-logo.svg" alt="arXiv" width="30" height="30">
            </a>`;
    }

    function buildDoiLink(doi) {
    if (!doi) return "";
    const url = "https://doi.org/${doi}"
    return `
        <a href="${url}" target="_blank" rel="noopener noreferrer" title="View DOI">
            <img src="/assets/img/doi-logo.svg" alt="DOI" width="30" height="30">
        </a>`;
    }

    function buildHalLink(halId) {
    if (!halId) return "";
    const url = "https://hal.science/${halId}"
    return `
        <a href="${url}" target="_blank" rel="noopener noreferrer" title="View HAL">
            <img src="/assets/img/hal-logo.svg" alt="HAL" width="30" height="30">
        </a>`;
    }

    function buildExtraLink(url, label) {
        if (!url) return "";
        return ` <a href="${url}">${label}</a>`;
    }

    function renderRow(row, strings) {
        const tr = document.createElement("tr");

        const tdCitation = document.createElement("td");
        let citationHtml = fillTokens(row.citation_html, strings);

        // Creating container with link icons
        const arxivHtml = buildArxivLink(row.arxiv);
        const doiHtml = buildDoiLink(row.doi);
        const halHtml = buildHalLink(row.hall);

        if (arxivHtml || doiHtml || halHtml) {
            citationHtml += `<div class="pub-link">${doiHtml}${arxivHtml}${halHtml}</div>`;
        }

        tdCitation.innerHTML = citationHtml;

        const abstractEl = document.createElement("abstract");
        abstractEl.id = row.id;
        abstractEl.style.display = "none";
        tdCitation.appendChild(abstractEl);

        const tdAbstractToggle = document.createElement("td");
        tdAbstractToggle.id = "centered";

        if (row.has_abstract === "true" || row.has_abstract === "1") {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.setAttribute("onclick", `toggleAbstract('${row.id}', this)`);
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
        const strings = T[lang];
        const table = document.getElementById("pub-table");
        if (!table) return;
        table.innerHTML = "";

        const byType = {};
        for (const row of rows) {
            if (!byType[row.type]) byType[row.type] = [];
            byType[row.type].push(row);
        }

        for (const type of TYPE_ORDER) {
            const group = byType[type];
            if (!group || group.length === 0) continue;

            group.sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));

            table.appendChild(renderSectionHeader(strings[type], strings));
            for (const row of group) {
                table.appendChild(renderRow(row, strings));
            }
        }
    }

    function init() {
        Papa.parse(CSV_PATH, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                render(results.data);
            },
            error: function (err) {
                console.error("Failed to load publications.csv:", err);
                const table = document.getElementById("pub-table");
                if (table) {
                    table.innerHTML =
                        '<tr><td>Unable to load publications data.</td></tr>';
                }
            },
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
