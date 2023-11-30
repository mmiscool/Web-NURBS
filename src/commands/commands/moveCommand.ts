import { mat4, Mat4, vec3, Vec3 } from "wgpu-matrix";
import { INSTANCE } from "../../cad";
import { Geometry } from "../../geometry/geometry";
import { Intersection } from "../../geometry/intersection";
import { Clicker } from "../clicker";
import { Command } from "../command";

enum MoveCommandMode {
  SelectPointToMoveFrom,
  SelectPointToMoveTo,
}

export class MoveCommand extends Command {

  private finished: boolean;
  private mode: MoveCommandMode;
  private pointToMoveFrom: Vec3 | null;
  private clicker: Clicker;

  constructor() {
    super();
    this.finished = false;
    this.mode = MoveCommandMode.SelectPointToMoveFrom;
    this.pointToMoveFrom = null;
    this.clicker = new Clicker();

    const selection: Set<Geometry> = INSTANCE.getSelector().getSelection();
    if (selection.size === 0) {
      this.done();
      return;
    }
  }

  handleInputString(input: string): void {
    if (input == "0") {
      INSTANCE.getMover().setTransform(mat4.identity());
      const selection: Set<Geometry> = INSTANCE.getSelector().getSelection();
      for (const geo of selection) {
        geo.onSelectionMoved();
      }
      this.done();
    }
  }

  handleClickResult(intersection: Intersection): void {
    switch (this.mode) {
      case MoveCommandMode.SelectPointToMoveFrom:
        this.pointToMoveFrom = intersection.point;
        this.mode = MoveCommandMode.SelectPointToMoveTo;
        this.clicker.reset();
        break;
      case MoveCommandMode.SelectPointToMoveTo:
        const translation: Vec3 = vec3.sub(intersection.point, this.pointToMoveFrom!);
        const translationTransform: Mat4 = mat4.translation(translation);

        INSTANCE.getMover().setTransform(translationTransform);

        this.done();
        break;
      default:
        throw new Error("case not implemented");
    }
  }

  handleClick(): void {
    this.clicker.click();
  }

  handleMouseMove(): void {
    this.clicker.onMouseMove();
    if (this.mode == MoveCommandMode.SelectPointToMoveTo) {
      const point: Vec3 | null = this.clicker.getPoint();
      if (point) {
        const translation: Vec3 = vec3.sub(point, this.pointToMoveFrom!);
        const translationTransform: Mat4 = mat4.translation(translation);
        INSTANCE.getMover().setTransform(translationTransform);
        const selection: Set<Geometry> = INSTANCE.getSelector().getSelection();
        for (const geo of selection) {
          geo.onSelectionMoved();
        }
      }
    }
  }

  getInstructions(): string {
    switch (this.mode) {
      case MoveCommandMode.SelectPointToMoveFrom:
        return "0:Exit  Click point to move from.  $";
      case MoveCommandMode.SelectPointToMoveTo:
        return "0:Exit  Click point to move to.  $";
      default:
        throw new Error("case not implemented");
    }
  }
  isFinished(): boolean {
    return this.finished;
  }

  private done() {
    this.finished = true;
    this.clicker.destroy();
    const selection: Set<Geometry> = INSTANCE.getSelector().getSelection();
    for (const geo of selection) {
      INSTANCE.getScene().removeGeometry(geo);
      geo.bakeSelectionTransform();
      INSTANCE.getScene().addGeometry(geo);
    }
    INSTANCE.getMover().updatedSelection();
  }

}
