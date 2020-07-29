/*
 * @Description: 
 * @Author: 幺五六
 * @Date: 2020-07-29 11:13:08
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-07-29 14:37:07
 */ 

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

/**
 * OBJ格式 模型文件加载 (异步)
 * @param {string} modelPath obj 模型文件路径
 * @param {string} texturePath 纹理 文件路径
 * @return promise
 */
export function loadOBJ(modelPath, texturePath) {
  // OBJ模型加载器
  const objLoader = new OBJLoader();
  const textureLoader = new THREE.TextureLoader();
  return new Promise((resolve, reject) => {
    let texture = null;
    if (texturePath) {
      texture = textureLoader.load(texturePath);
    }
    objLoader.load(
      modelPath,
      obj => {
        console.log('OBJ模型 加载成功:::', obj);
        obj.traverse(child => {
          if (child instanceof THREE.Mesh) {
            if (texture) child.material.map = texture;
            // child.material.ambient.setHex(0xFF0000);
            child.material.color.set(new THREE.Color('rgb(255,255,255)'));
            child.material.opacity = 0.6;
          }
        });
        resolve(obj);
      },
      xhr => {
        // 模型加载进度
        console.log('OBJ模型 正在加载:::', xhr.loaded, xhr.total);
      },
      err => {
        console.error('OBJ模型 加载失败:::', err);
        reject(err);
      }
    );
  })
}