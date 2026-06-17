import {
    _decorator,
    Color,
    Component,
    EventTouch,
    Graphics,
    Label,
    Node,
    resources,
    Size,
    Sprite,
    SpriteFrame,
    tween,
    UITransform,
    Vec3,
    Widget,
} from 'cc';

const { ccclass, property } = _decorator;

type ScreenName = 'map' | 'level1';

interface MapLevelDef {
    id: number;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    locked: boolean;
}

const MAP_LEVELS: MapLevelDef[] = [
    { id: 1, title: 'Beijing', x: 0.42, y: 0.23, width: 0.38, height: 0.16, locked: false },
    { id: 2, title: 'Shanghai', x: 0.64, y: 0.41, width: 0.42, height: 0.15, locked: true },
    { id: 3, title: 'Chengdu', x: 0.42, y: 0.58, width: 0.42, height: 0.16, locked: true },
    { id: 4, title: 'Guangzhou', x: 0.55, y: 0.73, width: 0.45, height: 0.14, locked: true },
    { id: 5, title: 'Sanya', x: 0.50, y: 0.89, width: 0.44, height: 0.13, locked: true },
];

interface LevelAssetMap {
    map: SpriteFrame | null;
    lock: SpriteFrame | null;
    level1: SpriteFrame | null;
    hand: SpriteFrame | null;
    guideText: SpriteFrame | null;
    back: SpriteFrame | null;
    timer: SpriteFrame | null;
}

@ccclass('SpotDiffGame')
export class SpotDiffGame extends Component {
    @property(SpriteFrame)
    public mapImage: SpriteFrame | null = null;

    @property(SpriteFrame)
    public level1Image: SpriteFrame | null = null;

    private root!: Node;
    private mainLayer!: Node;
    private overlayLayer!: Node;
    private mapNode: Node | null = null;
    private levelNode: Node | null = null;
    private itemDock: Node | null = null;
    private currentScreen: ScreenName = 'map';
    private mapSize = new Size(540, 1284);
    private levelSize = new Size(540, 963);
    private guideTarget = { x: 0.48, y: 0.80, radius: 0.065 };
    private guideDone = false;
    private assets: LevelAssetMap = {
        map: null,
        lock: null,
        level1: null,
        hand: null,
        guideText: null,
        back: null,
        timer: null,
    };

    protected onLoad(): void {
        this.setupRoot();
        this.loadAssets();
        this.showMap();
    }

    private setupRoot(): void {
        this.node.removeAllChildren();

        this.root = this.createNode('SpotDiffRoot', this.node, 720, 1280);
        const widget = this.root.addComponent(Widget);
        widget.isAlignHorizontalCenter = true;
        widget.isAlignVerticalCenter = true;

        this.mainLayer = this.createNode('MainLayer', this.root, 720, 1280);
        this.overlayLayer = this.createNode('OverlayLayer', this.root, 720, 1280);
    }

    private loadAssets(): void {
        this.loadSpriteFrame('images/bg/spriteFrame', (spriteFrame) => {
            this.assets.map = spriteFrame;
            if (!this.mapImage && this.currentScreen === 'map') {
                this.showMap();
            }
        });
        this.loadSpriteFrame('images/lock/spriteFrame', (spriteFrame) => {
            this.assets.lock = spriteFrame;
            if (this.currentScreen === 'map') {
                this.showMap();
            }
        });
        this.loadSpriteFrame('images/level1/spriteFrame', (spriteFrame) => {
            this.assets.level1 = spriteFrame;
            if (!this.level1Image && this.currentScreen === 'level1') {
                this.showLevel1();
            }
        });
        this.loadSpriteFrame('images/hand/spriteFrame', (spriteFrame) => {
            this.assets.hand = spriteFrame;
            if (this.currentScreen === 'level1') {
                this.showLevel1();
            }
        });
        this.loadSpriteFrame('images/guide-text/spriteFrame', (spriteFrame) => {
            this.assets.guideText = spriteFrame;
            if (this.currentScreen === 'level1') {
                this.showLevel1();
            }
        });
        this.loadSpriteFrame('images/back/spriteFrame', (spriteFrame) => {
            this.assets.back = spriteFrame;
            if (this.currentScreen === 'level1') {
                this.showLevel1();
            }
        });
        this.loadSpriteFrame('images/timer/spriteFrame', (spriteFrame) => {
            this.assets.timer = spriteFrame;
            if (this.currentScreen === 'level1') {
                this.showLevel1();
            }
        });
    }

