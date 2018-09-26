'use strict';

import Renderer from 'lance/render/Renderer';

export default class MyRenderer extends Renderer {

    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.sprites = {};
    }

    draw(t, dt) {
        super.draw(t, dt);

        for (let objId of Object.keys(this.sprites)) {
            if (this.sprites[objId].el) {
                this.sprites[objId].el.style.top = this.gameEngine.world.objects[objId].position.y + 'px';
                this.sprites[objId].el.style.left = this.gameEngine.world.objects[objId].position.x + 'px';

                if ((this.sprites[objId].el.className == 'scorebox1') || (this.sprites[objId].el.className == 'scorebox2')) {
                    this.sprites[objId].el.innerText = this.gameEngine.world.objects[objId].score.toString();
                }
            }
        }
    }

    addSprite(obj, objName) {
        if (objName === 'paddle') objName += obj.playerId;
        if (objName === 'bullet') objName += obj.playerId;
        if (objName === 'scorebox') objName += obj.playerId;
        this.sprites[obj.id] = {
            el: document.querySelector('.' + objName)
        };
    }

}
