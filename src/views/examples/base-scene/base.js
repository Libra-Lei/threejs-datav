/*
 * @Description: 最简单的渲染一个 box 的示例
 * @Author: 幺五六
 * @Date: 2020-07-31 13:59:07
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-07-31 16:44:34
 */ 
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default class BaseRender {
  /**
   * @param {Element} canvasElement 要渲染的画布 canvas 元素
   * @param {Element} canvasContainerElement 包裹 canvas 的元素
   */
  constructor(canvasElement, canvasContainerElement) {
    // 当窗口尺寸变化时，用于动态调整 渲染器 大小
    this._canvasContainer = canvasContainerElement;
    this.canvas = canvasElement;
    this.scene = null; // 场景
    this.renderer = null; // 渲染器
    this._orbitControl = null; // 控制器
    
    // 渲染画布大小
    const canvasReact = this._canvasContainer.getBoundingClientRect();
    this.WIDTH = canvasReact.width;
    this.HEIGHT = canvasReact.height;
  }

  /**
   * 初始化 -- 就是准备演出舞台
   */
  init() {
    // 创建 场景
    this._setScene();
    // 创建 渲染器
    this._setRenderer();
    // 设置 相机
    this._setCamera();
    // 添加灯光 --> 无论何时，心中要有光，没有光的世界是黑暗的
    this._setLights();
    // 控制器
    this._setControl();

    // 准备演员登场
    this._addBox();

    // 窗口尺寸变化监听
    window.addEventListener('resize', this._onWindowResize.bind(this), false);
  }

  /**
   * 渲染到画布
   */
  render() {
    // 渲染
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 向场景中添加一个几何体，用于示例展示 -- 就是安排演员上场
   */
  _addBox() {
    // 舞台（场景、渲染器、灯光）已经准备就绪，接下来就是 “演员”（物体）登场（物体加入场景scene）

    // 创建几何体属性
    const geometry = new THREE.BoxBufferGeometry(10, 10, 10);
    // 创建几何体材质 -- 我把它理解为 “皮肤”，就是游戏里要花钱买的那种，哈哈
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // 给“几何属性”（geometry）穿上 好看的 “皮肤”（material） --> 一个物体就诞生了
    const box = new THREE.Mesh(geometry, material);
    // 设置一下这个正方体的倾斜角度，便于看出来是个3D物体
    box.rotation.set(2, 2, 2);
    // 将物体加入 场景（scene）中；
    this.scene.add(box);
  }

  /**
   * 窗口 resize 监听回调
   */
  _onWindowResize () {
    if (!this.renderer) return;
    const canvasReact = this._canvasContainer.getBoundingClientRect();
    this.WIDTH = canvasReact.width;
    this.HEIGHT = canvasReact.height;
    this.camera.aspect = this.WIDTH / this.HEIGHT;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
  }

  /**
   * 控制器
   */
  _setControl() {
    // 添加控制器, 控制场景中物体的旋转缩放等 -- 就是一个演出需要有导演控场
    this._orbitControl = new OrbitControls(this.camera, this.renderer.domElement);
  }

  /**
   * 场景
   */
  _setScene() {
    // 创建场景
    this.scene = new THREE.Scene();
    // 设置场景的背景
    this.scene.background = new THREE.Color('#262c49');
  }

  /**
   * 渲染器
   */
  _setRenderer() {
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      // 抗锯齿
      antialias: true
    });
    // 定义渲染器是否在渲染每一帧之前自动清除其输出
    this.renderer.autoClear = true;
    // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出canvas的大小调整为(width, height)并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
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
  _setLights() {
    // 创建环境光
    const ambientLight = new THREE.AmbientLight(0xdc8874, .2);
    // 将环境光 加入场景
    this.scene.add(ambientLight);
  }
}