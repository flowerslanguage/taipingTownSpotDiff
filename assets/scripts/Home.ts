import { _decorator, Component, ScrollView, Button } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Home")
export class Home extends Component {
  // 声明页面所有交互控件
  @property(ScrollView)
  mapScroll: ScrollView | null = null;

  @property(Button)
  backBtn: Button | null = null; // 返回按钮

  @property(Button)
  shareBtn: Button | null = null; // 分享按钮

  @property(Button)
  beijingBtn: Button | null = null; // 北京按钮

  onLoad() {
    this.beijingBtn.node.on(
      Button.EventType.CLICK,
      this.onBeijingBtnClick,
      this,
    );
  }

  start() {
    this.scheduleOnce(() => {
      this.mapScroll.scrollToTop(0);
    }, 0);
  }

  update(deltaTime: number) {}

  onBeijingBtnClick() {
    this.shareBtn.node.active = true;
  }
}
