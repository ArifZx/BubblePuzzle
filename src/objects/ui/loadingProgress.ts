export default class LoadingProgress extends Phaser.GameObjects.Container {

  constructor(scene: Phaser.Scene, x: number, y: number, width = 400, height = 100) {
    super(scene, x, y);
    this.setSize(width, height);

    const progressWidth = width * 0.8;
    const progressHeight = 50;
    const progressX = (this.width - progressWidth) * 0.5;
    const progressY = (this.height * 0.5) - progressHeight * 0.5;

    const progressBar = new Phaser.GameObjects.Graphics(scene);
    const progressBox = new Phaser.GameObjects.Graphics(scene);
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(progressX, progressY, progressWidth, progressHeight);

    const loadingText = new Phaser.GameObjects.Text(scene, this.width * 0.5, 0, "Loading...", {
      fontSize: "20px",
      color: "#ffffff",
      fontFamily: "monospace"
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = new Phaser.GameObjects.Text(scene, this.width * 0.5, this.height * 0.5, "0%", {
      fontSize: "18px",
      color: "#ffffff",
      fontFamily: "monospace"
    });
    percentText.setOrigin(0.5, 0.5);

    const assetText = new Phaser.GameObjects.Text(scene, this.width * 0.5, this.height, "", {
      fontSize: "18px",
      color: "#ffffff",
      fontFamily: "monospace"
    });
    assetText.setOrigin(0.5, 0.5);

    scene.load.on('progress', function (value: number) {
      percentText.setText((value * 100).toFixed(0) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 0.5);
      progressBar.fillRect(progressX + 10, progressY + 10, (progressWidth - 20) * value, 30);
    });

    scene.load.on('fileprogress', function (file: Phaser.Loader.File) {
      assetText.setText('Loading asset: ' + file.key);
    });

    scene.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
      this.emit("complete");
      this.destroy();
    }, this);

    this.add([progressBox, progressBar, loadingText, percentText, assetText]);

    // @ts-ignore
    scene.add.existing(this);
  }

}