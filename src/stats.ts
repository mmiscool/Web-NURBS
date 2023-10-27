
export class RenderStats {

  //private element: HTMLDivElement;
  private renderTime!: number;
  private frameTime!: number;
  private sceneTime!: number;
  private framesOver100ms!: number;
  private totalFrames!: number;
  private startTime!: number;
  private drawCalls!: number;

  constructor() {
    this.reset();
  }

  public reset(): void {

    this.renderTime = NaN;
    this.frameTime = NaN;
    this.sceneTime = NaN;
    this.framesOver100ms = 0;
    this.totalFrames = 0;
    this.startTime = Date.now();
  }

  public setRenderTime(renderTime: number): void {
    this.renderTime = renderTime;
  }

  public setFrameTime(frameTime: number): void {
    this.totalFrames++;
    if (frameTime > 0.1) this.framesOver100ms++;
    this.frameTime = frameTime;
  }

  public setSceneTime(sceneTime: number): void {
    this.sceneTime = sceneTime;
  }

  public setDrawCalls(count: number): void {
    this.drawCalls = count;
  }

  public getInnerHTML(): string {
    const fps: string = (1.0 / this.frameTime).toFixed(3);
    const averageFps: string = (1000.0 * this.totalFrames / (Date.now() - this.startTime)).toFixed(3);
    const html: string = "<u>STATS:</u><br>" +
      "<br>" +
      "FPS: " + fps + "<br>" +
      "Average FPS: " + averageFps + "<br>" +
      "<br>" +
      "Render Time: " + this.renderTime?.toFixed(3) + "<br>" +
      "Frame Time: " + this.frameTime?.toFixed(3) + "<br>" +
      "Scene Time: " + this.sceneTime?.toFixed(3) + "<br>" +
      "<br>" +
      "Frames Over 100ms: " + this.framesOver100ms.toString() + "<br>" +
      "<br>" +
      "Draw Calls: " + this.drawCalls?.toString();
    return html;
  }


};

