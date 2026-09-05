
(function () {
    "use strict";

    // types of talks
    const talkTypes = ["conference", "seminar", "poster"];

    const typeNames = {
        "conference" : {"fr" : "Conférences", "en" : "Conferences"} ,
        "seminar": { "fr": "Séminaires", "en": "Seminars" } ,
        "poster": { "fr": "Affiches", "en": "Posters" },
    }

    // language of the site, defaults to french
    const lang = (document.documentElement.lang || "fr").split("-")[0];

    const dateFormatter = new Intl.DateTimeFormat(document.documentElement.lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const langNames = new Intl.DisplayNames([document.documentElement.lang], { type: 'region' });

    // toggle logic for abstract
    window.toggleAbstract = function (id, checkbox) {
        const elt = document.getElementById(`abstract-${id}`);
        if (!elt) return;
        elt.classList.toggle("is-expanded", checkbox.checked);    
    };

    function buildTalk(row) {

        let html = `<em>${row.title}</em>. `;
        let countryStr = row.country ? langNames.of(row.country) : null ;
        let dates = row.date.split("/");
        let dateStr = dates[1] 
            ? dateFormatter.formatRange(new Date(dates[0]), new Date(dates[1])) 
            : dateFormatter.format(new Date(dates[0]));

        let locationInfo = [row.venue, row.location, countryStr, dateStr] ;
        html += locationInfo.filter(Boolean).join(", ") + "." ;

        if (row.online) html += lang==="en" ? " Online." : " En ligne."

        return html;
    }

    function renderRow(row) {
        const tr = document.createElement("tr");

        const tdTalk = document.createElement("td");
        tdTalk.innerHTML = buildTalk(row);

        tr.appendChild(tdTalk);

        const abstractWrapper = document.createElement("div");
        abstractWrapper.id = `abstract-${row.id}`;
        abstractWrapper.className = "abstract-wrapper";

        const abstractInner = document.createElement("div");
        abstractInner.className = "abstract-inner";
        abstractInner.innerHTML = row.abstract;

        abstractWrapper.appendChild(abstractInner);
        tdTalk.appendChild(abstractWrapper);

        const tdAbstractToggle = document.createElement("td");
        tdAbstractToggle.style.textAlign = "center";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        if (row.abstract) {
            checkbox.onclick = () => toggleAbstract(row.id, checkbox);
        } else {
            checkbox.disabled = true;
        }

        tdAbstractToggle.appendChild(checkbox);
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
        th2.textContent = lang === "en" ? "Abstract" : "Résumé";
        tr.appendChild(th1);
        tr.appendChild(th2);
        return tr;
    }

    function render(rows) {
        const table = document.getElementById("talk-table");
        if (!table) return;
        table.innerHTML = "";

        const byType = {};
        for (const row of rows) {
            if (!byType[row.type]) byType[row.type] = [];
            byType[row.type].push(row);
        }

        for (const type of talkTypes) {
            const group = byType[type];
            if (!group || group.length === 0) continue;

            group.sort((a, b) => {
                return new Date(b.date.split('/')[0]) - new Date(a.date.split('/')[0]);
            });

            table.appendChild(renderSectionHeader(typeNames[type][lang]));
            for (const row of group) {
                table.appendChild(renderRow(row));
            }
        }
    }

    async function init() {
        try {
            const response = await fetch("/data/talks.json");
            render(await response.json());
        } catch (err) {
            console.error("Data load failed:", err);
            const table = document.getElementById("talk-table");
            if (table) table.innerHTML = '<tr><td colspan="2">Error loading talks.</td></tr>';
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
