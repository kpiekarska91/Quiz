import "../../public/style.css";
import Phaser from "phaser";
import {apiUrl, game} from '../main.js';
import axios from 'axios';
import CryptoJS from 'crypto-js';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.image('main_bg_level_1', 'assets/bg/main_bg_level_1.jpg');
        this.load.image('main_bg_level_2', 'assets/bg/main_bg_level_2.jpg');
        this.load.image('main_bg_level_3', 'assets/bg/main_bg_level_3.jpg');

        this.load.image('bg_load_level_1', 'assets/bg/bg_load_level_1.jpg');
        this.load.image('bg_load_level_2', 'assets/bg/bg_load_level_2.jpg');
        this.load.image('bg_load_level_3', 'assets/bg/bg_load_level_3.jpg');

        this.load.image('instruction_bg', 'assets/bg/instruction_bg.jpg');
        this.load.image('background-menu', 'assets/bg/menu_bg.jpg');
        this.load.image("menu_btn", "assets/btn/menu_bg.png");
        this.load.image("menu_btn_black", "assets/btn/menu_bg_black.png");
        this.load.image("time", "assets/elements/time.png");
        this.load.image("logo", "assets/elements/logo.png");

        this.load.image("icon_correct", "assets/elements/icon_correct.png");
        this.load.image("icon_incorrect", "assets/elements/icon_incorrect.png");
        this.load.image('instruction-icon', 'assets/instruction/icon.png');


        this.load.audio('wrongSound', ['assets/music/wrong.mp3']);
        this.load.audio('successSound', ['assets/music/success.mp3']);
        this.load.audio('bgSound', ['assets/music/bg.mp3']);

        this.load.spritesheet('clock_level_1', 'assets/elements/clock_level_1.png', {
            frameWidth: 284,
            frameHeight: 320
        });
        this.load.spritesheet('clock_level_2', 'assets/elements/clock_level_2.png', {
            frameWidth: 284,
            frameHeight: 320
        });
        this.load.spritesheet('clock_level_3', 'assets/elements/clock_level_3.png', {
            frameWidth: 284,
            frameHeight: 320
        });

        this.load.json('config', './config.json');

        this.load.text('encryptedQuizData', './encrypted-quiz-data.json');
    }

    /**
     * Create the game objects (images, groups, sprites and animations).
     */
    create() {
        let configData = this.cache.json.get('config');
        this.currentLanguage = configData.language;
        if (configData.languages[this.currentLanguage]) {
            this.stringsLanguage = configData.languages[this.currentLanguage];
        } else {
            this.stringsLanguage = configData.languages['en'];
        }


        const encryptedData = this.cache.text.get('encryptedQuizData');
        const bytes = CryptoJS.AES.decrypt(encryptedData, 'secret-key');
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        this.quizData = JSON.parse(decryptedData);


        const {width, height} = this.game.config;

        this.add.text(0, 0, 0, {
            font: '100 ' + this.game.scale.gameSize.width / 14 + 'px Gotham',
            fill: '#000000'
        }).setAlpha(0)
        this.add.text(0, 0, 0, {
            font: '300 ' + this.game.scale.gameSize.width / 14 + 'px Gotham',
            fill: '#000000'
        }).setAlpha(0)
        this.add.text(0, 0, 0, {
            font: 'bold ' + this.game.scale.gameSize.width / 14 + 'px Gotham',
            fill: '#000000'
        }).setAlpha(0)
        this.add.text(0, 0, 0, {
            font: '500 ' + this.game.scale.gameSize.width / 14 + 'px Montserrat',
            fill: '#000000'
        }).setAlpha(0)
        this.add.text(0, 0, 0, {
            font: '100 ' + this.game.scale.gameSize.width / 14 + 'px Montserrat',
            fill: '#000000'
        }).setAlpha(0)
        this.add.text(0, 0, 0, {
            font: '700 ' + this.game.scale.gameSize.width / 14 + 'px Montserrat',
            fill: '#000000'
        }).setAlpha(0)
        this.callInitApi();

    }

    callInitApiLocal() {
        let urlObject = new URL(window.location.href);
        let userId = urlObject.searchParams.get('id');
        let initUrl = apiUrl + 'init/' + userId;

        axios.get(initUrl)
            .then(response => {
                const value = response.data;
                window.user_id = value.user._id;
                game.scene.start('MenuScene');
            })
            .catch(error => {
                console.error('Błąd podczas wywoływania API:', error);
            });
    }

    callInitApiProduction() {
        jticonnexus.init()
            .then(function (value) {
                console.log(value)
                if (typeof value.user != "undefined") {
                    window.user_id = value.user._id;
                    game.scene.start('MenuScene');
                } else {
                    console.error('Błąd podczas wywoływania API:', value);
                    return;
                }
            })
            .catch(function (e) {
                console.log('e', e);
            });
    }

    callInitApi() {
        this.callInitApiLocal();

    }

}
