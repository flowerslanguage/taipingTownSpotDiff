# 太平小镇找不同原型使用说明

这个工程现在包含一个找不同游戏原型，当前入口是地图页，核心代码在：

- `assets/scripts/SpotDiffGame.ts`：地图页、房子点击区域、锁状态、提示逻辑
- `assets/scripts/SpotDiffLevels.ts`：关卡标题、时间、错误次数、差异点坐标

## 第一次运行

1. 用 Cocos Creator 3.8.8 打开本项目。
2. 在 `assets` 下新建一个 Scene，例如命名为 `main.scene`。
3. 打开场景，创建一个 `Canvas`。
4. 在 `Canvas` 下面创建一个空节点，命名为 `GameRoot`。
5. 给 `GameRoot` 添加组件 `SpotDiffGame`。
6. 点击预览运行。

脚本会自动显示地图背景，并在每个房子上叠加锁或入口按钮。

## 替换成真实图片

默认会自动加载 `assets/resources/images/bg.jpg`。

如果要换成另一张图，有两种方式：

1. 直接替换 `assets/resources/images/bg.jpg`。
2. 或者把图片拖进 `assets`，选中 `GameRoot`，在 `SpotDiffGame` 组件上把图片的 `SpriteFrame` 拖到 `Level Image` 属性里。

如果两种方式都没有设置图片，脚本才会使用内置的占位插画。

## 地图和锁应该怎么做

建议背景图只放“干净地图”，不要把锁画死在图片里。

锁、可点击区域、解锁状态应该由 Cocos 单独叠加，原因是：

- 后面通关后可以隐藏锁
- 可以点击锁播放抖动或提示
- 可以做解锁动画
- 不需要每次改状态都重新出一整张图

现在代码就是这种做法：`bg.jpg` 负责地图，`SpotDiffGame.ts` 里的 `MAP_LEVELS` 负责每个房子的位置和锁状态。

锁图放在 `assets/resources/images/lock.png`。如果没有这张图，代码会自动画一个简易锁作为兜底。

每个房子的配置长这样：

```ts
{ id: 2, title: '上海', x: 0.64, y: 0.41, width: 0.42, height: 0.15, locked: true }
```

字段说明：

- `x`：房子中心点横向位置，左边是 `0`，右边是 `1`
- `y`：房子中心点纵向位置，上边是 `0`，下边是 `1`
- `width` / `height`：可点击范围大小
- `locked`：是否显示锁

## 配置差异点

打开 `assets/scripts/SpotDiffLevels.ts`，每个差异点长这样：

```ts
{ id: 'kite', label: '风筝', x: 0.76, y: 0.82, radius: 0.06 }
```

字段说明：

- `id`：唯一标识，不要重复
- `label`：底部道具栏显示的名字
- `x`：横向位置，左边是 `0`，右边是 `1`
- `y`：纵向位置，上边是 `0`，下边是 `1`
- `radius`：点击判定半径，通常 `0.04` 到 `0.08`

开发阶段会显示淡红色调试圆圈，方便你校准位置。正式发布前可以在 `SpotDiffGame.ts` 里删除或注释 `createDebugSpot` 调用。

## 后续建议

先把一关完整跑通，再加美术和更多关卡。后面可以继续扩展：

- 两张图左右/上下对比
- 放大镜和拖拽查看
- 提示按钮
- 关卡解锁进度
- 音效和结算奖励
