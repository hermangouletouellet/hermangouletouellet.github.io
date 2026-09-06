window.addEventListener("DOMContentLoaded", () => {

    const footer = document.createElement("footer");

    const addressLines = [
        "Département de mathématiques et de statistique",
        "Université de Moncton",
        "60 Notre-Dame-du-Sacré-Coeur Street",
        "Moncton E1A 3E9",
        "Nouveau-Brunswick", 
        "Canada"
    ]

    const contactHeader = document.createElement("h4");
    contactHeader.textContent = "Contact";
    footer.appendChild(contactHeader);

    let addressContainer = document.createElement("div");
    addressContainer.className = "address-content";

    let address = document.createElement("div");
    address.className = "address-text";
    address.innerHTML = `
        <div> ${addressLines.join(", ")} </div>
        <div> herman.goullet-ouellet@umoncton.ca </div>`;
    addressContainer.appendChild(address);

    let umoncton = document.createElement("a");
    umoncton.href = "https://www.umoncton.ca/umcm-sciences-mathstat/";
    umoncton.innerHTML = `<img src="/assets/img/H_RESEAU.svg" alt="Logo de l'Université de Moncton" style="height:4em;">`;
    let nserc = document.createElement("a");
    nserc.href = "https://nserc-crsng.canada.ca/fr";
    nserc.innerHTML = `<img src="/assets/img/NSERC_RGB.svg" alt="Logo du CRSNG" style="height:4em;">`;
    let logoDiv = document.createElement("div");
    logoDiv.className = "logo-content";
    logoDiv.appendChild(umoncton);
    logoDiv.appendChild(nserc)
    addressContainer.appendChild(logoDiv);

    footer.appendChild(addressContainer);

    footer.appendChild(document.createElement("br"));

    const updateDiv = document.createElement("div");
    updateDiv.id = "last-update";
    let date = new Date(document.lastModified);
    let options = { year: "numeric", month: "long", day: "numeric" };
    let lang = document.documentElement.lang || navigator.language || 'fr-CA';
    let dateStr = date.toLocaleDateString(lang, options)
    updateDiv.innerHTML = (lang.slice(0,2)==="en" ? "Last updated: " : "Dernière mise à jour: ") + dateStr;

    footer.appendChild(updateDiv);

    document.body.appendChild(footer);

});