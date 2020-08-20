/*
 * @Description: 
 * @Author: 幺五六
 * @Date: 2020-07-29 11:11:10
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-08-20 16:06:15
 */ 
import * as THREE from 'three';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

import * as d3geo from 'd3-geo'
const TWEEN = require('@tweenjs/tween.js/dist/tween.cjs')

import { loadOBJ } from '../../../lib/model-loader'

// shader 飞线
import FlyLine2 from './fly-line2'
import FlyPointsLine from './fly-point-line'

export class Map3D {
  constructor(elementTo) {
    this.canvas = elementTo;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    // this.control = null;
    this._composer = null; // 后期处理
    this._map = null; // 地图
    this._stars = null; // 星空
    this._outlinePass = null; // 发光线
    this._outlinePassBox = null; // 发光线 --> 用于柱子

    this._flyLinegroup = { children: [] }; // shader 飞线
  }
  
  /**
   * 初始化环境
   */
  init() {
    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      // 在 css 中设置背景色透明显示渐变色
      alpha: true,
      // 开启抗锯齿
      antialias: true,
      autoClear: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#262c49');
    // 设置相机
    this._setCamera();
    // 设置灯光
    this._setLight();
    // 构建网格和坐标
    this._buildAuxSystem();

    // 构建星光
    this._buildStarForge();

    // 监听窗口变化
    window.addEventListener('resize', this._onWindowResize.bind(this), false);
    // 后期处理
    this._buildUnrealBloom();
  }

