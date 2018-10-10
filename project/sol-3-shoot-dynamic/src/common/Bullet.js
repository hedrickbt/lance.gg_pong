'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import BaseTypes from 'lance/serialize/BaseTypes';
import Renderer from '../client/MyRenderer';

export default class Bullet extends DynamicObject {

    // position correction if less than world width/height
    get bending() {
        return { position: { max: 500.0 } };
    }

    get bendingMultiple() {
        return 0.8;
    }

    get bendingVelocityMultiple() {
        return 0;
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props && props.playerId)
            this.playerId = props.playerId;
        this.class = Bullet;
        this.velocity.set(0, 0);
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) { // only true for client side
            gameEngine.renderer.addSprite(this, 'bullet');
        }
    }

    onRemoveFromWorld(gameEngine) {
        let renderer = gameEngine.renderer;
        if (renderer && renderer.sprites[this.id]) { // only true for client side
            // find and remove the html element version of the bullet
            let objName = this.class.name.toLowerCase();
            objName += this.playerId;
            let htmlElement = document.querySelector('.' + objName);
            htmlElement.parentNode.removeChild(htmlElement);

            // Remove the reference to the html element from the renderer
            delete renderer.sprites[this.id];
        }
    }
}
