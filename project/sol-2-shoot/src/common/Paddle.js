'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import {HEIGHT,PADDLE_HEIGHT} from './MyGameEngine';

export default class Paddle extends DynamicObject {

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props && props.playerId)
            this.playerId = props.playerId;
        this.class = Paddle;
        //this.position.y = HEIGHT / 2 - PADDLE_HEIGHT/2;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            gameEngine.renderer.addSprite(this, 'paddle');
        }
    }
}