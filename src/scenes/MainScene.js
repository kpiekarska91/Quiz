import "../../public/style.css";
import Phaser from "phaser";
import _ from "lodash";
import {apiUrl, isLocalEnvironment, convertMinutesSeconds} from "../main.js";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({key: 'MainScene'});
    }

    reset() {
        this.level = 1;
        this.levelTime = [15, 10, 5];
        this.levelCountAnswer = [50, 50, 50];
        // this.levelCountAnswer = [3, 3, 3];
        this.color = ['#5700dc', '#d30fbc', '#f6004b'];
        this.questionNumber = 0;
        this.lifesLosts = 0;
        this.points = 0;
        this.numerQuestion = 0;
        this.countAnswers = 0;
        this.timer = 0;
        this.timerQuestion = 0;
        this.timeText = 0;
        this.timeAllText = 0;
        this.musicRate = [1, 1.1, 1.2];
        this.addPoints = 0;
        this.freeze = false;
        this.icon = null;
        this.circleGraphics = null;
        this.maxLvl = 3;
        this.rect = [];
    }

    preload() {
        this.reset();
        let preloadScene = this.scene.get('PreloadScene');
        this.stringsLanguage = preloadScene.stringsLanguage;
        this.quizData = preloadScene.quizData;
        const groupedByLevel = _.groupBy(this.quizData, 'level');
        this.createdObjects = [];
        this.quizQuestions = _.mapValues(groupedByLevel, (questions, level) => {
            const count = this.levelCountAnswer[level - 1];
            return _.sampleSize(questions, count);
        });
        this.countAnswers = this.calculateTotalQuestions();


        if (!this.anims.exists('tick_lvl_1'))
            this.anims.create({
                key: 'tick_lvl_1',
                frames: this.anims.generateFrameNumbers('clock_level_1', {start: 0, end: 15}),
                frameRate: 1,
                repeat: 0
            });

        if (!this.anims.exists('tick_lvl_2'))
            this.anims.create({
                key: 'tick_lvl_2',
                frames: this.anims.generateFrameNumbers('clock_level_2', {start: 0, end: 15}),
                frameRate: 1.5,
                repeat: 0
            });

        if (!this.anims.exists('tick_lvl_3'))
            this.anims.create({
                key: 'tick_lvl_3',
                frames: this.anims.generateFrameNumbers('clock_level_3', {start: 0, end: 15}),
                frameRate: 3,
                repeat: 0
            });


        this.bgSound = this.sound.add('bgSound');
        this.bgSound.setRate(this.musicRate[this.level - 1]);
        this.bgSound.play();
        this.bgSound.setVolume(0.4);
        this.bgSound.setLoop(true);
        this.successSound = this.sound.add('successSound');
        this.wrongSound = this.sound.add('wrongSound');
    }

    calculateTotalQuestions() {
        let totalQuestions = 0;
        for (let level in this.quizQuestions) {
            if (this.quizQuestions.hasOwnProperty(level)) {
                totalQuestions += this.quizQuestions[level].length;
            }
        }
        return totalQuestions;
    }

    changeBackground() {
        let backgroundKey = `main_bg_level_${this.level}`;
        if (this.background) {
            this.background.destroy(); // Usuń poprzednie tło
        }
        this.background = this.physics.add.image(0, 0, backgroundKey).setOrigin(0, 0);
        this.background.displayWidth = this.game.config.width;
        this.background.displayHeight = this.game.config.height;

        this.drawPointsBoard();
    }

    create() {

        this.createLoadBoard();

    }

    update() {

    }

    createLoadBoard() {
        this.width = this.game.config.width;
        this.height = this.game.config.height;
        this.background = this.physics.add.image(0, 0, 'bg_load_level_' + this.level).setOrigin(0, 0);
        this.background.displayWidth = this.game.config.width;
        this.background.displayHeight = this.game.config.height;

        this.startCountdown();
    }

    startCountdown() {
        let countdown = 3;

        const countdownText = this.add.text(this.width / 2, this.height / 2 - this.height / 10, '3', {
            font: 'bold ' + this.game.scale.gameSize.width / 1.3 + 'px Gotham',
            fill: '#000000'
        }).setAlpha(.2).setOrigin(0.5, 0.5);

        this.add.text(this.width / 2, this.height / 2 - this.height / 8, this.stringsLanguage.load_title + ' ' + this.level, {
            font: 'bold ' + this.game.scale.gameSize.width / 7 + 'px Gotham',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);
        this.add.text(this.width / 2, this.height / 2,  this.stringsLanguage.load_subtitle, {
            font: '100 ' + this.game.scale.gameSize.width / 22 + 'px Montserrat',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);


        this.time.addEvent({
            delay: 1000,
            callback: () => {
                countdown--;
                if (countdown > 0) {
                    countdownText.setText(countdown);
                } else {
                    countdownText.destroy();
                    this.startGame();
                }
            },
            repeat: 2
        });
    }

    startGame() {

        this.width = this.game.config.width;
        this.height = this.game.config.height;
        this.background = this.physics.add.image(0, 0, 'main_bg_level_1').setOrigin(0, 0);
        this.background.displayWidth = this.game.config.width;
        this.background.displayHeight = this.game.config.height;


        this.drawPointsBoard();
        this.createTimer();
        this.drawAnswerBoard();

        this.timerSprite = this.add.sprite(this.timeText.x, this.timeText.y - this.timeText.height / 5.5, 'timer').setScale(0.5).play('tick_lvl_' + this.level);
    }

    drawPointsBoard() {
        let posY = this.height / 14;
        this.timeAllText = this.add.text(this.width - this.width / 30, posY, convertMinutesSeconds(this.timer), {
            font: 'bold ' + this.game.scale.gameSize.width / 19 + 'px Gotham',
            fill: '#000000'
        }).setOrigin(1, 1);

        this.timeIcon = this.add.image(this.width - this.width / 20 - this.timeAllText.displayWidth, posY - posY / 12, 'time').setOrigin(1, 1);
        this.timeIcon.displayHeight = this.width / 23;
        this.timeIcon.scaleX = this.timeIcon.scaleY;

        this.pointsAllText = this.add.text(this.width / 30, posY, this.points, {
            font: 'bold ' + this.game.scale.gameSize.width / 19 + 'px Gotham',
            fill: '#000000'
        }).setOrigin(0, 1);

        this.pointsAllTextPart2 = this.add.text(this.pointsAllText.displayWidth + this.width / 20, posY, 'pkt', {
            font: '300 ' + this.game.scale.gameSize.width / 26 + 'px Gotham',
            fill: '#000000'
        }).setOrigin(0, 1);

        this.logo = this.add.image(this.width / 20, this.height - posY, 'logo').setOrigin(0, 1);
        this.logo.displayHeight = this.width / 10;
        this.logo.scaleX = this.logo.scaleY;
    }

    createTimer() {
        if (!this.timerEvent) {
            this.timerEvent = this.time.addEvent({
                delay: 10,
                callback: this.generalCounter,
                callbackScope: this,
                loop: true,
            });
        }
    }

    createTimerQuestion() {
        if (this.timerQuestionEvent)
            this.timerQuestionEvent.remove(false);

        this.timerQuestion = this.levelTime[this.level - 1] ?? 15;

        this.timerQuestionEvent = this.time.addEvent({
            delay: 1000,
            callback: this.timerQuestionCounter,
            callbackScope: this,
            loop: true,
        });

        let color = this.color[this.level - 1];

        this.timeText = this.add.text(this.width - this.width / 5, this.height / 3, this.timerQuestion ?? 15, {
            font: '300 ' + this.game.scale.gameSize.width / 11 + 'px Gotham',
            fill: color
        }).setOrigin(0.5, 0.5);


    }

    generalCounter() {
        this.timer++;
        this.timeAllText.setText(convertMinutesSeconds(this.timer));
    }

    timerQuestionCounter() {
        this.timerQuestion--;
        this.timeText.setText(this.timerQuestion);
        if (this.timerQuestion <= 0) {
            this.gameOver();
        }
    }


    drawAnswerBoard() {
        this.randomizeCorrectAnswer()
        let color = this.color[this.level - 1];
        this.clearAnswerBoard();

        let numberOfQuestion = this.numerQuestion + 1;
        let pointsBoard = this.add.text(this.width / 17, this.height / 4, numberOfQuestion <= 9 ? '0' + numberOfQuestion : numberOfQuestion, {
            font: '100 ' + this.width / 9 + 'px Gotham',
            fill: '#000'
        }).setOrigin(0, 1);
        this.createdObjects.push(pointsBoard);

        let pointsBoardPart2 = this.add.text(this.width / 17 + pointsBoard.displayWidth, this.height / 4.2, '/' + this.countAnswers, {
            font: '100 ' + this.width / 16 + 'px Gotham',
            fill: '#000'
        }).setOrigin(0, 1);
        this.createdObjects.push(pointsBoardPart2);


        const question = this.add.text(0, 0, this.quizQuestions[this.level][this.questionNumber]['question'], {
            font: 'bold ' + this.width / 22 + 'px Gotham',
            fill: color,
            wordWrap: { width: this.width / 1.55 }
        });

        const startY = this.height / 4;
        const endY = this.height / 2;
        const textHeight = question.height;

        const middleY = startY + (endY - startY - textHeight) / 2;

        question.setPosition(this.width / 17, middleY);

        this.createdObjects.push(question);

        const answers = this.quizQuestions[this.level][this.questionNumber]['answers'];

        let yOffset = 0;
        answers.forEach((answer, index) => {
            let isCorrect = index ==  this.quizQuestions[this.level][this.questionNumber]['correct_answer']
            let answerObj = this.createAnswer(answer, index, yOffset);
            // let answerObj = this.createAnswer(answer + ' ' + isCorrect, index, yOffset);
            this.createdObjects.push(answerObj);
            yOffset = yOffset + this.height / 10;
        });

        this.createTimerQuestion();
    }

    randomizeCorrectAnswer() {
        const currentQuestion = this.quizQuestions[this.level][this.questionNumber];
        const shuffledAnswers = _.shuffle(currentQuestion.answers);
        const newCorrectAnswerIndex = shuffledAnswers.indexOf(currentQuestion.answers[currentQuestion.correct_answer]);
        this.quizQuestions[this.level][this.questionNumber].answers = shuffledAnswers;
        this.quizQuestions[this.level][this.questionNumber]['correct_answer'] = newCorrectAnswerIndex;
    }

    createAnswer(text, index, yOffset) {
        let color = this.color[this.level - 1];

        const width = this.width;
        const shadowOffsetX = 5;
        const shadowOffsetY = 5;
        const shadowColor = 0x000000;

        const graphics = this.add.graphics();
        graphics.fillStyle(shadowColor, 0.01);
        graphics.fillRoundedRect(
            width / 2 - (width * 0.82) / 2 + shadowOffsetX,
            this.height / 2.1 + yOffset + shadowOffsetY,
            width * 0.82,
            this.height / 14,
            10
        );

        graphics.generateTexture('shadowTexture', width, this.height);

        this.rect[index] = this.add.rectangle(
            width / 2,
            this.height / 2 + yOffset,
            width * 0.82,
            this.height / 12,
            0xffffff
        )
            .setOrigin(0.5, 0)
            .setInteractive()
            .on('pointerdown', () => this.checkAnswer(text, index, this.rect[index]))
            .on('pointerover', () => {
                if (!this.freeze && this.rect[index]) this.rect[index].setFillStyle(0xCCCCCC)
            })
            .on('pointerout', () => {
                if (!this.freeze && this.rect[index]) this.rect[index].setFillStyle(0xffffff)
            });

        let rect = this.rect[index];
        let numeration = ['A', 'B', 'C', 'D'];
        let questionNumber = this.add.text(this.width / 8, rect.y + this.height / 44.5, numeration[index], {
            font: `500 ${width / 38}px Montserrat`,
            fill: color
        }).setOrigin(0);

        let question = this.add.text(this.width / 6, rect.y + this.height / 44.5, text, {
            font: `500 ${width / 38}px Montserrat`,
            fill: '#000000'
        }).setOrigin(0);

        this.createdObjects.push(graphics);
        this.createdObjects.push(questionNumber);
        this.createdObjects.push(question);

        return rect;
    }

    checkAnswer(text, index, rect) {
        if (this.freeze)
            return;

        this.freeze = true;
        this.timerQuestionEvent.remove(false);
        this.timerSprite.anims.pause();

        let indexCorrect = this.quizQuestions[this.level][this.questionNumber].correct_answer
        if (indexCorrect == index) {
            this.points++;
            this.numerQuestion++;
            this.addPoints += this.timerQuestion;
            this.points+= this.addPoints;
            this.addPoints = 0;
            this.successSound.play()
            this.pointsAllText.setText(this.points)
            this.pointsAllTextPart2.setPosition(this.pointsAllText.displayWidth + this.width / 20,  this.height / 14)
            this.flashAnswer(rect, true, 0x39b549, () => {
                this.timerSprite.anims.stop();
                this.timerSprite.setFrame(0);
                this.timerSprite.anims.restart();
                this.freeze = false;
                this.nextQuestion();
            });
        } else {
            this.wrongSound.play()
            this.timerEvent.remove(false);
            this.timerEvent = null;
            this.flashAnswer(this.rect[indexCorrect], true, 0x39b549, () => {
            });
            this.flashAnswer(rect, false, 0xed2325, () => {
                this.gameOver(index);
            });
        }
    }

    nextQuestion() {
        this.rect = [];
        if (this.levelCountAnswer[this.level - 1] == this.questionNumber + 1) {
            if (this.maxLvl == this.level)
                this.gameOver();
            else {
                this.questionNumber = 0;
                this.level++;
                this.bgSound.setRate(this.musicRate[this.level - 1]);
                this.createLoadBoard();
                // this.changeBackground();
                // this.timerSprite = this.add.sprite(this.timeText.x, this.timeText.y - this.timeText.height / 5.5, 'timer').setScale(0.5).play('tick_lvl_' + this.level);
            }

        } else {
            this.questionNumber++;
            this.drawAnswerBoard();
        }

        // this.drawAnswerBoard();
    }

    clearAnswerBoard() {
        this.createdObjects.forEach(obj => obj.destroy());
        this.createdObjects = [];
        if (this.timeText)
            this.timeText.destroy()
    }

    flashAnswer(rect, isCorrect, color, onComplete) {
        let iconKey = isCorrect ? 'icon_correct' : 'icon_incorrect';
        this.icon = this.add.image(rect.x + rect.width / 2 - rect.width / 20, rect.y + rect.height / 2, iconKey).setOrigin(0.5, 0.5).setDisplaySize(rect.height / 2, rect.height / 2);

        rect.setFillStyle(color);

        this.time.delayedCall(1500, () => {
            this.icon.destroy();

            if (onComplete) {
                onComplete();
            }
        });
        // this.tweens.add({
        //     targets: rect,
        //     alpha: {from: 1, to: 0},
        //     ease: 'Linear',
        //     duration: 250,
        //     repeat: 2,
        //     yoyo: true,
        //     onComplete: () => {
        //         if (onComplete) {
        //             this.icon.destroy();
        //             onComplete();
        //         }
        //     }
        // });
        //
        // rect.setFillStyle(color);

    }

    gameOver(index) {
        this.bgSound.stop();
            this.setScore()
    }


    setScore() {
        let url = apiUrl + 'score/' + window.user_id + '/' + this.points + '/' + this.timer;

        fetch(url)
            .then(value => {
                that.goToEndScene();
            })
            .catch(error => {
                console.error('Błąd podczas wywoływania API:', error);
            });
    }

    goToEndScene() {
        this.scene.start('EndScene', {score: this.points, time: this.timer, endGame: true});
    }


}
