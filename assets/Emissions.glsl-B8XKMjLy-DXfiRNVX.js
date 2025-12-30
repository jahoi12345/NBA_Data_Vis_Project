import{U as h}from"./jsonMap-Bs3hmeCU-Cusd0Fmz.js";import{v as x}from"./Color-CERqXxxY-BuYn26eI.js";const i=(e,...r)=>{let t="";for(let o=0;o<r.length;o++)t+=e[o]+r[o];return t+=e[e.length-1],t};function v(e,r,t=""){return e?r:t}i.int=e=>Math.round(e).toString(),i.float=e=>e.toPrecision(8);let u=class{constructor(e,r,t,o,s=null){if(this.name=e,this.type=r,this.arraySize=s,this.bind={0:null,1:null,2:null},o)switch(t){case void 0:break;case 0:this.bind[0]=o;break;case 1:this.bind[1]=o;break;case 2:this.bind[2]=o}}equals(e){return this.type===e.type&&this.name===e.name&&this.arraySize===e.arraySize}},C=class extends u{constructor(e,r,t){super(e,"float",1,(o,s,n)=>o.setUniform1f(e,r(s,n),t))}},S=class extends u{constructor(e,r){super(e,"sampler2D",1,(t,o,s)=>t.bindTexture(e,r(o,s)))}};function T(e){return e===4||e===5||e===6||e===7||e===8}function D(e){return w(e)||e===3}function g(e){return e===9||e===10}function I(e){return p(e)||g(e)}function p(e){return e===0}function d(e){return p(e)||V(e)}function N(e){return d(e)||e===10}function U(e){return d(e)||g(e)}function w(e){return U(e)||b(e)}function b(e){return e===2}function V(e){return e===1}function _(e){return b(e)||T(e)}let A=class extends u{constructor(e,r,t){super(e,"vec3",1,(o,s,n)=>o.setUniform3fv(e,r(s,n),t))}},G=class extends u{constructor(e,r,t){super(e,"vec3",2,(o,s,n,c)=>o.setUniform3fv(e,r(s,n,c),t))}};function z(e,r){switch(r.textureCoordinateType){case 1:return e.attributes.add("uv0","vec2"),e.varyings.add("vuv0","vec2"),void e.vertex.code.add(i`void forwardTextureCoordinates() { vuv0 = uv0; }`);case 2:return e.attributes.add("uv0","vec2"),e.attributes.add("uvRegion","vec4"),e.varyings.add("vuv0","vec2"),e.varyings.add("vuvRegion","vec4"),void e.vertex.code.add(i`void forwardTextureCoordinates() {
vuv0 = uv0;
vuvRegion = uvRegion;
}`);default:h(r.textureCoordinateType);case 0:return void e.vertex.code.add(i`void forwardTextureCoordinates() {}`);case 3:return}}let $=class extends u{constructor(e,r,t){super(e,"float",2,(o,s,n)=>o.setUniform1f(e,r(s,n),t))}};function M(e){e.fragment.code.add(i`vec4 textureAtlasLookup(sampler2D tex, vec2 textureCoordinates, vec4 atlasRegion) {
vec2 atlasScale = atlasRegion.zw - atlasRegion.xy;
vec2 uvAtlas = fract(textureCoordinates) * atlasScale + atlasRegion.xy;
float maxdUV = 0.125;
vec2 dUVdx = clamp(dFdx(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
vec2 dUVdy = clamp(dFdy(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
return textureGrad(tex, uvAtlas, dUVdx, dUVdy);
}`)}function R(e,r){const{textureCoordinateType:t}=r;if(t===0||t===3)return;e.include(z,r);const o=t===2;o&&e.include(M),e.fragment.code.add(i`
    vec4 textureLookup(sampler2D tex, vec2 uv) {
      return ${o?"textureAtlasLookup(tex, uv, vuvRegion)":"texture(tex, uv)"};
    }
  `)}let k=class extends u{constructor(e,r){super(e,"sampler2D",2,(t,o,s)=>t.bindTexture(e,r(o,s)))}};function E(e){e.code.add(i`
    const float GAMMA = ${i.float(x)};
    const float INV_GAMMA = ${i.float(1/x)};

    vec4 delinearizeGamma(vec4 color) {
      return vec4(pow(color.rgb, vec3(INV_GAMMA)), color.a);
    }

    vec3 linearizeGamma(vec3 color) {
      return pow(color, vec3(GAMMA));
    }
  `)}const P=1,F=1;function q(e,r){if(!d(r.output))return;e.fragment.include(E);const{emissionSource:t,hasEmissiveTextureTransform:o,bindType:s}=r,n=t===3||t===4||t===5;n&&(e.include(R,r),e.fragment.uniforms.add(s===1?new S("texEmission",a=>a.textureEmissive):new k("texEmission",a=>a.textureEmissive)));const c=t===2||n;c&&e.fragment.uniforms.add(s===1?new A("emissiveBaseColor",a=>a.emissiveBaseColor):new G("emissiveBaseColor",a=>a.emissiveBaseColor));const m=t!==0;m&&!(t===7||t===6||t===4||t===5)&&e.fragment.uniforms.add(s===1?new C("emissiveStrength",a=>a.emissiveStrength):new $("emissiveStrength",a=>a.emissiveStrength));const l=t===7,f=t===5,y=t===1||t===6||l;e.fragment.code.add(i`
    vec4 getEmissions(vec3 symbolColor) {
      vec4 emissions = ${c?f?"emissiveSource == 0 ? vec4(emissiveBaseColor, 1.0): vec4(linearizeGamma(symbolColor), 1.0)":"vec4(emissiveBaseColor, 1.0)":y?l?"emissiveSource == 0 ? vec4(0.0): vec4(linearizeGamma(symbolColor), 1.0)":"vec4(linearizeGamma(symbolColor), 1.0)":"vec4(0.0)"};
      ${v(n,`${v(f,`if(emissiveSource == 0) {
              vec4 emissiveFromTex = textureLookup(texEmission, ${o?"emissiveUV":"vuv0"});
              emissions *= vec4(linearizeGamma(emissiveFromTex.rgb), emissiveFromTex.a);
           }`,`vec4 emissiveFromTex = textureLookup(texEmission, ${o?"emissiveUV":"vuv0"});
           emissions *= vec4(linearizeGamma(emissiveFromTex.rgb), emissiveFromTex.a);`)}
        emissions.w = emissions.rgb == vec3(0.0) ? 0.0: emissions.w;`)}
      ${v(m,`emissions.rgb *= emissiveStrength * ${i.float(F)};`)}
      return emissions;
    }
  `)}export{b as $,A,S as C,E,$ as G,D as I,R as M,I as N,_ as P,P as Q,k as R,w as S,U as T,V as U,G as V,q as W,N as _,g,d as l,v as m,i as n,p,u,T as w,C as y,z};
