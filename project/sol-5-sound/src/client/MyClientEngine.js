import Howler from 'howler'; // eslint-disable-line no-unused-vars
import ClientEngine from 'lance/ClientEngine';
import MyRenderer from '../client/MyRenderer';
import KeyboardControls from 'lance/controls/KeyboardControls';

export default class MyClientEngine extends ClientEngine {

    constructor(gameEngine, options) {
        super(gameEngine, options, MyRenderer);

        this.controls = new KeyboardControls(this);
        this.controls.bindKey('up', 'up', { repeat: true } );
        this.controls.bindKey('down', 'down', { repeat: true } );
        this.controls.bindKey('left', 'left', { repeat: true });
        this.controls.bindKey('right', 'right', { repeat: true });
        this.controls.bindKey('space', 'space');
    }

    start() {
        super.start();

        // handle sounds
        this.sounds = {
            ballHitWall: new Howl({ src: ['assets/audio/ballHitWall.wav'] }),
            ballHitPaddle: new Howl({ src: ['assets/audio/ballHitPaddle.wav'] }),
            scored: new Howl({ src: ['assets/audio/scored.wav'] }),
            firedBullet: new Howl({ src: ['assets/audio/firedBullet.wav'] }),
            bulletHitPaddle: new Howl({ src: ['assets/audio/bulletHitPaddle.wav'] })
        };

        this.gameEngine.on('ballHitWall', () => {
            this.sounds.ballHitWall.play();
        });
        this.gameEngine.on('ballHitPaddle', () => {
            this.sounds.ballHitPaddle.play();
        });
        this.gameEngine.on('scored', () => {
            this.sounds.scored.play();
        });
        this.gameEngine.on('firedBullet', () => {
            this.sounds.firedBullet.play();
        });
        this.gameEngine.on('bulletHitPaddle', () => {
            this.sounds.bulletHitPaddle.play();
        });
    }

}
