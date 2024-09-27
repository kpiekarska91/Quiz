import "../../public/style.css";
import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
     }

    create() {

        let preloadScene = this.scene.get('PreloadScene');
        let currentLanguage = preloadScene.currentLanguage;
        let stringsLanguage = preloadScene.stringsLanguage;

        const {width, height} = this.game.config;

        this.background = this.physics.add.image(0, 0, 'background-menu').setOrigin(0, 0);
        this.background.displayWidth = width;
        this.background.displayHeight = height;

        const buttonInstruction = this.createButton(stringsLanguage.btnRules, 'InstructionScene', 0);

        const buttonStart = this.createButton(stringsLanguage.btnPlay, 'MainScene', buttonInstruction.height / 2.5, 'menu_btn_black', '#ffffff');

    }

    createButton(text, sceneName, yOffset, pattern = 'menu_btn', color = '#000000') {
        const {width, height} = this.game.config;

        // Tworzenie obrazu przycisku
        const button = this.add.image(width / 2, height / 1.6 + yOffset, pattern)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on("pointerdown", () => this.goToScene(sceneName))
            .on('pointerover', () => this.onButtonHover(button, buttonText))
            .on('pointerout', () => this.onButtonOut(button, buttonText));

        button.displayWidth = width / 2.2;
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

    goToScene(scene) {
        this.scene.start(scene);
    }
}
