import "../public/style.css";
import Phaser from "phaser";
import PreloadScene from "./scenes/PreloadScene.js";
import MenuScene from "./scenes/MenuScene.js";
import InstructionScene from "./scenes/InstructionScene.js";
import MainScene from "./scenes/MainScene.js";
import EndScene from "./scenes/EndScene.js";

const apiUrl = "http://test.d/api/";


let screenWidth = window.innerWidth;
//if landscape get width to height
if (isLandscape())
    screenWidth = window.innerHeight * window.devicePixelRatio
const gameWidth = window.innerHeight < 688 ? screenWidth : 688;

const config = {
    type: Phaser.CANVAS,
    parent: 'fruitNinja',
    pixelArt: false,
    resolution: 3,
    width: gameWidth,
    height: gameWidth,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
    scene: [PreloadScene, MenuScene, InstructionScene, MainScene, EndScene],
};


// Initial game
const game = new Phaser.Game(config);
export {apiUrl, game};

/**
 * Refresh
 */
function resizedw() {
    window.location.reload();
}

/**
 * Refresh if resize screen (scale is turn off)
 */
let resizeTimer;
window.onresize = function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizedw, 100);
};


/**
 * Check if screen landscape
 * @returns {boolean}
 */
function isLandscape() {
    return (window.orientation === 90 || window.orientation === -90);
}


/**
 * Timer show
 * @param s
 * @returns {string}
 */
export function convertMinutesSeconds(seconds, showMinutesFirst = false) {
    let minutes = Math.floor(seconds / 6000);
    let remainingSeconds = Math.floor((seconds % 6000) / 100);
    let hundredths = String(seconds % 100).padStart(2, '0');

    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(remainingSeconds).padStart(2, '0');

    if (showMinutesFirst) {
        return `${formattedMinutes}:${formattedSeconds}.${hundredths}`;
    } else {
        return `${formattedMinutes}:${formattedSeconds}`;
    }
}

