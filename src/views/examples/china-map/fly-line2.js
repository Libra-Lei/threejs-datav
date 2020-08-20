/*
 * @Description: 飞线 -- THREE Line2
 * @Author: 幺五六
 * @Date: 2020-08-18 15:35:19
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-08-20 16:04:10
 */
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import * as THREE from 'three';

export default class FlyLine2 {
  constructor(tween) {
    this._TWEEN = tween;
    this._lineGroup = new THREE.Group();
  }

  /**
   * get line group
   */
  getLineGroup() {
    return this._lineGroup;
  }

  /**
   * 构建飞线 -- THREE.Line2
   * @param start 起始坐标
   * @param end 结束坐标
   * @param flyTime 动画飞行时间
   * @param lineStyle 飞线样式
   */
  addLine(start, end, flyTime, lineStyle) {
    const middleCurveX = (start.x + end.x) / 2;
    const middleCurveY = start.y + 10;
    const middleCurveZ = (start.z + start.z) / 2;
    const curveData = new THREE.CubicBezierCurve3(
      new THREE.Vector3(start.x, start.y, start.z), // 起点
      new THREE.Vector3(middleCurveX, middleCurveY, middleCurveZ), // 第一个控制点
      new THREE.Vector3(middleCurveX, middleCurveY + 10, middleCurveZ), // 第二个控制点
      new THREE.Vector3(end.x, end.y, end.z) // 终点
    );

    // 将曲线划分成的段数 --> 这里是 50 + 1 段
    const curveModelData = curveData.getPoints(50);

    const lineGeometry = new LineGeometry();
    const temp = curveModelData.slice(0, 1).map(vector3 => { return [vector3.x, vector3.y, vector3.z] });
    lineGeometry.setPositions(temp.reduce((pre, curr) => pre.concat(curr), []));

    const lineMaterial = new LineMaterial({
      color: lineStyle.color,
      linewidth: lineStyle.linewidth, // in pixels
      dashed: false,
      opacity: 0.7
    });
    const curve = new Line2(lineGeometry, lineMaterial);
    //下面这句代码很关键，不然图形画不出来
    lineMaterial.resolution.set(window.innerWidth, window.innerHeight);

    // // 补间动画 --> Tweenjs
    new this._TWEEN.Tween({ y: 1 })
      .to(
        { y: 50 },
        flyTime
      )
      .onUpdate(tweenHandler)
      .start();
    this._lineGroup.add(curve);

    // 动画更新回调
    function tweenHandler() {
      const endPointIndex = Math.ceil(this._object.y);
      const curvePartialData = new THREE.CatmullRomCurve3(
        curveModelData.slice(0, endPointIndex)
      );
      const temp1 = curvePartialData.getPoints(50).map(vector3 => { return [vector3.x, vector3.y, vector3.z] });
      curve.geometry.setPositions(temp1.reduce((pre, curr) => pre.concat(curr), []));
      curve.geometry.verticesNeedUpdate = true;
    }
  }

  /**
   * 批量添加 飞线
   * @param {array} positions [{ start: {x, y, z}, end: {x, y, z} }]
   * @param {number} flyTime 飞行时间
   * @param {object} lineStyle { color: 'rgb(115,103,240)', linewidth: 3 }
   */
  addLineBatch(positions, flyTime, lineStyle) {
    if (!positions || !positions.length) return;
    positions.forEach(position => {
      this.addLine(position.start, position.end, flyTime, lineStyle);
    });
  }
}