    private loadSpriteFrame(path: string, onLoaded: (spriteFrame: SpriteFrame) => void): void {
        resources.load(path, SpriteFrame, (error, spriteFrame) => {
            if (error) {
                console.warn(`[SpotDiffGame] Cannot load ${path}.`, error);
                return;
            }
            onLoaded(spriteFrame);
        });
    }

    private showMap(): void {
        this.currentScreen = 'map';
        this.mainLayer.removeAllChildren();
        this.overlayLayer.removeAllChildren();
        this.drawSolidBackground(new Color(218, 239, 226));
        this.createMapImage();
        this.createMapLevelNodes();
    }

    private createMapImage(): void {
        this.mapNode = this.createNode('MapImage', this.mainLayer, this.mapSize.width, this.mapSize.height);
        this.mapNode.setPosition(Vec3.ZERO);

        const image = this.mapImage || this.assets.map;
        if (image) {
            this.addSprite(this.mapNode, image, this.mapSize);
            return;
        }

        const g = this.mapNode.addComponent(Graphics);
        g.fillColor = new Color(190, 228, 202);
        g.roundRect(-this.mapSize.width / 2, -this.mapSize.height / 2, this.mapSize.width, this.mapSize.height, 16);
        g.fill();
    }

    private createMapLevelNodes(): void {
        if (!this.mapNode) {
            return;
        }

        MAP_LEVELS.forEach((level) => {
            const center = this.mapPointToLocal(level.x, level.y);
            const size = new Size(level.width * this.mapSize.width, level.height * this.mapSize.height);
            const hitArea = this.createNode(`LevelHit-${level.id}`, this.mapNode!, size.width, size.height);
            hitArea.setPosition(center);
            hitArea.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.onMapLevelClick(level);
            });

            if (level.locked) {
                this.createLock(level);
            }
        });
    }

    private onMapLevelClick(level: MapLevelDef): void {
        if (level.locked) {
            this.showToast('关卡未解锁');
            this.shakeLock(level.id);
            return;
        }

        if (level.id === 1) {
            this.showLevel1();
        }
    }

    private createLock(level: MapLevelDef): void {
        if (!this.mapNode) {
            return;
        }

        const lock = this.createNode(`Lock-${level.id}`, this.mapNode, 42, 52);
        lock.setPosition(this.mapPointToLocal(level.x, level.y));

        if (this.assets.lock) {
            this.addSprite(lock, this.assets.lock, new Size(42, 52));
            return;
        }

        const g = lock.addComponent(Graphics);
        g.lineWidth = 6;
        g.strokeColor = new Color(255, 249, 229);
        g.moveTo(-14, 0);
        g.bezierCurveTo(-14, 25, 14, 25, 14, 0);
        g.stroke();
        g.fillColor = new Color(154, 116, 77);
        g.roundRect(-19, -24, 38, 34, 7);
        g.fill();
    }

    private showLevel1(): void {
        this.currentScreen = 'level1';
        this.mainLayer.removeAllChildren();
        this.overlayLayer.removeAllChildren();
        this.drawSolidBackground(new Color(0, 0, 0));

        this.levelNode = this.createNode('Level1Image', this.mainLayer, this.levelSize.width, this.levelSize.height);
        this.levelNode.setPosition(new Vec3(0, 0));

        const image = this.level1Image || this.assets.level1;
        if (image) {
            this.addSprite(this.levelNode, image, this.levelSize);
        } else {
            const g = this.levelNode.addComponent(Graphics);
            g.fillColor = new Color(213, 201, 175);
            g.rect(-this.levelSize.width / 2, -this.levelSize.height / 2, this.levelSize.width, this.levelSize.height);
            g.fill();
        }

        this.createLevelTopBar();
        this.createItemDock();
        this.createGuideOverlay();
        this.createLevelTapLayer();
    }

    private createLevelTopBar(): void {
        const back = this.createNode('BackButton', this.mainLayer, 72, 72);
        back.setPosition(new Vec3(-202, 486));
        if (this.assets.back) {
            this.addSprite(back, this.assets.back, new Size(56, 56));
        } else {
            this.drawCircleButton(back, '<');
        }
        back.on(Node.EventType.TOUCH_END, () => this.showMap());

        const timer = this.createNode('Timer', this.mainLayer, 72, 72);
        timer.setPosition(new Vec3(205, 486));
        if (this.assets.timer) {
            this.addSprite(timer, this.assets.timer, new Size(56, 56));
        } else {
            this.drawCircleButton(timer, '+');
        }

        this.createLabel(this.mainLayer, '2:43', 22, new Vec3(205, 486), new Color(143, 80, 78), true);
    }

    private createItemDock(): void {
        this.itemDock?.destroy();
        const dock = this.createNode('ItemDock', this.mainLayer, 540, 104);
        this.itemDock = dock;
        dock.setPosition(new Vec3(0, -430));

        const g = dock.addComponent(Graphics);
        g.fillColor = new Color(214, 210, 205, 240);
        g.roundRect(-270, -52, 540, 104, 8);
        g.fill();

        const itemCount = 6;
        const startX = -225;
        for (let i = 0; i < itemCount; i += 1) {
            const item = this.createNode(`Item-${i}`, dock, 62, 78);
            item.setPosition(new Vec3(startX + i * 90, 0));
            this.drawItemSlot(item, i, i === 0 && this.guideDone ? '1/6' : i === 0 ? '0/6' : '0/3');
        }
    }

    private drawItemSlot(parent: Node, index: number, countText: string): void {
        const g = parent.addComponent(Graphics);
        g.fillColor = new Color(184, 180, 174, 230);
        g.roundRect(-31, -39, 62, 78, 8);
        g.fill();
        g.strokeColor = new Color(118, 112, 108, 180);
        g.lineWidth = 2;
        g.roundRect(-30, -38, 60, 76, 8);
        g.stroke();

        const colors = [
            new Color(255, 241, 210),
            new Color(110, 150, 132),
            new Color(190, 163, 103),
            new Color(104, 68, 45),
            new Color(104, 149, 146),
            new Color(238, 205, 91),
        ];
        g.fillColor = colors[index % colors.length];
        if (index === 0) {
            g.circle(0, 12, 17);
        } else if (index === 5) {
            g.circle(0, 12, 18);
            g.fill();
            g.fillColor = new Color(142, 122, 59);
            g.rect(-3, -6, 6, 17);
        } else {
            g.roundRect(-16, -4, 32, 28, 9);
        }
        g.fill();
        this.createLabel(parent, countText, 15, new Vec3(0, -25), new Color(72, 67, 63), true);
    }

    private createGuideOverlay(): void {
        if (this.guideDone || !this.levelNode) {
            return;
        }

        const target = this.levelPointToLocal(this.guideTarget.x, this.guideTarget.y);
        const halo = this.createNode('GuideHalo', this.levelNode, 70, 70);
        halo.setPosition(target);
        const g = halo.addComponent(Graphics);
        g.fillColor = new Color(255, 255, 255, 190);
        g.circle(0, 0, 34);
        g.fill();
        g.fillColor = new Color(255, 197, 116, 210);
        g.circle(0, 0, 23);
        g.fill();

        if (this.assets.hand) {
            const hand = this.createNode('GuideHand', this.levelNode, 78, 66);
            hand.setPosition(new Vec3(target.x + 44, target.y - 35));
            this.addSprite(hand, this.assets.hand, new Size(78, 66));
            tween(hand)
                .repeatForever(
                    tween()
                        .to(0.45, { position: new Vec3(target.x + 28, target.y - 18) })
                        .to(0.45, { position: new Vec3(target.x + 44, target.y - 35) }),
                )
                .start();
        }

        if (this.assets.guideText) {
            const guideText = this.createNode('GuideText', this.levelNode, 272, 57);
            guideText.setPosition(new Vec3(58, target.y - 91));
            this.addSprite(guideText, this.assets.guideText, new Size(272, 57));
        }
    }

    private createLevelTapLayer(): void {
        if (!this.levelNode) {
            return;
        }

        const tapLayer = this.createNode('LevelTapLayer', this.levelNode, this.levelSize.width, this.levelSize.height);
        tapLayer.on(Node.EventType.TOUCH_END, (event: EventTouch) => this.onLevelTouch(event));
    }

    private onLevelTouch(event: EventTouch): void {
        if (!this.levelNode || this.guideDone) {
            return;
        }

        const ui = this.levelNode.getComponent(UITransform);
        if (!ui) {
            return;
        }

        const local = ui.convertToNodeSpaceAR(event.getUILocation().toVec3());
        const normalizedX = (local.x + this.levelSize.width / 2) / this.levelSize.width;
        const normalizedY = (this.levelSize.height / 2 - local.y) / this.levelSize.height;
        const dx = normalizedX - this.guideTarget.x;
        const dy = normalizedY - this.guideTarget.y;

        if (Math.sqrt(dx * dx + dy * dy) <= this.guideTarget.radius) {
            this.completeGuide(local);
            return;
        }

        this.showToast('点击发光的沙滩球');
    }

    private completeGuide(local: Vec3): void {
        this.guideDone = true;
        const marker = this.createNode('CollectMarker', this.levelNode!, 72, 72);
        marker.setPosition(local);
        const g = marker.addComponent(Graphics);
        g.lineWidth = 6;
        g.strokeColor = new Color(255, 90, 78);
        g.circle(0, 0, 31);
        g.stroke();
        this.createLabel(marker, 'OK', 20, Vec3.ZERO, new Color(255, 90, 78), true);
        tween(marker).to(0.18, { scale: new Vec3(1.25, 1.25, 1) }).to(0.14, { scale: Vec3.ONE }).start();
        this.levelNode?.getChildByName('GuideHalo')?.destroy();
        this.levelNode?.getChildByName('GuideHand')?.destroy();
        this.levelNode?.getChildByName('GuideText')?.destroy();
        this.createItemDock();
        this.showToast('已收集');
    }

    private drawCircleButton(parent: Node, text: string): void {
        const g = parent.addComponent(Graphics);
        g.fillColor = new Color(222, 244, 255);
        g.circle(0, 0, 28);
        g.fill();
        this.createLabel(parent, text, 28, Vec3.ZERO, new Color(97, 132, 153), true);
    }

    private drawSolidBackground(color: Color): void {
        const bg = this.createNode('StageBackground', this.mainLayer, 720, 1280);
        const g = bg.addComponent(Graphics);
        g.fillColor = color;
        g.rect(-360, -640, 720, 1280);
        g.fill();
    }

    private shakeLock(levelId: number): void {
        const lock = this.mapNode?.getChildByName(`Lock-${levelId}`);
        if (!lock) {
            return;
        }

        const origin = lock.position.clone();
        tween(lock)
            .to(0.05, { position: new Vec3(origin.x - 8, origin.y, origin.z) })
            .to(0.05, { position: new Vec3(origin.x + 8, origin.y, origin.z) })
            .to(0.05, { position: new Vec3(origin.x - 6, origin.y, origin.z) })
            .to(0.05, { position: origin })
            .start();
    }

    private showToast(text: string): void {
        this.overlayLayer.removeAllChildren();

        const toast = this.createNode('Toast', this.overlayLayer, 360, 64);
        toast.setPosition(new Vec3(0, -510));

        const g = toast.addComponent(Graphics);
        g.fillColor = new Color(61, 72, 66, 220);
        g.roundRect(-180, -32, 360, 64, 16);
        g.fill();

        this.createLabel(toast, text, 22, Vec3.ZERO, new Color(255, 255, 255), true);
        tween(toast)
            .delay(1.0)
            .to(0.18, { scale: new Vec3(0.8, 0.8, 1) })
            .call(() => toast.destroy())
            .start();
    }

    private mapPointToLocal(x: number, y: number): Vec3 {
        return new Vec3(
            x * this.mapSize.width - this.mapSize.width / 2,
            this.mapSize.height / 2 - y * this.mapSize.height,
            0,
        );
    }

    private levelPointToLocal(x: number, y: number): Vec3 {
        return new Vec3(
            x * this.levelSize.width - this.levelSize.width / 2,
            this.levelSize.height / 2 - y * this.levelSize.height,
            0,
        );
    }

    private addSprite(parent: Node, spriteFrame: SpriteFrame, size: Size): Sprite {
        const sprite = parent.addComponent(Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        parent.getComponent(UITransform)?.setContentSize(size);
        return sprite;
    }

    private createLabel(parent: Node, text: string, fontSize: number, position: Vec3, color: Color, bold = false): Label {
        const node = this.createNode(`Label-${text}`, parent, Math.max(80, text.length * fontSize), fontSize + 12);
        node.setPosition(position);

        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 6;
        label.color = color;
        label.isBold = bold;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        return label;
    }

    private createNode(name: string, parent: Node, width: number, height: number): Node {
        const node = new Node(name);
        parent.addChild(node);
        const ui = node.addComponent(UITransform);
        ui.setContentSize(width, height);
        return node;
    }
}
