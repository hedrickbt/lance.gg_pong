'use strict';

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import PlayerAvatar from './PlayerAvatar';
import TwoVector from 'lance/serialize/TwoVector';
import Paddle from './Paddle';
import Ball from './Ball';
import Bullet from './Bullet';
import ScoreBox from './ScoreBox';
const PADDING = 20;
const WIDTH = 400;
const HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 50;
const BULLET_HEIGHT = 5;
const BULLET_WIDTH = 5;

export default class MyGameEngine extends GameEngine {

    constructor(options) {
        super(options);
        this.physicsEngine = new SimplePhysicsEngine({ gameEngine: this });
    }

    registerClasses(serializer) {
        serializer.registerClass(Paddle);
        serializer.registerClass(Ball);
        serializer.registerClass(Bullet);
        serializer.registerClass(ScoreBox);
    }

    start() {

        super.start();

        this.on('postStep', () => { this.postStepHandler(); });
        this.on('objectAdded', (object) => {
            if (object.class === Ball) {
                this.ball = object;
            } else if ((object.class.name == 'Paddle') && (object.playerId === 1)) {
                this.paddle1 = object;
            } else if ((object.class.name == 'Paddle') && (object.playerId === 2)) {
                this.paddle2 = object;
            } else if ((object.class.name == 'Bullet') && (object.playerId === 1)) {
                this.bullet1 = object;
            } else if ((object.class.name == 'Bullet') && (object.playerId === 2)) {
                this.bullet2 = object;
            } else if ((object.class.name == 'ScoreBox') && (object.playerId === 1)) {
                this.scorebox1 = object;
            } else if ((object.class.name == 'ScoreBox') && (object.playerId === 2)) {
                this.scorebox2 = object;
            }
        });
    }

    processInput(inputData, playerId) {

        super.processInput(inputData, playerId);

		// get the player paddle tied to the player socket
        let instanceType = Paddle;
        let playerPaddle = this.world.queryObject({ playerId, instanceType });
        if (playerPaddle) {
            if (inputData.input === 'up') {
                playerPaddle.position.y -= 5;
            } else if (inputData.input === 'down') {
                playerPaddle.position.y += 5;
            }

        }
        if (inputData.input === 'space') {
            instanceType = Bullet;
            let playerBullet = this.world.queryObject({ playerId, instanceType });
            if (playerBullet) {
                playerBullet.position.x = playerPaddle.position.x;
                playerBullet.position.y = playerPaddle.position.y + (PADDLE_HEIGHT/2) - (BULLET_HEIGHT/2);
                if (playerPaddle.playerId == 1) playerBullet.velocity.set(7, 0);
                else playerBullet.velocity.set(-7, 0);
            }
        }
    }

    initGame() {
		// create the paddle objects
        this.addObjectToWorld(new Paddle(this, null, { position: new TwoVector(PADDING, HEIGHT/2 - PADDLE_HEIGHT/2), playerId: 1 }));
        this.addObjectToWorld(new Paddle(this, null, { position: new TwoVector(WIDTH - PADDING - PADDLE_WIDTH, HEIGHT/2 - PADDLE_HEIGHT/2), playerId: 2 }));
        this.addObjectToWorld(new Bullet(this, null, { position: new TwoVector(-10, -10), playerId: 1 }));
        this.addObjectToWorld(new Bullet(this, null, { position: new TwoVector(-10, -10), playerId: 2 }));
        this.addObjectToWorld(new ScoreBox(this, null, { position: new TwoVector(0, 0), playerId: 1 }));
        this.addObjectToWorld(new ScoreBox(this, null, { position: new TwoVector(0, 0), playerId: 2 }));
        this.addObjectToWorld(new Ball(this, null, { position: new TwoVector(WIDTH /2, HEIGHT / 2) }));
    }

    postStepHandler() {
        this.postStepHandlePaddle();
        this.postStepHandleBall();
        this.postStepHandleBullet();
    }

