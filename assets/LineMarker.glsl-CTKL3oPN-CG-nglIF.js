import{L as F,t as X,V as R}from"./vec32-CewSdTn3-DHOFKD0R.js";import{t as J}from"./collectionUtils-jDyktm0P-ArdXNs6F.js";import{b as Z}from"./BufferView-Cj2sQaht-DuP-iLZg.js";import{l as O,$ as ee,S as U,n as o,m as w,C as te}from"./Emissions.glsl-B8XKMjLy-DXfiRNVX.js";import{u as ie,o as re,r as ae,Y as se,w as oe,N as ne,B as ce,F as j,ai as E,aj as le,ak as B,al as $,am as pe,a0 as de,an as he,ao as ve,bJ as ue,ap as me,aq as I,ar as Y,as as fe,at as ge,au as Se,$ as Pe,ay as ye,aN as ze,aO as we,W as _e,aP as xe,br as be,n as Te,j as Ve,i as Oe,aQ as ke,aR as De,aS as We,aT as Ce,bq as Le,ca as p}from"./Texture-CFNZjV2R-lGBztxVp.js";import{H as je}from"./index-CTl7hdrJ.js";import{p as $e}from"./InterleavedLayout-B7roQAzV-CC2VYRPC.js";import{Y as d}from"./jsonMap-Bs3hmeCU-Cusd0Fmz.js";import"./vec4f64-DPb6J-GU-C7c2DqbZ.js";import"./Point-BfTTZoMu-BAT2Wq6O.js";import"./vec2f64-rIxtbMRN-Kai9mK1i.js";import"./vec42-B8VM4vXb-BnA9MysM.js";import"./mat4-C96X-Nn0-Do6fKsNS.js";import"./mat4f64-q_b6UJoq-Dh6sWB_w.js";import"./mathUtils-PIGhLnI9-B1tKUlUb.js";import"./Polygon-D6wEPb3W-CpL9Efjx.js";import"./lengthUtils-Dt1_RvOO-bleznLOi.js";import{br as Me,bs as Ae,bt as Ne,bu as q,bv as H,bw as Fe,bx as Re}from"./ShadowCastClear.glsl-CeOT_rAo-iOFMl8eB.js";function Q(t){const e=new ye,{space:r,anchor:i,hasTip:_,hasScreenSizePerspective:P}=t,S=r===2,f=r===1;e.include(Me,t),e.include(Ae,t),e.include(ze,t);const{vertex:a,fragment:g,varyings:y}=e;we(a,t),e.attributes.add("position","vec3"),e.attributes.add("previousDelta","vec4"),e.attributes.add("uv0","vec2"),y.add("vColor","vec4"),y.add("vpos","vec3",{invariant:!0}),y.add("vUV","vec2"),y.add("vSize","float"),_&&y.add("vLineWidth","float"),a.uniforms.add(new _e("nearFar",({camera:l})=>l.nearFar),new xe("viewport",({camera:l})=>l.fullViewport)).code.add(o`vec4 projectAndScale(vec4 pos) {
vec4 posNdc = proj * pos;
posNdc.xy *= viewport.zw / posNdc.w;
return posNdc;
}`),a.code.add(o`void clip(vec4 pos, inout vec4 prev) {
float vnp = nearFar[0] * 0.99;
if (prev.z > -nearFar[0]) {
float interpolation = (-vnp - pos.z) / (prev.z - pos.z);
prev = mix(pos, prev, interpolation);
}
}`),S?(e.attributes.add("normal","vec3"),be(a),a.constants.add("tiltThreshold","float",.7),a.code.add(o`vec3 perpendicular(vec3 v) {
vec3 n = (viewNormal * vec4(normal.xyz, 1.0)).xyz;
vec3 n2 = cross(v, n);
vec3 forward = vec3(0.0, 0.0, 1.0);
float tiltDot = dot(forward, n);
return abs(tiltDot) < tiltThreshold ? n : n2;
}`)):a.code.add(o`vec2 perpendicular(vec2 v) {
return vec2(v.y, -v.x);
}`);const h=S?"vec3":"vec2";return a.code.add(o`
      ${h} normalizedSegment(${h} pos, ${h} prev) {
        ${h} segment = pos - prev;
        float segmentLen = length(segment);

        // normalize or zero if too short
        return (segmentLen > 0.001) ? segment / segmentLen : ${S?"vec3(0.0, 0.0, 0.0)":"vec2(0.0, 0.0)"};
      }

      ${h} displace(${h} pos, ${h} prev, float displacementLen) {
        ${h} segment = normalizedSegment(pos, prev);

        ${h} displacementDirU = perpendicular(segment);
        ${h} displacementDirV = segment;

        ${i===1?"pos -= 0.5 * displacementLen * displacementDirV;":""}

        return pos + displacementLen * (uv0.x * displacementDirU + uv0.y * displacementDirV);
      }
    `),f&&(a.uniforms.add(new Te("inverseProjectionMatrix",({camera:l})=>l.inverseProjectionMatrix)),a.code.add(o`vec3 inverseProject(vec4 posScreen) {
posScreen.xy = (posScreen.xy / viewport.zw) * posScreen.w;
return (inverseProjectionMatrix * posScreen).xyz;
}`),a.code.add(o`bool rayIntersectPlane(vec3 rayDir, vec3 planeOrigin, vec3 planeNormal, out vec3 intersection) {
float cos = dot(rayDir, planeNormal);
float t = dot(planeOrigin, planeNormal) / cos;
intersection = t * rayDir;
return abs(cos) > 0.001 && t > 0.0;
}`),a.uniforms.add(new Ve("perScreenPixelRatio",({camera:l})=>l.perScreenPixelRatio)),a.code.add(o`
      vec4 toFront(vec4 displacedPosScreen, vec3 posLeft, vec3 posRight, vec3 prev, float lineWidth) {
        // Project displaced position back to camera space
        vec3 displacedPos = inverseProject(displacedPosScreen);

        // Calculate the plane that we want the marker to lie in. Note that this will always be an approximation since ribbon lines are generally
        // not planar and we do not know the actual position of the displaced prev vertices (they are offset in screen space, too).
        vec3 planeNormal = normalize(cross(posLeft - posRight, posLeft - prev));
        vec3 planeOrigin = posLeft;

        ${w(t.hasCap,`if(prev.z > posLeft.z) {
                vec2 diff = posLeft.xy - posRight.xy;
                planeOrigin.xy += perpendicular(diff) / 2.0;
             }`)};

        // Move the plane towards the camera by a margin dependent on the line width (approximated in world space). This tolerance corrects for the
        // non-planarity in most cases, but sharp joins can place the prev vertices at arbitrary positions so markers can still clip.
        float offset = lineWidth * perScreenPixelRatio;
        planeOrigin *= (1.0 - offset);

        // Intersect camera ray with the plane and make sure it is within clip space
        vec3 rayDir = normalize(displacedPos);
        vec3 intersection;
        if (rayIntersectPlane(rayDir, planeOrigin, planeNormal, intersection) && intersection.z < -nearFar[0] && intersection.z > -nearFar[1]) {
          return vec4(intersection.xyz, 1.0);
        }

        // Fallback: use depth of pos or prev, whichever is closer to the camera
        float minDepth = planeOrigin.z > prev.z ? length(planeOrigin) : length(prev);
        displacedPos *= minDepth / length(displacedPos);
        return vec4(displacedPos.xyz, 1.0);
      }
  `)),Oe(a),e.include(Ne),a.main.add(o`
    // Check for special value of uv0.y which is used by the Renderer when graphics
    // are removed before the VBO is recompacted. If this is the case, then we just
    // project outside of clip space.
    if (uv0.y == 0.0) {
      // Project out of clip space
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
    }
    else {
      vec4 pos  = view * vec4(position, 1.0);
      vec4 prev = view * vec4(position + previousDelta.xyz * previousDelta.w, 1.0);

      float lineWidth = getLineWidth(${w(P,"pos.xyz")});
      float screenMarkerSize = getScreenMarkerSize(lineWidth);

      clip(pos, prev);

      ${S?o`${w(t.hideOnShortSegments,o`
                if (areWorldMarkersHidden(pos.xyz, prev.xyz)) {
                  // Project out of clip space
                  gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
                  return;
                }`)}
            pos.xyz = displace(pos.xyz, prev.xyz, getWorldMarkerSize(pos.xyz));
            vec4 displacedPosScreen = projectAndScale(pos);`:o`
            vec4 posScreen = projectAndScale(pos);
            vec4 prevScreen = projectAndScale(prev);
            vec4 displacedPosScreen = posScreen;

            displacedPosScreen.xy = displace(posScreen.xy, prevScreen.xy, screenMarkerSize);
            ${w(f,o`
                vec2 displacementDirU = perpendicular(normalizedSegment(posScreen.xy, prevScreen.xy));

                // We need three points of the ribbon line in camera space to calculate the plane it lies in
                // Note that we approximate the third point, since we have no information about the join around prev
                vec3 lineRight = inverseProject(posScreen + lineWidth * vec4(displacementDirU.xy, 0.0, 0.0));
                vec3 lineLeft = pos.xyz + (pos.xyz - lineRight);

                pos = toFront(displacedPosScreen, lineLeft, lineRight, prev.xyz, lineWidth);
                displacedPosScreen = projectAndScale(pos);`)}`}
      forwardViewPosDepth(pos.xyz);
      // Convert back into NDC
      displacedPosScreen.xy = (displacedPosScreen.xy / viewport.zw) * displacedPosScreen.w;

      // Convert texture coordinate into [0,1]
      vUV = (uv0 + 1.0) / 2.0;
      ${w(!S,"vUV = noPerspectiveWrite(vUV, displacedPosScreen.w);")}
      ${w(_,"vLineWidth = noPerspectiveWrite(lineWidth, displacedPosScreen.w);")}

      vSize = screenMarkerSize;
      vColor = getColor();

      // Use camera space for slicing
      vpos = pos.xyz;

      gl_Position = displacedPosScreen;
    }`),g.include(ke,t),e.include(De,t),g.include(We),g.uniforms.add(new Ce("intrinsicColor",({color:l})=>l),new te("tex",({markerTexture:l})=>l)).constants.add("texelSize","float",1/q).code.add(o`float markerAlpha(vec2 samplePos) {
samplePos += vec2(0.5, -0.5) * texelSize;
float sdf = texture(tex, samplePos).r;
float pixelDistance = sdf * vSize;
pixelDistance -= 0.5;
return clamp(0.5 - pixelDistance, 0.0, 1.0);
}`),_&&(e.include(H),g.constants.add("relativeMarkerSize","float",Fe/q).constants.add("relativeTipLineWidth","float",Re).code.add(o`
    float tipAlpha(vec2 samplePos) {
      // Convert coordinates s.t. they are in pixels and relative to the tip of an arrow marker
      samplePos -= vec2(0.5, 0.5 + 0.5 * relativeMarkerSize);
      samplePos *= vSize;

      float halfMarkerSize = 0.5 * relativeMarkerSize * vSize;
      float halfTipLineWidth = 0.5 * max(1.0, relativeTipLineWidth * noPerspectiveRead(vLineWidth));

      ${w(S,"halfTipLineWidth *= fwidth(samplePos.y);")}

      float distance = max(abs(samplePos.x) - halfMarkerSize, abs(samplePos.y) - halfTipLineWidth);
      return clamp(0.5 - distance, 0.0, 1.0);
    }
  `)),e.include(Le,t),e.include(H),g.main.add(o`
    discardBySlice(vpos);
    discardByTerrainDepth();

    vec4 finalColor = intrinsicColor * vColor;

    // Cancel out perspective correct interpolation if in screen space or draped
    vec2 samplePos = ${w(!S,"noPerspectiveRead(vUV)","vUV")};
    finalColor.a *= ${_?"max(markerAlpha(samplePos), tipAlpha(samplePos))":"markerAlpha(samplePos)"};
    outputColorHighlightOID(finalColor, vpos, finalColor.rgb);`),e}const Ue=Object.freeze(Object.defineProperty({__proto__:null,build:Q},Symbol.toStringTag,{value:"Module"}));let Ee=class extends ne{constructor(t,e){super(t,e,new ce(Ue,()=>je(()=>Promise.resolve().then(()=>Je),void 0)),G(e).locations)}_makePipelineState(t,e){const{output:r,oitPass:i,space:_,hasOccludees:P}=t;return j({blending:O(r)?ve(i):null,depthTest:_===0?null:{func:he(i)},depthWrite:de(t),drawBuffers:pe(r,ue(i,r)),colorWrite:$,stencilWrite:P?B:null,stencilTest:P?e?E:le:null,polygonOffset:{factor:0,units:-10}})}initializePipeline(t){return t.occluder?(this._occluderPipelineTransparent=j({blending:Y,depthTest:I,depthWrite:null,colorWrite:$,stencilWrite:null,stencilTest:me}),this._occluderPipelineOpaque=j({blending:Y,depthTest:I,depthWrite:null,colorWrite:$,stencilWrite:ge,stencilTest:fe}),this._occluderPipelineMaskWrite=j({blending:null,depthTest:Se,depthWrite:null,colorWrite:null,stencilWrite:B,stencilTest:E})):this._occluderPipelineTransparent=this._occluderPipelineOpaque=this._occluderPipelineMaskWrite=null,this._occludeePipelineState=this._makePipelineState(t,!0),this._makePipelineState(t,!1)}getPipeline(t,e){return t?this._occludeePipelineState:e===11?this._occluderPipelineTransparent??super.getPipeline():e===10?this._occluderPipelineOpaque??super.getPipeline():this._occluderPipelineMaskWrite??super.getPipeline()}};function G(t){const e=$e().vec3f("position").vec4f16("previousDelta").vec2f16("uv0");return t.hasVVColor?e.f32("colorFeatureAttribute"):e.vec4u8("color",{glNormalized:!0}),t.hasVVOpacity&&e.f32("opacityFeatureAttribute"),t.hasVVSize?e.f32("sizeFeatureAttribute"):e.f16("size"),t.worldSpace&&e.vec3f16("normal"),e.freeze()}class c extends se{constructor(e){super(),this.spherical=e,this.space=1,this.anchor=0,this.occluder=!1,this.writeDepth=!1,this.hideOnShortSegments=!1,this.hasCap=!1,this.hasTip=!1,this.hasVVSize=!1,this.hasVVColor=!1,this.hasVVOpacity=!1,this.hasOccludees=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.hasScreenSizePerspective=!1,this.textureCoordinateType=0,this.emissionSource=0,this.discardInvisibleFragments=!0,this.occlusionPass=!1,this.hasVVInstancing=!1,this.hasSliceTranslatedView=!0,this.olidColorInstanced=!1,this.overlayEnabled=!1,this.snowCover=!1}get draped(){return this.space===0}get worldSpace(){return this.space===2}}d([p({count:3})],c.prototype,"space",void 0),d([p({count:2})],c.prototype,"anchor",void 0),d([p()],c.prototype,"occluder",void 0),d([p()],c.prototype,"writeDepth",void 0),d([p()],c.prototype,"hideOnShortSegments",void 0),d([p()],c.prototype,"hasCap",void 0),d([p()],c.prototype,"hasTip",void 0),d([p()],c.prototype,"hasVVSize",void 0),d([p()],c.prototype,"hasVVColor",void 0),d([p()],c.prototype,"hasVVOpacity",void 0),d([p()],c.prototype,"hasOccludees",void 0),d([p()],c.prototype,"terrainDepthTest",void 0),d([p()],c.prototype,"cullAboveTerrain",void 0),d([p()],c.prototype,"hasScreenSizePerspective",void 0);class vt extends ie{constructor(e,r){super(e,Ie),this.produces=new Map([[2,i=>i===9||O(i)&&this.parameters.renderOccluded===8],[3,i=>ee(i)],[10,i=>U(i)&&this.parameters.renderOccluded===8],[11,i=>U(i)&&this.parameters.renderOccluded===8],[4,i=>O(i)&&this.parameters.writeDepth],[8,i=>O(i)&&!this.parameters.writeDepth],[18,i=>O(i)||i===9]]),this.intersectDraped=void 0,this._configuration=new c(r)}getConfiguration(e,r){return super.getConfiguration(e,r,this._configuration),this._configuration.space=r.slot===18?0:this.parameters.worldSpace?2:1,this._configuration.hideOnShortSegments=this.parameters.hideOnShortSegments,this._configuration.hasCap=this.parameters.cap!==0,this._configuration.anchor=this.parameters.anchor,this._configuration.hasTip=this.parameters.hasTip,this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.hasOccludees=r.hasOccludees,this._configuration.writeDepth=this.parameters.writeDepth,this._configuration.hasVVSize=this.parameters.hasVVSize,this._configuration.hasVVColor=this.parameters.hasVVColor,this._configuration.hasVVOpacity=this.parameters.hasVVOpacity,this._configuration.occluder=this.parameters.renderOccluded===8,this._configuration.oitPass=r.oitPass,this._configuration.terrainDepthTest=r.terrainDepthTest&&O(e),this._configuration.cullAboveTerrain=r.cullAboveTerrain,this._configuration.hasScreenSizePerspective=this.parameters.screenSizePerspective!=null,this._configuration}get visible(){return this.parameters.color[3]>=re}intersect(){}createBufferWriter(){return new Ye(G(this.parameters),this.parameters)}createGLMaterial(e){return new Be(e)}}class Be extends oe{dispose(){super.dispose(),this._markerTextures?.release(this._markerPrimitive),this._markerPrimitive=null}beginSlot(e){const r=this._material.parameters.markerPrimitive;return r!==this._markerPrimitive&&(this._material.setParameters({markerTexture:this._markerTextures.swap(r,this._markerPrimitive)}),this._markerPrimitive=r),this.getTechnique(Ee,e)}}class Ie extends ae{constructor(){super(...arguments),this.width=0,this.color=[1,1,1,1],this.markerPrimitive="arrow",this.placement="end",this.cap=0,this.anchor=0,this.hasTip=!1,this.worldSpace=!1,this.hideOnShortSegments=!1,this.writeDepth=!0,this.hasSlicePlane=!1,this.vvFastUpdate=!1,this.stipplePattern=null,this.markerTexture=null}}class Ye{constructor(e,r){this.layout=e,this._parameters=r}elementCount(){return this._parameters.placement==="begin-end"?12:6}write(e,r,i,_,P,S){const f=i.get("position").data,a=f.length/3;let g=[1,0,0];const y=i.get("normal");this._parameters.worldSpace&&y!=null&&(g=y.data);let h=1,l=0;this._parameters.vvSize?l=i.get("sizeFeatureAttribute").data[0]:i.has("size")&&(h=i.get("size").data[0]);let b=[1,1,1,1],M=0;this._parameters.vvColor?M=i.get("colorFeatureAttribute").data[0]:i.has("color")&&(b=i.get("color").data);let A=0;this._parameters.vvOpacity&&(A=i.get("opacityFeatureAttribute").data[0]);const x=new Float32Array(P.buffer),z=Z(P.buffer),k=new Uint8Array(P.buffer);let v=S*(this.layout.stride/4);const T=x.BYTES_PER_ELEMENT/z.BYTES_PER_ELEMENT,K=4/T,V=(n,W,u,m)=>{x[v++]=n[0],x[v++]=n[1],x[v++]=n[2],Pe(W,n,z,v*T),v+=K;let s=v*T;if(z[s++]=u[0],z[s++]=u[1],v=Math.ceil(s/T),this._parameters.vvColor)x[v++]=M;else{const C=Math.min(4*m,b.length-4),L=4*v++;k[L]=255*b[C],k[L+1]=255*b[C+1],k[L+2]=255*b[C+2],k[L+3]=255*b[C+3]}this._parameters.vvOpacity&&(x[v++]=A),s=v*T,this._parameters.vvSize?(x[v++]=l,s+=2):z[s++]=h,this._parameters.worldSpace&&(z[s++]=g[0],z[s++]=g[1],z[s++]=g[2]),v=Math.ceil(s/T)},N=(n,W)=>{const u=F(qe,f[3*n],f[3*n+1],f[3*n+2]),m=He;let s=n+W;do F(m,f[3*s],f[3*s+1],f[3*s+2]),s+=W;while(X(u,m)&&s>=0&&s<a);e&&(R(u,u,e),R(m,m,e)),V(u,m,[-1,-1],n),V(u,m,[1,-1],n),V(u,m,[1,1],n),V(u,m,[-1,-1],n),V(u,m,[1,1],n),V(u,m,[-1,1],n)},D=this._parameters.placement;return D!=="begin"&&D!=="begin-end"||N(0,1),D!=="end"&&D!=="begin-end"||N(a-1,-1),null}}const qe=J(),He=J(),Je=Object.freeze(Object.defineProperty({__proto__:null,build:Q},Symbol.toStringTag,{value:"Module"}));export{vt as u};
