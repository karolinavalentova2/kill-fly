"use strict";

let entries = [];
let SVGS = {};
let SortBY = {
    lastSortingOrderItem: null,
    lastSortingMethod: 'ASC',
};
let preloader;
let filterButtons;

async function doStart() {
    try {
        await loadSVG();
        doSetupIcons();
        getAllEntries();
        doRegisterFilterButtons();
        doRegisterRefreshBtn();
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
    modalBody.children[2].children[1].firstElementChild.children[0].textContent = `${ id }`;
    modalBody.children[2].children[1].firstElementChild.children[1].textContent = `${name ? name : 'N/A'}`;
    modalBody.children[2].children[1].firstElementChild.children[2].textContent = `${email ? email : 'N/A'}`;
    modalBody.children[2].children[1].firstElementChild.children[3].textContent = `${score ? score : 'N/A'}`;

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

function doShowFilteredEntries(filterBy) {

    Array.from(filterButtons).forEach( (button) => {
        button.children[1].classList.remove('active-filter-btn');
    });

    const filterCondition = (filterBy.textContent === 'Disabled');
    const filteredUsers = entries.filter(entry => {
        if(entry.edit === filterCondition) return entry;
    });

    doClearEntriesTable();
    doReloadAllEntries(filteredUsers);

    filterBy.classList.add('active-filter-btn')
}

function doRegisterFilterButtons() {
    filterButtons = document.getElementsByClassName('filterButton');
    Array.from(filterButtons).forEach( (button) => {
        button.onclick = () => {
            doShowFilteredEntries(button.children[1]);
        }
    });
}

function doRegisterRefreshBtn() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.onclick = () => {
        doClearEntriesTable();
        getAllEntries();
    }
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
                    data.forEach((entry) => {
                        entries.push(sanitizeData(entry))
                    });
                    entries.forEach((entry) => {
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
    doShowPreloader();
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
            console.log('User updated');
            doHidePreloader();
        })
        .catch(e => {
            console.log(e);
        });
}

function deleteUser(userInfo) {
    doShowPreloader();
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
            doHidePreloader();
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
    newEntryTemplate.firstElementChild.children[0].textContent = entry.id;
    newEntryTemplate.firstElementChild.children[1].textContent = entry.name;
    newEntryTemplate.firstElementChild.children[2].textContent = entry.email;
    newEntryTemplate.firstElementChild.children[3].textContent = entry.score;
    toggle.checked = entry.edit;

    toggle.onclick = () => {
        doToggleUserState(entry, toggle)
    };

    newEntryTemplate.firstElementChild.children[4].children[0].children[2].textContent = entry.edit ? 'Disabled' : 'Active';

    deleteButton.innerHTML = SVGS.trashbinSVG;

    deleteButton.onclick = () => {
        if(entry.edit !== false) {
            doShowUserRemoveModal(entry);
        }
        else {
            doShowUserDeleteErrorToast();
        }
    };

    document.getElementById('entriesContainer').appendChild(newEntryTemplate);
}

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
    const background = document.getElementById('preloader-container');
    preloader = document.getElementById('preloaderSVG');
    preloader.style.visibility = 'visible';
    background.style.zIndex = '1';
}

function doHidePreloader() {
    const background = document.getElementById('preloader-container');
    preloader.style.visibility = 'hidden';
    background.style.zIndex = '-1';
}

function doShowUserDeleteErrorToast() {
    // source: https://www.npmjs.com/package/toastr
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    toastr["error"]("Only disabled user can be deleted");
}

function sanitizeData(entry){
    if(!entry.edit) {
        entry.edit = false;
        updateUser(entry);
        console.log('Status fixed on ', entry.email);
    }
    if(!entry.password || entry.password.length === 0) {
        entry.password = Math.floor(Math.random() * 1000000);
        updateUser(entry);
        console.log('Password fixed on ', entry.email);
    }

    return entry;

}

document.body.onload = doStart;