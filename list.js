"use strict";

let entries;
let SVGS = {};
let userStatus = false;

loadSVG().then().catch();

async function doStart() {
    try {
        doSetupIcons();
        getAllEntries();
    } catch (e) {
        console.error('Cannot start: ' + e.message);
    }
}

async function loadSVG() {
    try {
        SVGS = {
            arrowBTN: await (await fetch("./assets/arrow.svg")).text(),
            refreshBTN: await (await fetch("./assets/reset.svg")).text(),
            // toggleSVG: await (await fetch("./assets/toggle.svg")).text(),
        };

    } catch(error) {
        console.error('Cannot read svg file, reason: ' + error.message);
    }
}

function doSetupIcons() {
    document.getElementById('nameArrowSVG').innerHTML = SVGS.arrowBTN;
    document.getElementById('tableRefreshSVG').innerHTML = SVGS.refreshBTN;

    const arrowSVGS = document.getElementsByClassName('table-arrow-svg');
    Array.from(arrowSVGS).forEach(element =>
        element.innerHTML = SVGS.arrowBTN);
}

function getAllEntries() {
    fetch("https://smackfly-2fd1.restdb.io/rest/users-fly-smacker", {
        method: "get",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": "5de40f274658275ac9dc2152",
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

// function doAnimateDeleteButton(button) {
//     button.children[2].classList.add('animate');
//     setTimeout(() => {
//         button.children[2].classList.remove('animate');
//     }, 1600);
//
//     //TODO: Change the button style to deleted by adding some class to it (smoothen with transition)
//     //TODO: This should act as a trigger, must be aware of the position of the button as well (delete/restore)
// }

function addNewEntryToHTML() {
    const entryTemplate = document.getElementById('entryTemplate');
    const newEntryTemplate = entryTemplate.content.cloneNode(true);
    // const deleteButton = newEntryTemplate.firstElementChild.children[4];
    // deleteButton.innerHTML = `<span class="user-status"><span>Active</span>${SVGS.toggleSVG}</span>`;

    // const deleteButtonTrigger = deleteButton.firstElementChild.children[1];
    // const deleteButtonTriggerText = deleteButton.firstElementChild.children[0];

    // deleteButtonTriggerText.onclick = () => {
    //     doAnimateDeleteButton(deleteButtonTrigger);
    // };
    // deleteButtonTrigger.onclick = () => {
    //     doAnimateDeleteButton(deleteButtonTrigger);
    // };
    // newEntryTemplate.firstElementChild.children[4].firstElementChild.innerHTML = entryUserStatus.textContent;

    document.getElementById('entriesContainer').appendChild(newEntryTemplate);
}

document.body.onload = doStart;