/*
 * @Description: 
 * @Author: 幺五六
 * @Date: 2020-07-29 15:44:02
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-07-31 14:16:53
 */ 
import * as THREE from 'three';

export default class ThreePoints {
  constructor(elementTo) {
    this.canvas = elementTo;
    this.scene = null;
    this.renderer = null;
    
    this.canvasReact = this.canvas.getBoundingClientRect();
    this.WIDTH = this.canvasReact.width;
    this.HEIGHT = this.canvasReact.height;
  }

  init() {
    // 创建 场景
    this._setScene();
    // 创建 渲染器
    this._setRenderer();
    // 设置 相机
    this._setCamera();

    // 添加灯光 --> 无论何时，心中要有光，没有光的世界是黑暗的
    this._setLights();

    // 窗口尺寸变化监听
    window.addEventListener('resize', this._onWindowResize.bind(this), false);
  }

  render() {
    // if (!this.renderer.autoClear) this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 窗口 resize 监听回调
   */
  _onWindowResize () {
    if (!this.renderer) return;
    this.WIDTH = this.canvasReact.height;
    this.HEIGHT = this.canvasReact.width;
    this.camera.aspect = this.WIDTH / this.HEIGHT;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
  }

  /**
   * 场景
   */
  _setScene() {
    // 创建场景
    this.scene = new THREE.Scene();
    // 在场景中添加雾的效果，参数分别代表‘雾的颜色’、‘开始雾化的视线距离’、刚好雾化至看不见的视线距离’
    this.scene.fog = new THREE.Fog(0x090918, 1, 600);
  }

  /**
   * 渲染器
   */
  _setRenderer() {
    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      // canvas是否包含alpha (透明度)
      alpha: true,
      // 抗锯齿
      antialias: true
    });
    // 定义渲染器是否在渲染每一帧之前自动清除其输出
    this.renderer.autoClear = true;
    // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    // 渲染背景颜色同雾化的颜色
    this.renderer.setClearColor(this.scene.fog.color);
    // 打开渲染器的阴影贴图
    this.renderer.shadowMap.enabled = true;
    // 类型：过滤器阴影地图使用百分比-接近滤波(PCF)算法与更好的软阴影，特别是当使用低分辨率阴影地图
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  /**
   * 设置相机
   */
  _setCamera() {
    // 创建相机
    const aspectRatio = this.WIDTH / this.HEIGHT;
    const fieldOfView = 60;
    const nearPlane = 1;
    const farPlane = 10000;
    /**
     * PerspectiveCamera 透视投影相机
     * @param fieldOfView 视角
     * @param aspectRatio 纵横比
     * @param nearPlane 近平面
     * @param farPlane 远平面
     */
    this.camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );

    // 设置相机的位置
    this.camera.position.x = 0;
    this.camera.position.z = 150;
    this.camera.position.y = 0;
  }

  /**
   * 创建灯光系统
   */
  _setLights() {}
}