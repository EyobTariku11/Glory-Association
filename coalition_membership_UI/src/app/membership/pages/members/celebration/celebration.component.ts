import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-celebration",
  templateUrl: "./celebration.component.html",
  styleUrls: ["./celebration.component.scss"],
})
export class CelebrationComponent implements AfterViewInit, OnDestroy {
  @Input() memberName: string;
  @ViewChild("canvas") canvasRef!: ElementRef;
  ctx: CanvasRenderingContext2D | null = null;
  cx: number = 0;
  cy: number = 0;
  confetti: Confetti[] = [];
  confettiCount: number = 300;
  gravity: number = 0.5;
  terminalVelocity: number = 5;
  drag: number = 0.075;
  colors: { front: string; back: string }[] = [
    { front: "red", back: "darkred" },
    { front: "green", back: "darkgreen" },
    { front: "blue", back: "darkblue" },
    { front: "yellow", back: "darkyellow" },
    { front: "orange", back: "darkorange" },
    { front: "pink", back: "darkpink" },
    { front: "purple", back: "darkpurple" },
    { front: "turquoise", back: "darkturquoise" },
  ];

  ngAfterViewInit() {
    this.ctx = (this.canvasRef.nativeElement as HTMLCanvasElement).getContext(
      "2d"
    );
    this.resizeCanvas();
    this.initConfetti();
    this.render();
  }

  ngOnDestroy() {
    this.ctx = null;
  }

  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.cx = this.ctx!.canvas.width / 2;
    this.cy = this.ctx!.canvas.height / 2;
  }

  randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  initConfetti() {
    for (let i = 0; i < this.confettiCount; i++) {
      this.confetti.push({
        color: this.colors[Math.floor(this.randomRange(0, this.colors.length))],
        dimensions: {
          x: this.randomRange(10, 20),
          y: this.randomRange(10, 30),
        },
        position: {
          x: this.randomRange(0, window.innerWidth),
          y: window.innerHeight - 1,
        },
        rotation: this.randomRange(0, 2 * Math.PI),
        scale: {
          x: 1,
          y: 1,
        },
        velocity: {
          x: this.randomRange(-25, 25),
          y: this.randomRange(0, -50),
        },
      });
    }
  }

  render() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.confetti.forEach((confetto, index) => {
      let width = confetto.dimensions.x * confetto.scale.x;
      let height = confetto.dimensions.y * confetto.scale.y;

      // Move canvas to position and rotate
      this.ctx!.translate(confetto.position.x, confetto.position.y);
      this.ctx!.rotate(confetto.rotation);

      // Apply forces to velocity
      confetto.velocity.x -= confetto.velocity.x * this.drag;
      confetto.velocity.y = Math.min(
        confetto.velocity.y + this.gravity,
        this.terminalVelocity
      );
      confetto.velocity.x +=
        Math.random() > 0.5 ? Math.random() : -Math.random();

      // Set position
      confetto.position.x += confetto.velocity.x;
      confetto.position.y += confetto.velocity.y;

      // Delete confetti when out of frame
      if (confetto.position.y >= window.innerHeight) {
        this.confetti.splice(index, 1);
      }

      // Loop confetti x position
      if (confetto.position.x > window.innerWidth) {
        confetto.position.x = 0;
      }
      if (confetto.position.x < 0) {
        confetto.position.x = window.innerWidth;
      }

      // Spin confetti by scaling y
      confetto.scale.y = Math.cos(confetto.position.y * 0.1);
      this.ctx!.fillStyle =
        confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;

      // Draw confetti
      this.ctx!.fillRect(-width / 2, -height / 2, width / 2, height);

      // Reset transform matrix
      this.ctx!.setTransform(1, 0, 0, 1, 0, 0);
    });

    // Fire off another round of confetti
    if (this.confetti.length <= 10) {
      this.initConfetti();
    }

    window.requestAnimationFrame(() => this.render());
  }

  onResize() {
    this.resizeCanvas();
  }

  onClick() {
    this.initConfetti();
  }
}

interface Confetti {
  color: { front: string; back: string };
  dimensions: { x: number; y: number };
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  velocity: { x: number; y: number };
}
