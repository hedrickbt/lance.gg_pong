'use strict';

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import TwoVector from 'lance/serialize/TwoVector';
import Paddle from './Paddle';
import Ball from './Ball';
import Bullet from './Bullet';
import ScoreBox from './ScoreBox';
const PADDING = 20;
const WIDTH = 600;
const HEIGHT = 200;
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
            if (playerPaddle.disabled_timestamp === '') {
                if (inputData.input === 'up') {
                    playerPaddle.position.y -= 5;
                    //this.trace.trace(() => `up for ${playerId}`);
                    console.log(`up for ${playerId}`);
                } else if (inputData.input === 'down') {
                    playerPaddle.position.y += 5;
                    //this.trace.trace(() => `down for ${playerId}`);
                    console.log(`down for ${playerId}`);
                }
            }

        }
        if (inputData.input === 'space') {
            if (playerPaddle.disabled_timestamp === '') {
                // no more than 1 active bullet per player
                instanceType = Bullet;
                let playerBullet = this.world.queryObject({ playerId, instanceType });
                if (playerBullet) {
		    // This prevents more than 1 active bullet per player
                } else {
                    playerBullet = this.makeBullet(playerPaddle);
                }
            }
        }
    }

    initGame() {
		// create the paddle objects
        this.addObjectToWorld(new Paddle(this, null, { position: new TwoVector(PADDING, HEIGHT/2 - PADDLE_HEIGHT/2), playerId: 1 }));
        this.addObjectToWorld(new Paddle(this, null, { position: new TwoVector(WIDTH - PADDING - PADDLE_WIDTH, HEIGHT/2 - PADDLE_HEIGHT/2), playerId: 2 }));
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
        if (this.paddle1) {
            if (this.paddle1.disabled_timestamp != '') {
                // console.log(Date.now() - parseInt(this.paddle1.disabled_timestamp));
                if ((Date.now() - parseInt(this.paddle1.disabled_timestamp)) >= 5000) {
                    this.paddle1.disabled_timestamp = '';
                }
            }

            // Check left paddle Top/Bottom limit
            if (this.paddle1.position.y < 0) {
                // paddle hits top
                this.paddle1.position.y = 0;
            } else if ((this.paddle1.position.y + PADDLE_HEIGHT) > HEIGHT - 1) {
                // paddle hits bottom
                this.paddle1.position.y = HEIGHT - PADDLE_HEIGHT - 1;
            }
        }

        if (this.paddle2) {
            if (this.paddle2.disabled_timestamp != '') {
                // console.log(Date.now() - parseInt(this.paddle2.disabled_timestamp));
                if ((Date.now() - parseInt(this.paddle2.disabled_timestamp)) >= 5000) {
                    this.paddle2.disabled_timestamp = '';
                }
            }

            // Check right paddle Top/Bottom limit
            if (this.paddle2.position.y < 0) {
                // paddle hits top
                this.paddle2.position.y = 0;
            } else if ((this.paddle2.position.y + PADDLE_HEIGHT) > HEIGHT - 1) {
                // paddle hits bottom
                this.paddle2.position.y = HEIGHT - PADDLE_HEIGHT - 1;
            }
        }
    }

    postStepHandleBullet() {
        // this.removeObjectFromWorld(missile.id);

        let instanceType = Bullet;
        let bullet = this.world.queryObject({ playerId: 2, instanceType });
        if (bullet) {
            // CHECK BULLET LEFT EDGE:
            if (bullet.position.x <= PADDING + PADDLE_WIDTH &&
                bullet.position.y >= this.paddle1.y &&
                bullet.position.y <= this.paddle1.position.y + PADDLE_HEIGHT &&
                bullet.velocity.x < 0) {

                // bullet moving left hit player 1 paddle
                this.paddle1.disabled_timestamp = Date.now().toString();
                console.log(`player 2 hit player 1`);
                this.destroyBullet(bullet.id);
            } else if (bullet.position.x <= 0 && bullet.position.x > -10) {
                // ball hit left wall
                console.log(`player 2 bullet hit left edge`);
                this.destroyBullet(bullet.id);
            }
        }

        bullet = this.world.queryObject({ playerId: 1, instanceType });
        if (bullet) {
			// CHECK BULLET RIGHT EDGE:
            if (bullet.position.x >= WIDTH - PADDING - PADDLE_WIDTH &&
				bullet.position.y >= this.paddle2.position.y &&
				bullet.position.y <= this.paddle2.position.y + PADDLE_HEIGHT &&
				bullet.velocity.x > 0) {

				// ball moving right hits player 2 paddle
                this.paddle2.disabled_timestamp = Date.now().toString();
                console.log(`player 1 hit player 2`);
                this.destroyBullet(bullet.id);
            } else if (bullet.position.x >= WIDTH ) {
				// ball hit right wall
                console.log(`player 1 bullet hit right edge`);
                this.destroyBullet(bullet.id);
            }
        }
    }

    postStepHandleBall() {
        if (!this.ball || !this.paddle1 || !this.paddle2)
            return;

		// CHECK BALL MOVING LEFT
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

		// CHECK BALL MOVING RIGHT
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

    makeBullet(playerPaddle) {  // client and server side
        let bullet = new Bullet(this);

        // we want the bullet location and velocity to correspond to that of the paddle firing it
        bullet.velocity.copy(playerPaddle.velocity);
        bullet.playerId = playerPaddle.playerId;
        bullet.ownerId = playerPaddle.id;
        bullet.position.x = playerPaddle.position.x;
        bullet.position.y = playerPaddle.position.y + (PADDLE_HEIGHT / 2) - (BULLET_HEIGHT / 2);

        if (playerPaddle.playerId == 1) bullet.velocity.set(7, 0);
        else bullet.velocity.set(-7, 0);

        this.trace.trace(() => `bullet[${bullet.id}] created vel=${bullet.velocity}`);

        let obj = this.addObjectToWorld(bullet);

        // if the object was added successfully to the game world, destroy the missile after some game ticks
        // if (obj)
        //     this.timer.add(30, this.destroyMissile, this, [obj.id]);

        return bullet;
    }

    // destroy the bullet if it still exists
    destroyBullet(bulletId) { // client and server side
        console.log(`Destroying bullet: ${bulletId}.`);
        if (this.world.objects[bulletId]) {
            this.trace.trace(() => `bullet[${bulletId}] destroyed`);
            this.removeObjectFromWorld(bulletId);
        }
    }

}
