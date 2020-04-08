import { Scene } from "phaser"
import options from "../../options";
import ActionButton from "../ui/base/actionButton";

class PauseButton extends ActionButton {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, options.pausedButton.texture.name);
  }
}

export default PauseButton