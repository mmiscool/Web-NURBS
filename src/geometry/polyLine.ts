import { mat4, Mat4, vec3, Vec3 } from "wgpu-matrix";
import { INSTANCE } from "../cad";
import { RenderLines } from "../render/renderLines";
import { RenderID } from "../scene/scene";
import { printMat4 } from "../utils/print";
import { BoundingBox } from "./boundingBox";
import { Geometry } from "./geometry";
import { LineBoundingBoxHeirarchy } from "./lineBoundingBoxHeirarchy";
import { Ray } from "./ray";


export class PolyLine extends Geometry {

  private renderLines!: RenderID;
  private boundingBox!: BoundingBox;
  private boundingBoxHeirarchy!: LineBoundingBoxHeirarchy;

  constructor(
    parent: Geometry | null,
    private points: Vec3[],
    private color: [number, number, number, number],
    model?: Mat4
  ) {
    super(parent);
    if (model) this.setModel(model);
    this.renderLines = 0;
    this.update();
  }

  public intersect(ray: Ray): number | null {
    return this.boundingBoxHeirarchy.almostIntersect(ray, this.points, 3);
  }

  public getBoundingBox(): BoundingBox {
    return this.boundingBox;
  }

  public getSegmentCount(): number {
    return this.points.length - 1;
  }

  public updateLastPoint(point: Vec3): void {
    this.points[this.points.length - 1] = point;
    this.update();
  }

  public removeLastPoint(): void {
    this.points.pop();
    this.update();
  }

  public addPoint(point: Vec3): void {
    this.points.push(point);
    this.update();
  }

  public delete(): void {
    INSTANCE.getScene().removeLines(this.renderLines);
  }

  private update(): void {
    if (this.renderLines) INSTANCE.getScene().removeLines(this.renderLines);
    const verts: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i < this.points.length; i++) {
      verts.push(...this.points[i], 1.0);
      indices.push(i, i + 1);
    }
    indices.pop(); indices.pop();
    printMat4(this.getModel());
    this.renderLines = INSTANCE.getScene().addRenderLines(new RenderLines(
      new Float32Array(verts),
      new Int32Array(indices),
      this.color,
      this.getModel()));

    this.updateBoundingBox();
    this.boundingBoxHeirarchy = new LineBoundingBoxHeirarchy(this.points, indices);
  }

  private updateBoundingBox(): void {
    this.boundingBox = new BoundingBox();
    const model: Mat4 = this.getModel();
    this.points.forEach((point: Vec3) => {
      this.boundingBox.addVec3(vec3.transformMat4(point, model));
    });
  }

}
