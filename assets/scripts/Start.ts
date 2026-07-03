import { _decorator, Component, Node, Scene, director } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Start")
export class Start extends Component {
  start() {}

  update(deltaTime: number) {}

  onClickStartGame() {
    director.loadScene("Hall");
  }
}