  /**
   * 渲染
   */
  render() {
    if (!this.renderer.autoClear) this.renderer.clear();
    // 星光的旋转
    this._stars.rotation.y += 0.001;
    // this.control.update();
    TWEEN.update();

    // 飞线动画
    if(this._flyLinegroup.children.length){
      for(let i = 0; i < this._flyLinegroup.children.length; i++){
        let flyline = this._flyLinegroup.children[i];
        if(flyline && flyline.material.uniforms){
          let time = flyline.material.uniforms.time.value;
          let size = flyline.material.uniforms.size.value;
          if (flyline.direction) {
            if(time > flyline.maxx){
              flyline.material.uniforms.time.value = flyline.minx - size;
            }
            flyline.material.uniforms.time.value += flyline.step;
          } else {
            if(time < (flyline.minx - size)){
              flyline.material.uniforms.time.value = flyline.maxx + size;
            }
            flyline.material.uniforms.time.value -= flyline.step;
          }
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
    this._composer.render();
  }

  /**
   * 渲染地图 GeoJson
   */
  initMap(geoJson) {
    // 建一个空对象存放对象 --> 用于后面的地图
    this._map = new THREE.Object3D()
    // d3-geo转化坐标
    const projection = d3geo.geoMercator().center([104.0, 37.5]).scale(70).translate([0, -10]);
     // 遍历省份构建模型
     geoJson.features.forEach(elem => {
      // 新建一个省份容器：用来存放省份对应的模型和轮廓线
      const province = new THREE.Object3D();
      const coordinates = elem.geometry.coordinates;
      // 有的地区可能是多个区域闭环
      coordinates.forEach(multiPolygon => {
        multiPolygon.forEach(polygon => {
          // 这里的坐标要做2次使用：1次用来构建模型，1次用来构建轮廓线
          const shape = new THREE.Shape();
          const lineMaterial = new THREE.LineBasicMaterial({ color: 'rgb(115,103,240)' });
          const linGeometry = new THREE.Geometry();
          for (let i = 0; i < polygon.length; i++) {
            const [x, y] = projection(polygon[i]);
            if (i === 0) {
              shape.moveTo(x, -y);
            }
            shape.lineTo(x, -y);
            linGeometry.vertices.push(new THREE.Vector3(x, -y, 4.01));
          }
          const extrudeSettings = {
            depth: 4,
            bevelEnabled: false
          };
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          const material = new THREE.MeshBasicMaterial({ color: 'rgb(115,103,240)', transparent: true, opacity: 0.6 });
          const mesh = new THREE.Mesh(geometry, material);
          const line = new THREE.Line(linGeometry, lineMaterial);
          province.add(mesh);
          province.add(line);
        })
      })
      // 将geojson的properties放到模型中，后面会用到
      province.properties = elem.properties;
      if (elem.properties.centroid) {
        const [x, y] = projection(elem.properties.centroid);
        province.properties._centroid = [x, y];
      }
      this._map.add(province);
    })
    this._map.rotation.x = -Math.PI / 2;
    this.scene.add(this._map);
    // 边缘加发光特效
    this._outlinePass.selectedObjects = [this._map];
  }

  // shader 飞线
  initShaderFlyLine() {
    const targets = ['山西省', '湖北省', '新疆维吾尔自治区', '辽宁省', '甘肃省'];
    const flyStart = this._map.children.find(x => x.properties.name === '北京市').properties._centroid;
    const flyEnd = this._map.children.filter(x => targets.findIndex(y => y === x.properties.name) > -1).map(x => x.properties._centroid);
    const startPoint = { x: flyStart[0], y: 4.01, z: flyStart[1] };
    // 存储飞线坐标点，用于添加地理标识
    const points = [], flyPositions = [];
    points.push(startPoint);
    flyEnd.forEach(item => {
      const endPoint = { x: item[0], y: 4.01, z: item[1] };
      points.push(endPoint);
      flyPositions.push({ start: startPoint, end: endPoint });
    })

    // shader 飞线
    const fly = new FlyPointsLine();
    fly.addLineBatch(flyPositions, { r: 0.663, g: 0.98, b: 0.6 }, { r: 0.208, g: 0.623, b: 0.697});
    // fly.addLine(flyPositions[4].start, flyPositions[4].end, { r: 0.663, g: 0.98, b: 0.6 }, { r: 0.208, g: 0.623, b: 0.697})
    this._flyLinegroup = fly.getLineGroup();

    // 基础 Line2 飞线
    const flyLine2 = new FlyLine2(TWEEN);
    flyLine2.addLineBatch(flyPositions, 2000, { color: 'rgb(255,255,255)', linewidth: 3 });
    const flyLine2Group = flyLine2.getLineGroup();

    this.scene.add(flyLine2Group);
    this.scene.add(this._flyLinegroup);
    
    // 添加风机模型
    this._addTurbineModel(points);
  }


  /**
   * 添加风机模型
   * @param {array} points [{x, y, z}]
   */
  _addTurbineModel(points) {
    // 将飞线坐标点加入风机模型
    loadOBJ('/3d/wind-turbine2.obj', '').then(obj => {
      points.forEach(point => {
        // 为了呈现更清晰。将模型缩小
        obj.scale.set(0.003,0.003,0.003);
        // 调整显示角度
        obj.rotation.set(0, 0, 0);
        // 设置显示位置坐标
        obj.position.set(point.x, 4.01, point.z);
        // 将 模型 加入场景
        const objClone = obj.clone();
        this.scene.add(objClone);
        const objects = this._outlinePassBox.selectedObjects;
        objects.push(objClone);
        this._outlinePassBox.selectedObjects = objects;
      })
    });
  }

  /**
   * 构建光柱
   * @param {object} point 三维坐标
   */
  _buildLightBox(point) {
    const height = 10;
    const geometry = new THREE.BoxBufferGeometry(1, height, 1);
    const texture = new THREE.TextureLoader().load('/3d/Textures/tri_pattern.jpg');
    const material = new THREE.MeshBasicMaterial({ color: 'rgb(255, 255, 255)', transparent: true, opacity: 0.6, map: texture });
    const box = new THREE.Mesh(geometry, material);
    box.position.set(point.x, height / 2 + point.y, point.z);
    return box;
  }

  /**
   * 构建后期 光晕效果
   */
  _buildUnrealBloom() {
    const outlineParams = {
      pulsePeriod: 7, // 发光闪烁的频率
      edgeThickness: 2, // 边缘浓度
      edgeGlow: 3, // 发光强度
      edgeStrength: 3, // 发光的扩散强度
      visibleEdgeColor: new THREE.Color("rgb(115,103,240)"),
      hiddenEdgeColor: new THREE.Color("rgb(115,103,240)")
    };
    const outlineBoxParams = {
      pulsePeriod: 8, // 发光闪烁的频率
      edgeThickness: 2, // 边缘浓度
      edgeGlow: 1, // 发光强度
      edgeStrength: 1, // 发光的扩散强度
    };

    this._composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this._composer.addPass(renderPass);

    this._outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
    this._outlinePass.edgeGlow = outlineParams.edgeGlow;
    this._outlinePass.edgeStrength = outlineParams.edgeStrength;
    this._outlinePass.visibleEdgeColor = outlineParams.visibleEdgeColor;
    this._outlinePass.hiddenEdgeColor = outlineParams.hiddenEdgeColor;
    this._outlinePass.edgeThickness = outlineParams.edgeThickness;
    this._outlinePass.pulsePeriod = outlineParams.pulsePeriod;

    
    this._outlinePassBox = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
    this._outlinePassBox.edgeGlow = outlineBoxParams.edgeGlow;
    this._outlinePassBox.edgeStrength = outlineBoxParams.edgeStrength;
    this._outlinePassBox.edgeThickness = outlineBoxParams.edgeThickness;
    this._outlinePassBox.pulsePeriod = outlineBoxParams.pulsePeriod;
    
    
    this._composer.addPass(this._outlinePass);
    this._composer.addPass(this._outlinePassBox);
    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    this._composer.addPass(effectFXAA);
  }

  /**
   * 构建粒子系统 --> 模拟星空
   */
  _buildStarForge() {
    const starQty = 100000;
    const geometry = new THREE.SphereGeometry(1000, 100, 50);
    const materialOptions = {
      size: 1.0,
      premultipliedAlpha: 0.1,
      opacity: 0.7
    };
    const starStuff = new THREE.PointsMaterial(materialOptions);
    for (let i = 0; i < starQty; i++) {
      const starVertex = new THREE.Vector3();
      starVertex.x = Math.random() * 2000 - 1000;
      starVertex.y = Math.random() * 2000 - 1000;
      starVertex.z = Math.random() * 2000 - 1000;
      geometry.vertices.push(starVertex);
    }
    this._stars = new THREE.Points(geometry, starStuff);
    this.scene.add(this._stars);
  }

  /**
   * 构建网格和坐标和控制系统
   */
  _buildAuxSystem() {
    // 三维坐标轴
    let axisHelper = new THREE.AxesHelper(100);
    this.scene.add(axisHelper);
    // 网格
    // const circle = new THREE.PolarGridHelper(1000, 1, 50, 64, 'rgb(80, 89, 136)', 'rgb(80, 89, 136)');
    let grid = new THREE.GridHelper(1000, 100, 'rgb(50, 58, 93)', 'rgb(50, 58, 93)');
    // this.scene.add(circle);
    this.scene.add(grid);
    let controls = new OrbitControls(this.camera, this.renderer.domElement.parentNode);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.rotateSpeed = 0.35;
  }

  /**
   * 设置相机
   */
  _setCamera() {
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.set(0, 70, 90);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * 设置灯光系统
   */
  _setLight() {
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
    directionalLight.position.set(300, 1000, 500);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;

    // let d = 300;
    const fov = 45 //拍摄距离  视野角值越大，场景中的物体越小
    const near = 1 //相机离视体积最近的距离
    const far = 1000//相机离视体积最远的距离
    const aspect = window.innerWidth / window.innerHeight; //纵横比
    directionalLight.shadow.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    directionalLight.shadow.bias = 0.0001;
    directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(directionalLight)

    // const sphere = new THREE.SphereBufferGeometry( 0.5, 16, 8 );
    // const light = new THREE.PointLight(0xff0040, 2, 0);
    // light.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0040 })));
    // light.position.set(0, 20, 0);
    // this.scene.add(light);
    // let light = new THREE.AmbientLight(0xffffff, 0.6)
    // this.scene.add(light);
  }

  _onWindowResize () {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this._composer.setSize(window.innerWidth, window.innerHeight);
  }
}