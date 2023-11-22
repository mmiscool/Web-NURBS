import { mat4, Mat4, vec3, Vec3 } from "wgpu-matrix";
import { INSTANCE } from "../../cad";
import { Geometry } from "../../geometry/geometry";
import { Intersection } from "../../geometry/intersection";
import { ObjectID } from "../../scene/scene";
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
  private objectsToMove: Map<Geometry, Mat4>;

  constructor() {
    super();
    this.finished = false;
    this.mode = MoveCommandMode.SelectPointToMoveFrom;
    this.pointToMoveFrom = null;
    this.clicker = new Clicker();
    this.objectsToMove = new Map<Geometry, Mat4>;

    const selection: Set<ObjectID> = INSTANCE.getSelector().getSelection();
    if (selection.size === 0) {
      this.done();
      return;
    }
    for (const id of selection) {
      const geo: Geometry = INSTANCE.getScene().getGeometry(id);
      this.objectsToMove.set(
        geo, geo.getModel()
      );
      INSTANCE.getScene().removeGeometry(geo);
    }
  }

  handleInputString(input: string): void {
    //TODO:
    if (input == "0") {
      for (const [geo, transform] of this.objectsToMove) {
        geo.setModel(transform);
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
      case MoveCommandMode.SelectPointToMoveTo:
        const translation: Vec3 = vec3.sub(intersection.point, this.pointToMoveFrom!);
        const translationTransform: Mat4 = mat4.translation(translation);
        for (const [geo, model] of this.objectsToMove) {
          geo.setModel(mat4.mul(translationTransform, model));
        }
        this.done();
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
        for (const [geo, model] of this.objectsToMove) {
          geo.setModel(mat4.mul(translationTransform, model));
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
    for (let geo of this.objectsToMove.keys()) {
      INSTANCE.getScene().addGeometry(geo);
    }
  }

}
