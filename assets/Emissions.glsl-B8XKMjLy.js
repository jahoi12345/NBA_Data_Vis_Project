import{aA as h}from"./jsonMap-Bs3hmeCU.js";import{p as x}from"./Color-CERqXxxY.js";const n=(e,...s)=>{let t="";for(let r=0;r<s.length;r++)t+=e[r]+s[r];return t+=e[e.length-1],t};function m(e,s,t=""){return e?s:t}n.int=e=>Math.round(e).toString(),n.float=e=>e.toPrecision(8);let u=class{constructor(s,t,r,i,o=null){if(this.name=s,this.type=t,this.arraySize=o,this.bind={0:null,1:null,2:null},i)switch(r){case void 0:break;case 0:this.bind[0]=i;break;case 1:this.bind[1]=i;break;case 2:this.bind[2]=i}}equals(s){return this.type===s.type&&this.name===s.name&&this.arraySize===s.arraySize}},y=class extends u{constructor(s,t,r){super(s,"float",1,(i,o,c)=>i.setUniform1f(s,t(o,c),r))}},C=class extends u{constructor(s,t){super(s,"sampler2D",1,(r,i,o)=>r.bindTexture(s,t(i,o)))}};function w(e){return e===4||e===5||e===6||e===7||e===8}function I(e){return S(e)||e===3}function g(e){return e===9||e===10}function N(e){return p(e)||g(e)}function p(e){return e===0}function l(e){return p(e)||U(e)}function _(e){return l(e)||e===10}function T(e){return l(e)||g(e)}function S(e){return T(e)||$(e)}function $(e){return e===2}function U(e){return e===1}function P(e){return $(e)||w(e)}let A=class extends u{constructor(s,t,r){super(s,"vec3",1,(i,o,c)=>i.setUniform3fv(s,t(o,c),r))}},V=class extends u{constructor(s,t,r){super(s,"vec3",2,(i,o,c,v)=>i.setUniform3fv(s,t(o,c,v),r))}};function z(e,s){switch(s.textureCoordinateType){case 1:return e.attributes.add("uv0","vec2"),e.varyings.add("vuv0","vec2"),void e.vertex.code.add(n`void forwardTextureCoordinates() { vuv0 = uv0; }`);case 2:return e.attributes.add("uv0","vec2"),e.attributes.add("uvRegion","vec4"),e.varyings.add("vuv0","vec2"),e.varyings.add("vuvRegion","vec4"),void e.vertex.code.add(n`void forwardTextureCoordinates() {
vuv0 = uv0;
vuvRegion = uvRegion;
}`);default:h(s.textureCoordinateType);case 0:return void e.vertex.code.add(n`void forwardTextureCoordinates() {}`);case 3:return}}let G=class extends u{constructor(s,t,r){super(s,"float",2,(i,o,c)=>i.setUniform1f(s,t(o,c),r))}};function k(e){e.fragment.code.add(n`vec4 textureAtlasLookup(sampler2D tex, vec2 textureCoordinates, vec4 atlasRegion) {
vec2 atlasScale = atlasRegion.zw - atlasRegion.xy;
vec2 uvAtlas = fract(textureCoordinates) * atlasScale + atlasRegion.xy;
float maxdUV = 0.125;
vec2 dUVdx = clamp(dFdx(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
vec2 dUVdy = clamp(dFdy(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
return textureGrad(tex, uvAtlas, dUVdx, dUVdy);
}`)}function M(e,s){const{textureCoordinateType:t}=s;if(t===0||t===3)return;e.include(z,s);const r=t===2;r&&e.include(k),e.fragment.code.add(n`
    vec4 textureLookup(sampler2D tex, vec2 uv) {
      return ${r?"textureAtlasLookup(tex, uv, vuvRegion)":"texture(tex, uv)"};
    }
  `)}let R=class extends u{constructor(s,t){super(s,"sampler2D",2,(r,i,o)=>r.bindTexture(s,t(i,o)))}};function E(e){e.code.add(n`
    const float GAMMA = ${n.float(x)};
    const float INV_GAMMA = ${n.float(1/x)};

    vec4 delinearizeGamma(vec4 color) {
      return vec4(pow(color.rgb, vec3(INV_GAMMA)), color.a);
    }

    vec3 linearizeGamma(vec3 color) {
      return pow(color, vec3(GAMMA));
    }
  `)}const Q=1,F=1;function W(e,s){if(!l(s.output))return;e.fragment.include(E);const{emissionSource:t,hasEmissiveTextureTransform:r,bindType:i}=s,o=t===3||t===4||t===5;o&&(e.include(M,s),e.fragment.uniforms.add(i===1?new C("texEmission",a=>a.textureEmissive):new R("texEmission",a=>a.textureEmissive)));const c=t===2||o;c&&e.fragment.uniforms.add(i===1?new A("emissiveBaseColor",a=>a.emissiveBaseColor):new V("emissiveBaseColor",a=>a.emissiveBaseColor));const v=t!==0;v&&!(t===7||t===6||t===4||t===5)&&e.fragment.uniforms.add(i===1?new y("emissiveStrength",a=>a.emissiveStrength):new G("emissiveStrength",a=>a.emissiveStrength));const d=t===7,f=t===5,b=t===1||t===6||d;e.fragment.code.add(n`
    vec4 getEmissions(vec3 symbolColor) {
      vec4 emissions = ${c?f?"emissiveSource == 0 ? vec4(emissiveBaseColor, 1.0): vec4(linearizeGamma(symbolColor), 1.0)":"vec4(emissiveBaseColor, 1.0)":b?d?"emissiveSource == 0 ? vec4(0.0): vec4(linearizeGamma(symbolColor), 1.0)":"vec4(linearizeGamma(symbolColor), 1.0)":"vec4(0.0)"};
      ${m(o,`${m(f,`if(emissiveSource == 0) {
              vec4 emissiveFromTex = textureLookup(texEmission, ${r?"emissiveUV":"vuv0"});
              emissions *= vec4(linearizeGamma(emissiveFromTex.rgb), emissiveFromTex.a);
           }`,`vec4 emissiveFromTex = textureLookup(texEmission, ${r?"emissiveUV":"vuv0"});
           emissions *= vec4(linearizeGamma(emissiveFromTex.rgb), emissiveFromTex.a);`)}
        emissions.w = emissions.rgb == vec3(0.0) ? 0.0: emissions.w;`)}
      ${m(v,`emissions.rgb *= emissiveStrength * ${n.float(F)};`)}
      return emissions;
    }
  `)}export{V as a,U as b,w as c,Q as d,A as e,y as f,P as g,z as h,u as i,C as j,M as k,R as l,I as m,m as n,l as o,g as p,p as q,G as r,$ as s,n as t,_ as u,N as v,S as w,W as x,T as y,E as z};
