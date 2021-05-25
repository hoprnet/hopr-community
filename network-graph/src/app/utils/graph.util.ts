export class GraphUtil {
  public static calculateNodeRadius(weight: number): number {
    return Math.min(10, Math.max(5, weight / 10));
  }

  public static calculateEdgeWidth(strength: number): number {
    return Math.max(1, strength / 10);
  }
}