    postStepHandlePaddle() {
        // Check left paddle Top/Bottom limit
        if (this.paddle1) {
            if (this.paddle1.position.y < 0) {
                // paddle hits top
                this.paddle1.position.y = 0;
            } else if ((this.paddle1.position.y + PADDLE_HEIGHT) > HEIGHT - 1) {
                // paddle hits bottom
                this.paddle1.position.y = HEIGHT - PADDLE_HEIGHT - 1;
            }
        }

        if (this.paddle2) {
            // Check right paddle Top/Bottom limit
            if (this.paddle2.position.y < 0) {
                // paddle hits top
                this.paddle2.position.y = 0;
            } else if ((this.paddle2.position.y + PADDLE_HEIGHT) > HEIGHT - 1) {
                // paddle hits bottom
                this.paddle2.position.y = HEIGHT - PADDLE_HEIGHT -1;
            }
        }
    }

    postStepHandleBullet() {
        if (this.bullet2) {
            // CHECK BULLET LEFT EDGE:
            if (this.bullet2.position.x <= PADDING + PADDLE_WIDTH &&
                this.bullet2.position.y >= this.paddle1.y &&
                this.bullet2.position.y <= this.paddle1.position.y + PADDLE_HEIGHT &&
                this.bullet2.velocity.x < 0) {

                // bullet moving left hit player 1 paddle
                this.bullet2.velocity.set(0, 0);
                this.bullet2.position.x = -10;
                this.bullet2.position.y = -10;
                console.log(`player 2 hit player 1`);
            } else if (this.bullet1.position.x <= 0 && this.bullet1.position.x > -10) {
                // ball hit left wall
                this.bullet2.velocity.set(0, 0);
                this.bullet2.position.x = -10;
                this.bullet2.position.y = -10;
            }
        }

        if (this.bullet1) {
			// CHECK BULLET RIGHT EDGE:
            if (this.bullet1.position.x >= WIDTH - PADDING - PADDLE_WIDTH &&
				this.bullet1.position.y >= this.paddle2.position.y &&
				this.bullet1.position.y <= this.paddle2.position.y + PADDLE_HEIGHT &&
				this.bullet1.velocity.x > 0) {

				// ball moving right hits player 2 paddle
                this.bullet1.velocity.set(0, 0);
                this.bullet1.position.x = -10;
                this.bullet1.position.y = -10;
                console.log(`player 1 hit player 2`);
            } else if (this.bullet1.position.x >= WIDTH ) {

				// ball hit right wall
                this.bullet1.velocity.set(0, 0);
                this.bullet1.position.x = -10;
                this.bullet1.position.y = -10;
            }
        }
    }

    postStepHandleBall() {
        if (!this.ball)
            return;

		// CHECK BALL LEFT EDGE:
        if (this.ball.position.x <= PADDING + PADDLE_WIDTH &&
			this.ball.position.y >= this.paddle1.y &&
			this.ball.position.y <= this.paddle1.position.y + PADDLE_HEIGHT &&
			this.ball.velocity.x < 0) {

			// ball moving left hit player 1 paddle
            this.ball.velocity.x *= -1;
            this.ball.position.x = PADDING + PADDLE_WIDTH + 1;
        } else if (this.ball.position.x <= 0) {

			// ball hit left wall
            this.ball.velocity.x *= -1;
            this.ball.position.x = 0;
            this.scorebox2.score += 1;
            console.log(`player 2 scored`);
        }

		// CHECK BALL RIGHT EDGE:
        if (this.ball.position.x >= WIDTH - PADDING - PADDLE_WIDTH &&
			this.ball.position.y >= this.paddle2.position.y &&
			this.ball.position.y <= this.paddle2.position.y + PADDLE_HEIGHT &&
			this.ball.velocity.x > 0) {

			// ball moving right hits player 2 paddle
            this.ball.velocity.x *= -1;
            this.ball.position.x = WIDTH - PADDING - PADDLE_WIDTH - 1;
        } else if (this.ball.position.x >= WIDTH ) {

			// ball hit right wall
            this.ball.velocity.x *= -1;
            this.ball.position.x = WIDTH - 1;
            this.scorebox1.score += 1;
            console.log(`player 1 scored`);
        }

		// ball hits top
        if (this.ball.position.y <= 0) {
            this.ball.position.y = 1;
            this.ball.velocity.y *= -1;
        } else if (this.ball.position.y >= HEIGHT) {
			// ball hits bottom
            this.ball.position.y = HEIGHT - 1;
            this.ball.velocity.y *= -1;
        }

    }

}
