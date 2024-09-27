import "../../public/style.css";
import Phaser from "phaser";

export default class InstructionScene extends Phaser.Scene {
    constructor() {
        super('InstructionScene');
    }

    preload() {
    }

    create() {

        let preloadScene = this.scene.get('PreloadScene');
        let currentLanguage = preloadScene.currentLanguage;
        let stringsLanguage = preloadScene.stringsLanguage;


        const {width, height} = this.game.config;

        // Tło
        this.background = this.add.image(0, 0, 'instruction_bg').setOrigin(0, 0);
        this.background.displayWidth = width;
        this.background.displayHeight = height;


        this.add.text(width / 2, height / 6.5, stringsLanguage.title, {
            font: '300 ' + width / 14 + 'px Gotham',
            fill: '#fff'
        }).setOrigin(0.5, 0.5);

        this.addInstructionText(width, height, stringsLanguage);

        const buttonStart = this.createButton(stringsLanguage.btnStart, 'MainScene', 0, 'menu_btn_black', '#ffffff');


    }

    isMobile() {
        const mobileRegex = /Android|webOS|iPhone`|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        return mobileRegex.test(navigator.userAgent);
    }

    goToScene(scene) {
        this.scene.start(scene);
    }


    createButton(text, sceneName, yOffset, pattern = 'menu_btn', color = '#000000') {
        const {width, height} = this.game.config;

        // Tworzenie obrazu przycisku
        const button = this.add.image(width / 2, height - height / 3.7 + yOffset, pattern)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on("pointerdown", () => this.goToScene(sceneName))
            .on('pointerover', () => this.onButtonHover(button, buttonText))
            .on('pointerout', () => this.onButtonOut(button, buttonText));

        button.displayWidth = width / 2.4;
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


    addInstructionText(width, height, stringsLanguage) {
        let fontSize = width / 37;
        let x = width / 5.3;
        let textSize = width / 1.2;
        let y = height / 4;
        let yOffset = height / 11;
        let imageOffset = height / 13;
        let texts = [
            stringsLanguage.rules_part_1 ?? '',
            stringsLanguage.rules_part_2 ?? '',
            stringsLanguage.rules_part_3 ?? '',
            stringsLanguage.rules_part_4 ?? '',
            stringsLanguage.rules_part_5 ?? ''
        ];

        texts.forEach((text, index) => {
            let currentY = y + index * yOffset;

            this.add.text(x, currentY, text, {
                font: '100 ' + fontSize + 'px Montserrat',
                fill: '#fff',
                wordWrap: {width: textSize, useAdvancedWrap: false},
                wrap: {mode: 'word'}
            }).setOrigin(0, 0).setAlign('left');

            this.instruction = this.add.image(x - imageOffset, currentY, 'instruction-icon').setOrigin(0, 0);
            this.instruction.displayHeight = imageOffset;
            this.instruction.scaleX = this.instruction.scaleY;
        });
    }
}
