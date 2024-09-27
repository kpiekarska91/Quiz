import Phaser from "phaser";
import {apiUrl, convertMinutesSeconds} from '../main.js';
import axios from 'axios';
import _ from 'lodash';

export default class EndScene extends Phaser.Scene {
    constructor() {
        super('EndScene');
        this.sortedTop;
        this.uniqueUserIds;
        this.userPlace = 0;
        this.currentPage = 1;
        this.resultsPerPage = 10;
        this.allResults = [];
    }

    init(data) {
        this.score = data.score;
        this.timer = data.time;
        this.endGame = data.endGame;
    }

    preload() {
    }

    createElements() {
        let preloadScene = this.scene.get('PreloadScene');
        let currentLanguage = preloadScene.currentLanguage;
        let stringsLanguage = preloadScene.stringsLanguage;

        const {width, height} = this.game.config;

        this.background = this.physics.add.image(0, 0, 'instruction_bg').setOrigin(0, 0);
        this.background.displayWidth = this.game.config.width;
        this.background.displayHeight = this.game.config.height;

        this.circle = this.add.graphics();
        this.circle.fillStyle(0x000000, 1);
        this.circle.fillCircle(width / 2, height / 5, width / 7.5);

        let titleText = stringsLanguage.ranking_title;
        let textPoints = this.add.text(width / 2, height / 5 - height / 13, titleText, {
            font: '300 ' + width / 32 + 'px Gotham',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5).setAlign('center');
        let letterSpacing = .4;
        let spacedText = '';
        for (let i = 0; i < titleText.length; i++) {
            spacedText += titleText[i];
            if (i !== titleText.length - 1) {
                spacedText += ' '.repeat(letterSpacing);
            }
        }
        textPoints.setText(spacedText);
        textPoints.setOrigin(0.5, 0.5).setAlign('center');

        let fontSizeScore= width / 8;
        if(this.score > 999)
            fontSizeScore = width / 14;

        this.add.text(width / 2, height / 5 , this.score, {
            font: 'bold ' + fontSizeScore + 'px Gotham',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5).setAlign('center');
        //
        let titleScoreText = stringsLanguage.ranking_time;

        let textScore=  this.add.text(width / 2 - width / 40, height / 5 + height / 11.5, titleScoreText, {
            font: '300 ' + width / 32 + 'px Gotham',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5).setAlign('center');

        spacedText = '';
        for (let i = 0; i < titleScoreText.length; i++) {
            spacedText += titleScoreText[i];
            if (i !== titleScoreText.length - 1) {
                spacedText += ' '.repeat(letterSpacing);
            }
        }
        textScore.setText(spacedText);
        textScore.setOrigin(0.5, 0.5).setAlign('center');


        let rectX = textScore.x + textScore.displayWidth / 2 + textScore.displayWidth / 10;
        let rectY = height / 5 + height / 11.5 - height / 40 ;

        this.rectangle = this.add.graphics();
        this.rectangle.fillStyle(0xffffff, 1);
        this.rectangle.fillRect(rectX, rectY, width / 5, height / 20);

        this.add.text(rectX + width / 10, rectY + height / 40, convertMinutesSeconds(this.timer, true), {
            font: '300 ' + width / 25 + 'px Gotham',
            fill: '#000000'
        }).setOrigin(0.5, 0.5).setAlign('center');

        this.add.text(
            this.game.scale.gameSize.width / 2,
            this.game.scale.gameSize.height / 2,
            stringsLanguage.ranking,
            {
                font: '300 ' + width / 25 + 'px Gotham',
                fill: '#fff',
                lineSpacing: 10
            }
        ).setOrigin(0.5, 0.5).setAlign('center');

        const buttonStart = this.createButton(stringsLanguage.btnRestart, 'MenuScene', 0, 'menu_btn_black', '#ffffff');

        // const button = this.createButton(this.endGame ? stringsLanguage.btnRestart : stringsLanguage.btnPlay, 'zagraj_btn_v2', 'MainScene', width - width / 5, height - height / 17, width, height, 0);
        // const buttonMenu = this.createButton(stringsLanguage.btnMenu, 'menu_btn', 'MenuScene', width - button.displayWidth - width / 8.5, height - height / 17, width, height, 0);


    }

    createButton(text, sceneName, yOffset, pattern = 'menu_btn', color = '#000000') {
        const {width, height} = this.game.config;

        // Tworzenie obrazu przycisku
        const button = this.add.image(width / 2, height - height / 3.2 + yOffset, pattern)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on("pointerdown", () => this.goToScene(sceneName))
            .on('pointerover', () => this.onButtonHover(button, buttonText))
            .on('pointerout', () => this.onButtonOut(button, buttonText));

        button.displayWidth = width / 2.1;
        button.scaleY = button.scaleX;

        const buttonText = this.add.text(button.x, button.y - button.height / 40, text, {
            font: 'bold ' + width / 27 + 'px Gotham',
            fill: color,
        }).setOrigin(0.5, 0.5);

        button.buttonText = buttonText;
        return button;
    }

    onButtonHover(button, buttonText) {
        this.tweens.add({
            targets: button,
            scaleX: button.scaleX * 1.05,
            scaleY: button.scaleY * 1.05,
            duration: 200,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: buttonText,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 200,
            ease: 'Power2'
        });
    }


    onButtonOut(button, buttonText) {
        this.tweens.add({
            targets: button,
            scaleX: button.scaleX / 1.05,
            scaleY: button.scaleY / 1.05,
            duration: 200,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: buttonText,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2'
        });
    }
    create() {
        this.createElements()


    }

    // createButton = (text, texture, sceneName, x, y, width, height, offset = 0) => {
    //     const button = this.add.image(x, y, texture)
    //         .setOrigin(0.5, 0.5)
    //         .setDisplaySize(0, height / 13)
    //         .setInteractive()
    //         .on("pointerdown", () => this.goToScene(sceneName));
    //
    //     button.scaleX = button.scaleY;
    //
    //     this.add.text(button.x - offset, button.y, text, {
    //         font: width / 24 + 'px circularxxbold',
    //         fill: '#000000'
    //     }).setOrigin(0.5, 0.5);
    //
    //     return button;
    // };
    goToScene(scene) {
        this.scene.start(scene);
    }

}


