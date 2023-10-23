import { INSTANCE } from "../cad";



export class ClickHandler {

  private mouseDown: boolean;
  private shiftDown: boolean;
  private controlDown: boolean;
  private drag: Drag | null;

  constructor() {
    this.mouseDown = false;
    this.shiftDown = false;
    this.controlDown = false;
    this.drag = null;
  }

  public onMouseMove(event: MouseEvent): void {
    this.drag?.update(event.clientX, event.clientY);
  }

  public onMouseDown(event: MouseEvent): void {
    if (event.button == 0) { // left click

      this.drag = new Drag(event.clientX, event.clientY);
      this.mouseDown = true;
      this.shiftDown = event.shiftKey;
      this.controlDown = event.ctrlKey;

    }
  }

  public onMouseUp(event: MouseEvent): void {
    if (event.button == 0) { // left click

      if (!this.drag!.isDrag()) {
        INSTANCE.getCommandManager().handleClickInput(event);
        INSTANCE.getCli().render();
      }

      this.drag!.destroy();
      this.drag = null;
      this.mouseDown = false;

    }
  }

}


class Drag {

  private x2!: number;
  private y2!: number;
  private element: HTMLDivElement;

  constructor(
    private x1: number,
    private y1: number,
  ) {
    this.element = <HTMLDivElement>document.getElementById("selection-rectangle");
    this.update(this.x1, this.y1);
    this.element.hidden = false;
  }

  public update(x: number, y: number): void {
    this.x2 = x;
    this.y2 = y;

    const top = Math.min(this.y1, this.y2);
    const bottom = Math.max(this.y1, this.y2);
    const left = Math.min(this.x1, this.x2);
    const right = Math.max(this.x1, this.x2);

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
    this.element.style.width = `${right - left}px`;
    this.element.style.height = `${bottom - top}px`;
  }

  public isDrag(): boolean {
    return this.x1 != this.x2 || this.y1 != this.y2;
  }

  public destroy(): void {
    this.element.hidden = true;
  }



}
