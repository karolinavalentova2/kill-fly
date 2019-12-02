"use strict";

let entries;

function doStart() {
    loadSVG();
    getAllEntries();
}

async function loadSVG() {
    try {
        const SVGS = {
            arrowBTN: await (await fetch("./assets/arrow.svg")).text(),
            refreshBTN: await (await fetch("./assets/reset.svg")).text(),
        };

        document.getElementById('nameArrowSVG').innerHTML = SVGS.arrowBTN;
        document.getElementById('tableRefreshSVG').innerHTML = SVGS.refreshBTN;

        const arrowSVGS = document.getElementsByClassName('table-arrow-svg');
        Array.from(arrowSVGS).forEach(element =>
            element.innerHTML = SVGS.arrowBTN)

    } catch(error) {
        console.error('Cannot read svg file, reason: ' + error.message);
    }
}

function getAllEntries() {
    fetch("https://smackfly-2fd1.restdb.io/rest/users-fly-smacker", {
        method: "get",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": "f43fa05c7dd025ccdc24b84d1178c49dd19cb",
            "cache-control": "no-cache",
            // "Access-Control-Allow-Origin": "*",
        },
        //mode: "no-cors",
    })
        .then(e => {
            e.json().then((data) => {
                if(data.length !== 0) {
                    data.forEach((entry) => {
                        addNewEntryToHTML(entry)
                    });
                }
            }).catch(e => console.log(e));
        })
        .catch(e => {
            console.log(e);
            entries = [];
        });
}

function addNewEntryToHTML() {
    const entryTemplate = document.getElementById('entryTemplate');
    const newEntryTemplate = entryTemplate.content.cloneNode(true);

    console.log(newEntryTemplate);

}

document.body.onload = doStart;