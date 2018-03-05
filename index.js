const VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main(){\n' +
  '  gl_Position =  a_Position;\n' +
  '}\n';

const FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

window.onload = function () {
  let canvas = document.getElementById('webgl');
  let gl = canvas.getContext('webgl');

  // 分别创建顶点着色器对象与片元着色器对象
  let shader_V = gl.createShader(gl.VERTEX_SHADER);
  let shader_F = gl.createShader(gl.FRAGMENT_SHADER);

  // 向相应的着色器对象传入字符串源码
  gl.shaderSource(shader_V, VSHADER_SOURCE);
  gl.shaderSource(shader_F, FSHADER_SOURCE);

  // 编译顶点着色器源码
  gl.compileShader(shader_V);
  let isCompiled_V = gl.getShaderParameter(shader_V, gl.COMPILE_STATUS);
  if (!isCompiled_V) {
    throw new Error('compile Shader is failed');
  }

  // 编译片元着色器源码
  gl.compileShader(shader_F);
  let isCompiled_F = gl.getShaderParameter(shader_F, gl.COMPILE_STATUS);
  if (!isCompiled_F) {
    throw new Error('compile Shader is failed');
  }

  // 创建着色器程序
  let program = gl.createProgram();
  // 将着色器对象分配给着色器程序
  gl.attachShader(program, shader_V);
  gl.attachShader(program, shader_F);
  // 连接着色器程序
  gl.linkProgram(program);
  let isLinked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!isLinked) {
    throw new Error('link Shader is failed');
  }

  // 启用指定的着色器程序
  gl.useProgram(program);

  // 获取存储限定符类型变量地址
  let a_Position = gl.getAttribLocation(program, 'a_Position');
  let u_FragColor = gl.getUniformLocation(program, 'u_FragColor');

  // 传入颜色
  gl.uniform4fv(u_FragColor, [0.0, 1.0, 1.0, 1.0]);

  // 传入顶点数据
  let bezierPoint = create3DBezier(
    { x : -0.7,  y : 0,   z : 0 },    // p0
    { x : -0.25, y : 0.5, z : 0 },    // p1
    { x : 0.25,  y : 0.5, z : 0 },    // p2
    { x : 0.7,   y : 0,   z : 0 },    // p3
    20,
    1.0
  );

  let points = new Float32Array(bezierPoint);

  // 创建缓冲区
  let vertexBuffer = gl.createBuffer();
  // 绑定缓冲区
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // 向缓冲区写入数据
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
  // 分配缓冲区至指定着色器变量地址
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // 连接地址
  gl.enableVertexAttribArray(a_Position);


  // 设置颜色缓冲区清空颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // 清空颜色缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 绘制
  gl.drawArrays(gl.LINE_STRIP, 0, bezierPoint.length / 3);
};


/**
 * 生成四阶贝塞尔曲线定点数据
 * @param p0 {Object}   起始点  { x : number, y : number, z : number }
 * @param p1 {Object}   控制点1 { x : number, y : number, z : number }
 * @param p2 {Object}   控制点2 { x : number, y : number, z : number }
 * @param p3 {Object}   终止点  { x : number, y : number, z : number }
 * @param num {Number}  线条精度
 * @param tick {Number} 绘制系数
 * @returns {Array}
 */
function create3DBezier(p0, p1, p2, p3, num, tick) {
  let pointMum = num || 100;
  let _tick = tick || 1.0;
  let t = _tick / (pointMum - 1);
  let points = [];
  for (let i = 0; i < pointMum; i++) {
    let point = getBezierNowPoint(p0, p1, p2, p3, i, t);
    points.push(point.x);
    points.push(point.y);
    points.push(point.z);
  }

  return points;
}

/**
 * 四阶贝塞尔曲线公式
 * @param p0
 * @param p1
 * @param p2
 * @param p3
 * @param t
 * @returns {*}
 * @constructor
 */
function Bezier(p0, p1, p2, p3, t) {
  let P0, P1, P2, P3;
  P0 = p0 * (Math.pow((1 - t), 3));
  P1 = 3 * p1 * t * (Math.pow((1 - t), 2));
  P2 = 3 * p2 * Math.pow(t, 2) * (1 - t);
  P3 = p3 * Math.pow(t, 3);

  return P0 + P1 + P2 + P3;
}

/**
 * 获取四阶贝塞尔曲线中指定位置的点坐标
 * @param p0
 * @param p1
 * @param p2
 * @param p3
 * @param num
 * @param tick
 * @returns {{x, y, z}}
 */
function getBezierNowPoint(p0, p1, p2, p3, num, tick) {
  return {
    x : Bezier(p0.x, p1.x, p2.x, p3.x, num * tick),
    y : Bezier(p0.y, p1.y, p2.y, p3.y, num * tick),
    z : Bezier(p0.z, p1.z, p2.z, p3.z, num * tick),
  }
}

