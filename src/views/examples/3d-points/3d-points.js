/*
 * @Description: 
 * @Author: 幺五六
 * @Date: 2020-07-29 15:44:02
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-08-03 11:38:53
 */ 
import * as THREE from 'three';

export default class ThreePoints {
  /**
   * @param {Element} canvasElement 要渲染的画布 canvas 元素
   * @param {Element} canvasContainerElement 包裹 canvas 的元素
   */
  constructor(canvasElement, canvasContainerElement) {
    // 当窗口尺寸变化时，用于动态调整 渲染器 大小
    this._canvasContainer = canvasContainerElement;
    this.canvas = canvasElement;
    this.scene = null;
    this.renderer = null;
    
    this.canvasReact = this._canvasContainer.getBoundingClientRect();
    this.WIDTH = this.canvasReact.width;
    this.HEIGHT = this.canvasReact.height;
  }

  /**
   * 舞台准备
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

    // 窗口尺寸变化监听
    window.addEventListener('resize', this._onWindowResize.bind(this), false);
  }

  /**
   * 演员登场
   */
  addObject() {
     // 红色方块
     const cube = new THREE.BoxGeometry(20, 20, 20);
     const mat = new THREE.MeshPhongMaterial({
         color: new THREE.Color(0xff0000)
     });
     const m_cube = new THREE.Mesh(cube, mat);
     m_cube.castShadow = true;
     m_cube.position.x = -20;
 
     // 白色方块
     const cube2 = new THREE.BoxGeometry(20, 20, 20);
     const mat2 = new THREE.MeshPhongMaterial({
         color: new THREE.Color(0xffffff)
     });
     const m_cube2 = new THREE.Mesh(cube2, mat2);
     m_cube2.castShadow = true;
     m_cube2.position.x = 20;
 
     // 物体添加至场景
     this.scene.add(m_cube);
     this.scene.add(m_cube2);
  }

  /**
   * Action: 演出开始
   */
  render() {
    // if (!this.renderer.autoClear) this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 窗口 resize 监听回调
   */
  _onWindowResize () {
    if (!this.renderer) return;
    setTimeout(() => {
      const canvasReact = this._canvasContainer.getBoundingClientRect();
      this.WIDTH = canvasReact.width;
      this.HEIGHT = canvasReact.height;
      console.log('HEIGHT: ', canvasReact, this.WIDTH, this.HEIGHT);
      this.camera.aspect = this.WIDTH / this.HEIGHT;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.WIDTH, this.HEIGHT);
    }, 100);
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
    // 渲染背景颜色设置为雾化的颜色
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
  _setLights() {
    /**
     * 因为：单一光源（平行光），场景略显暗淡，而且当光源不是白色时，可能会和物体颜色混合，从而产生不可预料的颜色偏差
     * 所以：设置了半球光源和环境光源，来弱化光色吸收
     */
    // 半球光光源: 光线颜色从天空颜色渐变到地面颜色；第一个参数是天空的颜色，第二个参数是地上的颜色，第三个参数是光源的强度；
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);
    // 环境光源：均匀照亮所有物体，没有方向
    const ambientLight = new THREE.AmbientLight(0xdc8874, .2);

    // 平行光（太阳光）: 从无限远，沿着特定方向发出的光线
    const shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    // 设置光源的位置方向
    shadowLight.position.set(50, 50, 50);
    // 开启平行光产生动态阴影
    // 警告: 这样做的代价比较高而且需要一直调整到阴影看起来正确. 
    shadowLight.castShadow = true;
    // 定义可见域的投射阴影
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;
    // 定义阴影的分辨率；虽然分辨率越高越好，但是需要付出更加昂贵的代价维持高性能的表现。
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    // 为了使这些光源呈现效果，需要将它们添加到场景中
    this.scene.add(hemisphereLight);
    this.scene.add(shadowLight);
    this.scene.add(ambientLight);
  }
}