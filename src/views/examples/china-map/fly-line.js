/*
 * @Description: 飞线 （shader）
 * @Author: 幺五六
 * @Date: 2020-08-18 15:35:19
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-08-18 17:53:22
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
// const TWEEN = require('@tweenjs/tween.js/dist/tween.cjs')

// 顶点着色器
const fs = `
  uniform sampler2D texture;
  varying float opacity;
  varying vec3 vexColor;
  void main() {
    gl_FragColor = vec4(vexColor,opacity);
    gl_FragColor = gl_FragColor * texture2D(texture,gl_PointCoord);
  }
`;
// 片源着色器
const vs = `
  attribute float size;
  attribute vec4 colors;
  varying float opacity;
  varying vec3 vexColor;
  void main() {
    vexColor.x = colors.r;
    vexColor.y = colors.g;
    vexColor.z = colors.b;
    // w分量为透明度
    opacity = colors.w;
    vec4 mvPosition = modelViewMatrix * vec4(position,1.0);
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export default class PointsFlyLine {
  /**
   * 
   * @param {THREE.Vector3[]} vecs 
   * @param {number} num 粒子数量
   * @param {number} size 粒子大小
   * @param {THREE.Color} color 
   */
  constructor(vecs, num, size, color) {
    // 曲线
    this._spline = new THREE.CatmullRomCurve3(vecs);
    // 粒子数量
    this._pointNumber = num;
    // 粒子间的总距离
    this._distance = this._spline.getLength();

    // 初始化粒子系统
    this._points = this._spline.getPoints(num);
    const colorsLen = this._points.length * 4;
    const sizeLen = this._points.length;
    const colors = new Float32Array(colorsLen);
    const sizes = new Float32Array(sizeLen);
    // 粒子几何体
    this._geometry = new THREE.BufferGeometry().setFromPoints(this._points);
    for (let i = 0, z = 0; i < colorsLen; i += 4, z++) {
      // color
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
      // opacity
      colors[i + 3] = (i + 3) / sizeLen;
      // size 小 --> 大 变化
      sizes[z] = size * (z / sizeLen);
    }
    this._geometry.setAttribute('colors', new THREE.BufferAttribute(colors, 4));
    this._geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // shader
    // console.log(this._createTexture(size));
    // const uniforms = {
    //   texture: {
    //     value: this._createTexture(size)
    //   }
    // }
    const uniforms = {
      texture: {
        value: () => {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 64;
          const context = canvas.getContext('2d');
          if (context != null) {
            context.fillStyle = 'rgba(255, 255, 255, .0)';
            context.beginPath();
            context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            context.fillStyle = 'white';
            context.fill();
            context.closePath();
          }
          return new THREE.CanvasTexture(canvas);
        }
      }
    }

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vs.trim(),
      fragmentShader: fs.trim(),
      transparent: true,
      depthTest: false
    });
    // 构建粒子系统
    this._particleSystem = new THREE.Points(this._geometry, shaderMaterial);

    // 动画
    this._tween = null;
  }

  // 开始飞线动画
  start() {
    const max = this._distance * 10;
    const end = this._pointNumber;
    const m = { start: 0, end };
    this._tween = this._tweenAnimate(m, { start: max - end, end: max }, 2000, null, () => {
      let pointArr = [];
      let s = Math.round(m.start), e = Math.floor(m.end);
      for (let i = s; i <= e && i <= max; i++) {
        pointArr = pointArr.concat(this._spline.getPointAt(i / max).toArray());
      }
      this._geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(pointArr), 3);
    });
    this._tween.repeat(Infinity).start();
  }

  // 停止飞线动画
  stop() {
    this._tween.stop();
  }

  /**
   * 创建 粒子材质（canvas）
   * @param {number} size 粒子大小
   */
  _createTexture(size) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');
    if (context != null) {
      context.fillStyle = 'rgba(255, 255, 255, .0)';
      context.beginPath();
      context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      context.fillStyle = 'white';
      context.fill();
      context.closePath();
    }
    return new THREE.CanvasTexture(canvas);
  }

  /**
   * 动画
   * @param {Object} current 
   * @param {Object} target 
   * @param {number} interval 
   * @param {TWEEN.Easing} animation 
   * @param {Function} onUpdate 
   * @param {Function} complete 
   */
  _tweenAnimate(current, target, interval, animation, onUpdate, onComplete) {
    const animate = animation? animation : TWEEN.Easing.Linear.None;
    const tween = new TWEEN.Tween(current).to(target, interval).easing(animate);
    onUpdate && tween.onUpdate(() => onUpdate());
    onComplete && tween.onComplete(() => onComplete());
    return tween;
  }
}