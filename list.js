"use strict";

async function doStart() {
    await loadSVG();
}

async function loadSVG() {
    try {
        const SVGS = {
            arrowBTN: await (await fetch("./assets/arrow.svg")).text(),
            resetBTN: await (await fetch("./assets/reset.svg")).text(),
        };

        document.getElementsByClassName('arrow-svg').innerHTML = SVGS.arrowBTN;
        document.getElementsByClassName('reset-svg').innerHTML = SVGS.resetBTN;

    } catch(error) {
        console.error('Cannot read svg file, reason: ' + error.message);
    }
}

document.body.onload = doStart;