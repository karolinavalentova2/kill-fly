"use strict";

let entries = null;
let SVGS = {};
let SortBY = {
    lastSortingOrderItem: null,
    lastSortingMethod: 'ASC',
};
let preloader;

async function doStart() {
    try {
        await loadSVG();
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
            preloaderSVG: await (await fetch("./assets/preloader.svg")).text(),
            trashbinSVG: await (await fetch("./assets/trashbin.svg")).text(),
        };

    } catch(error) {
        console.error('Cannot read svg file, reason: ' + error.message);
    }
}

function doShowUserRemoveModal(userInfo) {
    const closeModalButton = document.getElementById('closeModal');
    const modalBody = closeModalButton.parentElement;

    modalBody.parentElement.classList.toggle('showModal');

    closeModalButton.onclick = () => {
        closeModalButton.parentElement.parentElement.classList.toggle('showModal')
    };

    const { id, name, email, score } = userInfo;
    modalBody.children[3].textContent = `${ id } | ${name ? name : 'N/A'} | ${email ? email : 'N/A'} | ${score ? score : 'N/A'}`;

    modalBody.children[4].onclick = () => {
        deleteUser(userInfo);
    }
}

function doCloseUserRemoveModal() {
    const closeModalButton = document.getElementById('closeModal');
    closeModalButton.parentElement.parentElement.classList.toggle('showModal')
}


function doSetupIcons() {
    document.getElementById('tableRefreshSVG').innerHTML = SVGS.refreshBTN;
    document.getElementById('preloader-insert').innerHTML = SVGS.preloaderSVG;

    const arrowSVGS = document.getElementsByClassName('table-arrow-svg');
    Array.from(arrowSVGS).forEach((element, index) =>
    {
        element.innerHTML = SVGS.arrowBTN;

        element.children[0].onclick = () => {
            sortBy(element.children[0], index)
        };

        element.children[0].setAttribute('sorting-order', 'ASC');
        element.children[0].id = String(index);
    });
}

function sortBy(arrowSVG, typeOfSort) {
    if(!entries) return;

    arrowSVG.setAttribute('sorting-order', (arrowSVG.getAttribute('sorting-order') === 'ASC') ? 'DESC' : 'ASC');
    arrowSVG.classList.toggle('desc');

    const currentSortOrder = arrowSVG.getAttribute('sorting-order');

    if(SortBY.lastSortingOrderItem && SortBY.lastSortingOrderItem.id !== arrowSVG.id) {
        SortBY.lastSortingOrderItem.classList.remove('desc');
        SortBY.lastSortingOrderItem.setAttribute('sorting-oder', 'ASC');
    }

    let sortBY;
    switch (typeOfSort) {
        case 0: { // Sort by name
            sortBY = 'name';
            break;
        }
        case 1: { // Sort by name
            sortBY = 'email';
            break;
        }
        case 2: { // Sort by name
            sortBY = 'id';
            break;
        }
        case 3: { // Sort by name
            sortBY = 'score';
            break;
        }
        default: {
            sortBY = null;
            break;
        }
    }

    if(entries.length > 0) {
        const tmpSortedEntries = entries.sort((elemA, elemB) => {
            if(currentSortOrder === 'DESC') {
                if(elemA[sortBY] < elemB[sortBY]) return 1;
                else return -1;
            } else if(currentSortOrder === 'ASC') {
                if(elemA[sortBY] > elemB[sortBY]) return 1;
                else return -1;
            }
        });

        doClearEntriesTable();
        doReloadAllEntries(tmpSortedEntries);
    }

    SortBY.lastSortingOrderItem = arrowSVG;
}

function getAllEntries() {
    doShowPreloader();
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
                    entries = [...data];
                    data.forEach((entry) => {
                        addNewEntryToHTML(entry);
                    });
                    doHidePreloader()
                }
            }).catch(e => console.log(e));
        })
        .catch(e => {
            console.log(e);
            entries = [];
        });
}

function updateUser(userInfo) {
    fetch(`https://smackfly-2fd1.restdb.io/rest/users-fly-smacker/${userInfo._id}`, {
        method: "put",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": "5de40f274658275ac9dc2152",
            "cache-control": "no-cache",
            // "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(userInfo),
        //mode: "no-cors",
    })
        .then(e => {
            console.log('User updated')
        })
        .catch(e => {
            console.log(e);
        });
}

function deleteUser(userInfo) {
    fetch(`https://smackfly-2fd1.restdb.io/rest/users-fly-smacker/${userInfo._id}`, {
        method: "delete",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": "5de40f274658275ac9dc2152",
            "cache-control": "no-cache",
            // "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(userInfo),
        //mode: "no-cors",
    })
        .then(e => {
            doClearEntriesTable();
            getAllEntries();
            doCloseUserRemoveModal();
        })
        .catch(e => {
            console.log(e);
        });
}


function doToggleUserState(userInfo, checkbox) {
    checkbox.checked = !!checkbox.checked;
    userInfo.edit = !!checkbox.checked;

    checkbox.parentElement.children[2].textContent = checkbox.checked ? 'Disabled' : 'Active';

    updateUser(userInfo);
}
function addNewEntryToHTML(entry) {
    const entryTemplate = document.getElementById('entryTemplate');
    const newEntryTemplate = entryTemplate.content.cloneNode(true);
    const toggle = newEntryTemplate.firstElementChild.children[4].children[0].children[0];
    const deleteButton = newEntryTemplate.firstElementChild.children[5].children[0];
    newEntryTemplate.firstElementChild.children[0].textContent = entry.name;
    newEntryTemplate.firstElementChild.children[1].textContent = entry.email;
    newEntryTemplate.firstElementChild.children[2].textContent = entry.id;
    newEntryTemplate.firstElementChild.children[3].textContent = entry.score;
    toggle.checked = entry.edit;

    toggle.onclick = () => {
        doToggleUserState(entry, toggle)
    };

    newEntryTemplate.firstElementChild.children[4].children[0].children[2].textContent = entry.edit ? 'Disabled' : 'Active';

    deleteButton.innerHTML = SVGS.trashbinSVG;
    deleteButton.onclick = () => {
        doShowUserRemoveModal(entry);
        // TODO; Ask the user if he's sure he wants to delete the entry then if answer is yes call deleteUser
        // deleteUser(entry);
    };

    document.getElementById('entriesContainer').appendChild(newEntryTemplate);
}

// function doShowRemoveModal() {
//     const modalTemplate = document.getElementById('modalRemoveUserTemplate');
//     const newModalTemplate = modalTemplate.content.cloneNode(true);
//
//     document.getElementById('entriesContainer').appendChild(newModalTemplate);
//
// }

function doClearEntriesTable() {
    const parent = document.getElementById('entriesContainer');
    while (parent.firstChild) {
        parent.firstChild.remove();
    }
}

function doReloadAllEntries(newArray) {
    if(newArray.length) {
        newArray.forEach(entry => addNewEntryToHTML(entry));
    }
}

function doShowPreloader() {
    preloader = document.getElementById('preloaderSVG');
    preloader.style.visibility = 'visible';
}

function doHidePreloader() {
    preloader.style.visibility = 'hidden';
}

document.body.onload = doStart;