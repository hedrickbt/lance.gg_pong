'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';

export default class Bullet extends DynamicObject {

    get bendingMultiple() { return 0.8; }
    get bendingVelocityMultiple() { return 0; }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props && props.playerId)
            this.playerId = props.playerId;
        this.class = Bullet;
        this.velocity.set(0, 0);
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            gameEngine.renderer.addSprite(this, 'bullet');
        }
    }
}
