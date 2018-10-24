'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import BaseTypes from 'lance/serialize/BaseTypes';

export default class Paddle extends DynamicObject {

    static get netScheme() {
        return Object.assign({
            disabled_timestamp: { type: BaseTypes.TYPES.STRING }
        }, super.netScheme);
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props && props.playerId)
            this.playerId = props.playerId;
        this.class = Paddle;
        this.disabled_timestamp = '';
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            gameEngine.renderer.addSprite(this, 'paddle');
        }
    }
}
