main();

function NormalisedToDevice(coord, axisSize){
  var halfAxisSize = axisSize / 2;

  var deviceCoord = ( coord + 1 ) *halfAxisSize;


  return deviceCoord;
}

function DeviceToNormalised(coord, axisSize){
  var halfAxisSize = axisSize / 2;

  var normaliseCoord = ( coord /halfAxisSize ) -1;


  return normaliseCoord;
}


function main(){
  const canvas = document.querySelector("#glcanvas");
  const gl = canvas.getContext ("webgl");

  if( !gl ){
    alert("Unable to setup WEBGL. Your browser or computer may not support it;")
    return;
  }

  var vertices = [
  -0.5, 0.5 , 0.0, //1
  -0.5, -0.5, 0.0, //2
  0.5, -0.5, 0.0, //3
  0.5, 0.5, 0.0 // 4
  ];

 var indices = [ 3, 2, 1, 3, 1, 0 ];
  var vertex_buffer = gl.createBuffer();
 
  gl.bindBuffer( gl.ARRAY_BUFFER, vertex_buffer);

  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

   var Index_Buffer = gl.createBuffer();
  
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  var vertCode= 
    'attribute vec3 coordinates;' + 
    'void main(void)' +
    '{' +
      'gl_Position= vec4(coordinates, 1.0);'+
      'gl_PointSize=10.0;' +
    '}'

  var vertShade = gl.createShader( gl.VERTEX_SHADER);

  gl.shaderSource(vertShade, vertCode);

  gl.compileShader(vertShade);

  var fragCode=
    'void main(void)' +
    '{' +
        'gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);'+
      '}';
  
  var fragShade = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShade, fragCode);

  gl.compileShader(fragShade);

  var shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertShade);
  gl.attachShader(shaderProgram, fragShade);

  gl.linkProgram(shaderProgram);
  
  gl.useProgram(shaderProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);

  var coord = gl.getAttribLocation(shaderProgram, "coordinates");

  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0 ,0);

  gl.enableVertexAttribArray(coord);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(1.0, 0.0, 0.0, 0.0 );
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.viewport(0, 0, canvas.width, canvas.height);

   gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

}