
cc.Class({
    extends: cc.Component,

    properties: {
        targetNode: cc.Node,
        knifeNode: cc.Node,
        knifePrefab: cc.Prefab,
    },

    onLoad () {
        this.canThrow = true;
        this.targetNode.zIndex = 1;
        this.targetRotation = 3;
        this.knifeArray = [];

        setInterval(() => {
            this.changeSpeed();
        }, 2000);
        this.node.on('touchstart', this.throwKnife, this);
    },

    onDestroy () {
        this.node.off('touchstart', this.throwKnife, this);
    },

    update (dt) {
        this.targetNode.angle = (this.targetNode.angle + this.targetRotation) % 360;
        for (let knife of this.knifeArray) {
            knife.angle = (knife.angle  + this.targetRotation) % 360;

            let rad = Math.PI * (knife.angle - 90) / 180;
            let r = this.targetNode.width / 2;
            knife.x = this.targetNode.x + r * Math.cos(rad);
            knife.y = this.targetNode.y + r * Math.sin(rad);
        }
    },

    throwKnife () {
        if (this.canThrow) {
            this.canThrow = false;
            this.knifeNode.runAction(cc.sequence(
                cc.moveTo(0.15, cc.v2(this.knifeNode.x, this.targetNode.y - this.targetNode.width / 2)),
                cc.callFunc(() => {
                    let isHit = false;
                    let gap = 5;

                    // 判断是否会撞到
                    for (let knife of this.knifeArray) {
                        if (Math.abs(knife.angle) < gap || Math.abs(360 - knife.angle) < gap) {
                            isHit = true;
                            break;
                        }
                    }

                    if (isHit) {
                        this.knifeNode.runAction(cc.sequence(
                            cc.spawn(
                                cc.moveTo(0.25, cc.v2(this.knifeNode.x, -cc.winSize.height)),
                                cc.rotateTo(0.25, 30),
                            ),
                            cc.callFunc(() => {
                                cc.director.loadScene('game');
                            })
                        ))
                    } else {
                        let knife = cc.instantiate(this.knifePrefab);
                        knife.setPosition(this.knifeNode.position);
                        this.node.addChild(knife);
                        this.knifeNode.setPosition(cc.v2(0, -300));
                        this.knifeArray.push(knife);
                        this.canThrow = true;
                    }
                })
            ))
        }
    },

    changeSpeed() {
        let dir = Math.random() > 0.5 ? 1 : -1;
        let speed = 1 + Math.random() * 4;
        this.targetRotation = dir * speed;
    },
});
