'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import BaseTypes from 'lance/serialize/BaseTypes';

export default class ScoreBox extends DynamicObject {

    get bendingMultiple() { return 0.8; }
    get bendingVelocityMultiple() { return 0; }

    static get netScheme() {
        return Object.assign({
            score: { type: BaseTypes.TYPES.INT16 }
        }, super.netScheme);
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props && props.playerId)
            this.playerId = props.playerId;
        this.class = ScoreBox;
        this.score = 0;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            gameEngine.renderer.addSprite(this, 'scorebox');
        }
    }
}
