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
    footer.appendChild(contactHeader)

    const address = document.createElement("address");

    const addrDiv = document.createElement("div");
    addrDiv.textContent = addressLines.join(", ");

    const emailDiv = document.createElement("div");
    emailDiv.textContent = "herman.goullet-ouellet@umoncton.ca";

    address.appendChild(addrDiv);
    address.appendChild(emailDiv);
    footer.appendChild(address);

    footer.appendChild(document.createElement("br"));

    const updateDiv = document.createElement("div");
    updateDiv.id = "last-update";
    let date = new Date(document.lastModified);
    let options = { year: "numeric", month: "long", day: "numeric" };
    let lang = document.documentElement.lang || navigator.language || 'fr-CA';
    let dateStr = date.toLocaleDateString(lang, options)
    updateDiv.innerHTML = (lang.slice(0,2)==="en" ? "Updated: " : "Mise à jour: ") + dateStr;

    footer.appendChild(updateDiv);

    document.body.appendChild(footer);

});