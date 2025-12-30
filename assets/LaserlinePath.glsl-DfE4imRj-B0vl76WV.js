import{z as de,Y as u,H as L,G as pe}from"./jsonMap-Bs3hmeCU-Cusd0Fmz.js";import{I as m,O as k,L as T,$ as K,V as _,l as A,x as j,v as Z,F as ue}from"./vec32-CewSdTn3-DHOFKD0R.js";import{t as o,X as N,M as $}from"./collectionUtils-jDyktm0P-ArdXNs6F.js";import{P as I,c as fe,w as R,s as ge,b as me,C as _e,q as be,L as Pe,E as ve}from"./frustum-CMzahy3--CFytpSYl.js";import{o as we}from"./VisualElement-By4iq8p4-ZBataKFH.js";import{b as Ve,o as xe,Q as De,y as Ee}from"./sphere-DLQ6p7mp-DmnRpHXV.js";import{aW as ye,aY as W,cL as Le,y as Se,N as Q,B as J,O as Ce,E as Me,V as Ae,ay as ee,bN as Re,n as Te,W as Oe,j as te,az as Ie,aT as S,R as Ue,bl as C,S as qe,bY as ze,U as je,ca as V}from"./Texture-CFNZjV2R-lGBztxVp.js";import{bG as Ne,ar as $e,bF as We}from"./ShadowCastClear.glsl-CeOT_rAo-iOFMl8eB.js";import{i as He}from"./DoubleArray-DExKNiTh-CvVpHySW.js";import{p as ie,n as Fe}from"./InterleavedLayout-B7roQAzV-CC2VYRPC.js";import{E as Be}from"./enums-B4pqBiXb-BO-3hS_8.js";import{H as ne}from"./index-CTl7hdrJ.js";import{y as U}from"./mathUtils-PIGhLnI9-B1tKUlUb.js";import{F as se}from"./Polygon-D6wEPb3W-CpL9Efjx.js";import{o as re}from"./vec2f64-rIxtbMRN-Kai9mK1i.js";import{P as ae}from"./vec42-B8VM4vXb-BnA9MysM.js";import{o as Ge}from"./vec4f64-DPb6J-GU-C7c2DqbZ.js";import"./vector-B8ZDYGQ6-B1uNywRb.js";import{y as f,m as H,n as l,A as v,C as F}from"./Emissions.glsl-B8XKMjLy-DXfiRNVX.js";import{X as Xe,K as Ye}from"./plane-BNdSPG2o-Cq7jmU6w.js";import{L as ke}from"./mat4-C96X-Nn0-Do6fKsNS.js";import{n as Ke}from"./mat4f64-q_b6UJoq-Dh6sWB_w.js";let B=class{constructor(t){this._renderCoordsHelper=t,this._origin=o(),this._dirty=!1,this._count=0}set vertices(t){const e=He(3*t.length);let i=0;for(const n of t)e[i++]=n[0],e[i++]=n[1],e[i++]=n[2];this.buffers=[e]}set buffers(t){if(this._buffers=t,this._buffers.length>0){const e=this._buffers[0],i=3*Math.floor(e.length/3/2);T(this._origin,e[i],e[i+1],e[i+2])}else T(this._origin,0,0,0);this._dirty=!0}get origin(){return this._origin}draw(t){const e=this._ensureVAO(t);e!=null&&(t.bindVAO(e),t.drawArrays(Be.TRIANGLES,0,this._count))}dispose(){this._vao!=null&&this._vao.dispose()}get _layout(){return this._renderCoordsHelper.viewingMode===1?Qe:Je}_ensureVAO(t){return this._buffers==null?null:(this._vao??=this._createVAO(t,this._buffers),this._ensureVertexData(this._vao,this._buffers),this._vao)}_createVAO(t,e){const i=this._createDataBuffer(e);return this._dirty=!1,new $e(t,new Ce(t,Fe(this._layout),i))}_ensureVertexData(t,e){if(!this._dirty)return;const i=this._createDataBuffer(e);t.buffer()?.setData(i),this._dirty=!1}_createDataBuffer(t){const e=t.reduce((d,c)=>d+G(c),0);this._count=e;const i=this._layout.createBuffer(e),n=this._origin;let s=0,r=0;const a="startUp"in i?this._setUpVectors.bind(this,i):void 0;for(const d of t){for(let c=0;c<d.length;c+=3){const y=T(X,d[c],d[c+1],d[c+2]);c===0?r=this._renderCoordsHelper.getAltitude(y):this._renderCoordsHelper.setAltitude(y,r);const g=s+2*c;a?.(c,g,d,y);const z=K(X,y,n);if(c<d.length-3){for(let b=0;b<6;b++)i.start.setVec(g+b,z);i.extrude.setValues(g,0,-1),i.extrude.setValues(g+1,1,-1),i.extrude.setValues(g+2,1,1),i.extrude.setValues(g+3,0,-1),i.extrude.setValues(g+4,1,1),i.extrude.setValues(g+5,0,1)}if(c>0)for(let b=-6;b<0;b++)i.end.setVec(g+b,z)}s+=G(d)}return i.buffer}_setUpVectors(t,e,i,n,s){const r=this._renderCoordsHelper.worldUpAtPosition(s,Ze);if(e<n.length-3)for(let a=0;a<6;a++)t.startUp.setVec(i+a,r);if(e>0)for(let a=-6;a<0;a++)t.endUp.setVec(i+a,r)}};function G(t){return 3*(2*(t.length/3-1))}const Ze=o(),X=o(),Qe=ie().vec3f("start").vec3f("end").vec2f("extrude").vec3f("startUp").vec3f("endUp"),Je=ie().vec3f("start").vec3f("end").vec2f("extrude");function le(t,e){const i=t.fragment;i.include(qe),t.include(ze),i.include(We),i.uniforms.add(new f("globalAlpha",n=>n.globalAlpha),new v("glowColor",n=>n.glowColor),new f("glowWidth",(n,s)=>n.glowWidth*s.camera.pixelRatio),new f("glowFalloff",n=>n.glowFalloff),new v("innerColor",n=>n.innerColor),new f("innerWidth",(n,s)=>n.innerWidth*s.camera.pixelRatio),new je("depthMap",n=>n.depth?.attachment),new F("normalMap",n=>n.normals)),i.code.add(l`vec4 premultipliedColor(vec3 rgb, float alpha) {
return vec4(rgb * alpha, alpha);
}`),i.code.add(l`vec4 laserlineProfile(float dist) {
if (dist > glowWidth) {
return vec4(0.0);
}
float innerAlpha = (1.0 - smoothstep(0.0, innerWidth, dist));
float glowAlpha = pow(max(0.0, 1.0 - dist / glowWidth), glowFalloff);
return blendColorsPremultiplied(
premultipliedColor(innerColor, innerAlpha),
premultipliedColor(glowColor, glowAlpha)
);
}`),i.code.add(l`bool laserlineReconstructFromDepth(out vec3 pos, out vec3 normal, out float angleCutoffAdjust, out float depthDiscontinuityAlpha) {
float depth = depthFromTexture(depthMap, uv);
if (depth == 1.0) {
return false;
}
float linearDepth = linearizeDepth(depth);
pos = reconstructPosition(gl_FragCoord.xy, linearDepth);
float minStep = 6e-8;
float depthStep = clamp(depth + minStep, 0.0, 1.0);
float linearDepthStep = linearizeDepth(depthStep);
float depthError = abs(linearDepthStep - linearDepth);
vec3 normalReconstructed = normalize(cross(dFdx(pos), dFdy(pos)));
vec3 normalFromTexture = normalize(texture(normalMap, uv).xyz * 2.0 - 1.0);
float blendFactor = smoothstep(0.15, 0.2, depthError);
normal = normalize(mix(normalReconstructed, normalFromTexture, blendFactor));
angleCutoffAdjust = mix(0.0, 0.004, blendFactor);
float ddepth = fwidth(linearDepth);
depthDiscontinuityAlpha = 1.0 - smoothstep(0.0, 0.01, -ddepth / linearDepth);
return true;
}`),e.contrastControlEnabled?i.uniforms.add(new F("frameColor",(n,s)=>n.colors),new f("globalAlphaContrastBoost",n=>n.globalAlphaContrastBoost)).code.add(l`float rgbToLuminance(vec3 color) {
return dot(vec3(0.2126, 0.7152, 0.0722), color);
}
vec4 laserlineOutput(vec4 color) {
float backgroundLuminance = rgbToLuminance(texture(frameColor, uv).rgb);
float alpha = clamp(globalAlpha * max(backgroundLuminance * globalAlphaContrastBoost, 1.0), 0.0, 1.0);
return color * alpha;
}`):i.code.add(l`vec4 laserlineOutput(vec4 color) {
return color * globalAlpha;
}`)}const q=U(6);function oe(t){const e=new ee;e.include(Ie),e.include(le,t);const i=e.fragment;if(t.lineVerticalPlaneEnabled||t.heightManifoldEnabled)if(i.uniforms.add(new f("maxPixelDistance",(n,s)=>t.heightManifoldEnabled?2*s.camera.computeScreenPixelSizeAt(n.heightManifoldTarget):2*s.camera.computeScreenPixelSizeAt(n.lineVerticalPlaneSegment.origin))),i.code.add(l`float planeDistancePixels(vec4 plane, vec3 pos) {
float dist = dot(plane.xyz, pos) + plane.w;
float width = fwidth(dist);
dist /= min(width, maxPixelDistance);
return abs(dist);
}`),t.spherical){const n=(r,a,d)=>_(r,a.heightManifoldTarget,d.camera.viewMatrix),s=(r,a)=>_(r,[0,0,0],a.camera.viewMatrix);i.uniforms.add(new S("heightManifoldOrigin",(r,a)=>(n(p,r,a),s(w,a),K(w,w,p),A(h,w),h[3]=j(w),h)),new Ue("globalOrigin",r=>s(p,r)),new f("cosSphericalAngleThreshold",(r,a)=>1-Math.max(2,Z(a.camera.eye,r.heightManifoldTarget)*a.camera.perRenderPixelRatio)/j(r.heightManifoldTarget))),i.code.add(l`float globeDistancePixels(float posInGlobalOriginLength) {
float dist = abs(posInGlobalOriginLength - heightManifoldOrigin.w);
float width = fwidth(dist);
dist /= min(width, maxPixelDistance);
return abs(dist);
}
float heightManifoldDistancePixels(vec4 heightPlane, vec3 pos) {
vec3 posInGlobalOriginNorm = normalize(globalOrigin - pos);
float cosAngle = dot(posInGlobalOriginNorm, heightManifoldOrigin.xyz);
vec3 posInGlobalOrigin = globalOrigin - pos;
float posInGlobalOriginLength = length(posInGlobalOrigin);
float sphericalDistance = globeDistancePixels(posInGlobalOriginLength);
float planarDistance = planeDistancePixels(heightPlane, pos);
return cosAngle < cosSphericalAngleThreshold ? sphericalDistance : planarDistance;
}`)}else i.code.add(l`float heightManifoldDistancePixels(vec4 heightPlane, vec3 pos) {
return planeDistancePixels(heightPlane, pos);
}`);if(t.pointDistanceEnabled&&(i.uniforms.add(new f("maxPixelDistance",(n,s)=>2*s.camera.computeScreenPixelSizeAt(n.pointDistanceTarget))),i.code.add(l`float sphereDistancePixels(vec4 sphere, vec3 pos) {
float dist = distance(sphere.xyz, pos) - sphere.w;
float width = fwidth(dist);
dist /= min(width, maxPixelDistance);
return abs(dist);
}`)),t.intersectsLineEnabled&&i.uniforms.add(new te("perScreenPixelRatio",n=>n.camera.perScreenPixelRatio)).code.add(l`float lineDistancePixels(vec3 start, vec3 dir, float radius, vec3 pos) {
float dist = length(cross(dir, pos - start)) / (length(pos) * perScreenPixelRatio);
return abs(dist) - radius;
}`),(t.lineVerticalPlaneEnabled||t.intersectsLineEnabled)&&i.code.add(l`bool pointIsWithinLine(vec3 pos, vec3 start, vec3 end) {
vec3 dir = end - start;
float t2 = dot(dir, pos - start);
float l2 = dot(dir, dir);
return t2 >= 0.0 && t2 <= l2;
}`),i.main.add(l`vec3 pos;
vec3 normal;
float angleCutoffAdjust;
float depthDiscontinuityAlpha;
if (!laserlineReconstructFromDepth(pos, normal, angleCutoffAdjust, depthDiscontinuityAlpha)) {
fragColor = vec4(0.0);
return;
}
vec4 color = vec4(0.0);`),t.heightManifoldEnabled){i.uniforms.add(new C("angleCutoff",s=>M(s)),new S("heightPlane",(s,r)=>ce(s.heightManifoldTarget,s.renderCoordsHelper.worldUpAtPosition(s.heightManifoldTarget,p),r.camera.viewMatrix)));const n=t.spherical?l`normalize(globalOrigin - pos)`:l`heightPlane.xyz`;i.main.add(l`
      vec2 angleCutoffAdjusted = angleCutoff - angleCutoffAdjust;
      // Fade out laserlines on flat surfaces
      float heightManifoldAlpha = 1.0 - smoothstep(angleCutoffAdjusted.x, angleCutoffAdjusted.y, abs(dot(normal, ${n})));
      vec4 heightManifoldColor = laserlineProfile(heightManifoldDistancePixels(heightPlane, pos));
      color = max(color, heightManifoldColor * heightManifoldAlpha);`)}return t.pointDistanceEnabled&&(i.uniforms.add(new C("angleCutoff",n=>M(n)),new S("pointDistanceSphere",(n,s)=>xe(et(n,s)))),i.main.add(l`float pointDistanceSphereDistance = sphereDistancePixels(pointDistanceSphere, pos);
vec4 pointDistanceSphereColor = laserlineProfile(pointDistanceSphereDistance);
float pointDistanceSphereAlpha = 1.0 - smoothstep(angleCutoff.x, angleCutoff.y, abs(dot(normal, normalize(pos - pointDistanceSphere.xyz))));
color = max(color, pointDistanceSphereColor * pointDistanceSphereAlpha);`)),t.lineVerticalPlaneEnabled&&(i.uniforms.add(new C("angleCutoff",n=>M(n)),new S("lineVerticalPlane",(n,s)=>tt(n,s)),new v("lineVerticalStart",(n,s)=>it(n,s)),new v("lineVerticalEnd",(n,s)=>nt(n,s))),i.main.add(l`if (pointIsWithinLine(pos, lineVerticalStart, lineVerticalEnd)) {
float lineVerticalDistance = planeDistancePixels(lineVerticalPlane, pos);
vec4 lineVerticalColor = laserlineProfile(lineVerticalDistance);
float lineVerticalAlpha = 1.0 - smoothstep(angleCutoff.x, angleCutoff.y, abs(dot(normal, lineVerticalPlane.xyz)));
color = max(color, lineVerticalColor * lineVerticalAlpha);
}`)),t.intersectsLineEnabled&&(i.uniforms.add(new C("angleCutoff",n=>M(n)),new v("intersectsLineStart",(n,s)=>_(p,n.lineStartWorld,s.camera.viewMatrix)),new v("intersectsLineEnd",(n,s)=>_(p,n.lineEndWorld,s.camera.viewMatrix)),new v("intersectsLineDirection",(n,s)=>(m(h,n.intersectsLineSegment.vector),h[3]=0,A(p,ae(h,h,s.camera.viewMatrix)))),new f("intersectsLineRadius",n=>n.intersectsLineRadius)),i.main.add(l`if (pointIsWithinLine(pos, intersectsLineStart, intersectsLineEnd)) {
float intersectsLineDistance = lineDistancePixels(intersectsLineStart, intersectsLineDirection, intersectsLineRadius, pos);
vec4 intersectsLineColor = laserlineProfile(intersectsLineDistance);
float intersectsLineAlpha = 1.0 - smoothstep(angleCutoff.x, angleCutoff.y, 1.0 - abs(dot(normal, intersectsLineDirection)));
color = max(color, intersectsLineColor * intersectsLineAlpha);
}`)),i.main.add(l`fragColor = laserlineOutput(color * depthDiscontinuityAlpha);`),e}function M(t){return se(st,Math.cos(t.angleCutoff),Math.cos(Math.max(0,t.angleCutoff-U(2))))}function et(t,e){const i=_(lt,t.pointDistanceOrigin,e.camera.viewMatrix),n=Z(t.pointDistanceOrigin,t.pointDistanceTarget);return De(ot,i,n)}function tt(t,e){const i=ve(t.lineVerticalPlaneSegment,.5,p),n=t.renderCoordsHelper.worldUpAtPosition(i,rt),s=A(w,t.lineVerticalPlaneSegment.vector),r=ue(p,n,s);return A(r,r),ce(t.lineVerticalPlaneSegment.origin,r,e.camera.viewMatrix)}function it(t,e){const i=m(p,t.lineVerticalPlaneSegment.origin);return t.renderCoordsHelper.setAltitude(i,0),_(i,i,e.camera.viewMatrix)}function nt(t,e){const i=k(p,t.lineVerticalPlaneSegment.origin,t.lineVerticalPlaneSegment.vector);return t.renderCoordsHelper.setAltitude(i,0),_(i,i,e.camera.viewMatrix)}function ce(t,e,i){return _(Y,t,i),m(h,e),h[3]=0,ae(h,h,i),Xe(Y,h,at)}const st=re(),p=o(),h=Ge(),rt=o(),w=o(),Y=o(),at=Ye(),lt=o(),ot=Ee(),ct=Object.freeze(Object.defineProperty({__proto__:null,build:oe,defaultAngleCutoff:q},Symbol.toStringTag,{value:"Module"}));class ht extends Ae{constructor(){super(...arguments),this.innerColor=$(1,1,1),this.innerWidth=1,this.glowColor=$(1,.5,0),this.glowWidth=8,this.glowFalloff=8,this.globalAlpha=.75,this.globalAlphaContrastBoost=2,this.angleCutoff=U(6),this.pointDistanceOrigin=o(),this.pointDistanceTarget=o(),this.lineVerticalPlaneSegment=I(),this.intersectsLineSegment=I(),this.intersectsLineRadius=3,this.heightManifoldTarget=o(),this.lineStartWorld=o(),this.lineEndWorld=o()}}class dt extends Q{constructor(e,i){super(e,i,new J(ct,()=>ne(()=>Promise.resolve().then(()=>bt),void 0)),Me)}}function he(t){const e=new ee;e.include(le,t);const{vertex:i,fragment:n}=e;i.uniforms.add(new Re("modelView",(r,{camera:a})=>ke(ut,a.viewMatrix,r.origin)),new Te("proj",({camera:r})=>r.projectionMatrix),new f("glowWidth",(r,{camera:a})=>r.glowWidth*a.pixelRatio),new Oe("pixelToNDC",({camera:r})=>se(pt,2/r.fullViewport[2],2/r.fullViewport[3]))),e.attributes.add("start","vec3"),e.attributes.add("end","vec3"),t.spherical&&(e.attributes.add("startUp","vec3"),e.attributes.add("endUp","vec3")),e.attributes.add("extrude","vec2"),e.varyings.add("uv","vec2"),e.varyings.add("vViewStart","vec3"),e.varyings.add("vViewEnd","vec3"),e.varyings.add("vViewSegmentNormal","vec3"),e.varyings.add("vViewStartNormal","vec3"),e.varyings.add("vViewEndNormal","vec3");const s=!t.spherical;return i.main.add(l`
    vec3 pos = mix(start, end, extrude.x);

    vec4 viewPos = modelView * vec4(pos, 1);
    vec4 projPos = proj * viewPos;
    vec2 ndcPos = projPos.xy / projPos.w;

    // in planar we hardcode the up vectors to be Z-up */
    ${H(s,l`vec3 startUp = vec3(0, 0, 1);`)}
    ${H(s,l`vec3 endUp = vec3(0, 0, 1);`)}

    // up vector corresponding to the location of the vertex, selecting either startUp or endUp */
    vec3 up = extrude.y * mix(startUp, endUp, extrude.x);
    vec3 viewUp = (modelView * vec4(up, 0)).xyz;

    vec4 projPosUp = proj * vec4(viewPos.xyz + viewUp, 1);
    vec2 projUp = normalize(projPosUp.xy / projPosUp.w - ndcPos);

    // extrude ndcPos along projUp to the edge of the screen
    vec2 lxy = abs(sign(projUp) - ndcPos);
    ndcPos += length(lxy) * projUp;

    vViewStart = (modelView * vec4(start, 1)).xyz;
    vViewEnd = (modelView * vec4(end, 1)).xyz;

    vec3 viewStartEndDir = vViewEnd - vViewStart;

    vec3 viewStartUp = (modelView * vec4(startUp, 0)).xyz;

    // the normal of the plane that aligns with the segment and the up vector
    vViewSegmentNormal = normalize(cross(viewStartUp, viewStartEndDir));

    // the normal orthogonal to the segment normal and the start up vector
    vViewStartNormal = -normalize(cross(vViewSegmentNormal, viewStartUp));

    // the normal orthogonal to the segment normal and the end up vector
    vec3 viewEndUp = (modelView * vec4(endUp, 0)).xyz;
    vViewEndNormal = normalize(cross(vViewSegmentNormal, viewEndUp));

    // Add enough padding in the X screen space direction for "glow"
    float xPaddingPixels = sign(dot(vViewSegmentNormal, viewPos.xyz)) * (extrude.x * 2.0 - 1.0) * glowWidth;
    ndcPos.x += xPaddingPixels * pixelToNDC.x;

    // uv is used to read back depth to reconstruct the position at the fragment
    uv = ndcPos * 0.5 + 0.5;

    gl_Position = vec4(ndcPos, 0, 1);
  `),n.uniforms.add(new te("perScreenPixelRatio",r=>r.camera.perScreenPixelRatio)),n.code.add(l`float planeDistance(vec3 planeNormal, vec3 planeOrigin, vec3 pos) {
return dot(planeNormal, pos - planeOrigin);
}
float segmentDistancePixels(vec3 segmentNormal, vec3 startNormal, vec3 endNormal, vec3 pos, vec3 start, vec3 end) {
float distSegmentPlane = planeDistance(segmentNormal, start, pos);
float distStartPlane = planeDistance(startNormal, start, pos);
float distEndPlane = planeDistance(endNormal, end, pos);
float dist = max(max(distStartPlane, distEndPlane), abs(distSegmentPlane));
float width = fwidth(distSegmentPlane);
float maxPixelDistance = length(pos) * perScreenPixelRatio * 2.0;
float pixelDist = dist / min(width, maxPixelDistance);
return abs(pixelDist);
}`),n.main.add(l`fragColor = vec4(0.0);
vec3 dEndStart = vViewEnd - vViewStart;
if (dot(dEndStart, dEndStart) < 1e-5) {
return;
}
vec3 pos;
vec3 normal;
float angleCutoffAdjust;
float depthDiscontinuityAlpha;
if (!laserlineReconstructFromDepth(pos, normal, angleCutoffAdjust, depthDiscontinuityAlpha)) {
return;
}
float distance = segmentDistancePixels(
vViewSegmentNormal,
vViewStartNormal,
vViewEndNormal,
pos,
vViewStart,
vViewEnd
);
vec4 color = laserlineProfile(distance);
float alpha = (1.0 - smoothstep(0.995 - angleCutoffAdjust, 0.999 - angleCutoffAdjust, abs(dot(normal, vViewSegmentNormal))));
fragColor = laserlineOutput(color * alpha * depthDiscontinuityAlpha);`),e}const pt=re(),ut=Ke(),ft=Object.freeze(Object.defineProperty({__proto__:null,build:he},Symbol.toStringTag,{value:"Module"}));class gt extends ht{constructor(){super(...arguments),this.origin=o()}}class O extends Q{constructor(e,i){super(e,i,new J(ft,()=>ne(()=>Promise.resolve().then(()=>Pt),void 0)),mt)}}const mt=new Map([["start",0],["end",1],["extrude",2],["startUp",3],["endUp",4]]);class E extends Se{constructor(){super(...arguments),this.contrastControlEnabled=!1,this.spherical=!1}}u([V()],E.prototype,"contrastControlEnabled",void 0),u([V()],E.prototype,"spherical",void 0);class D extends E{constructor(){super(...arguments),this.heightManifoldEnabled=!1,this.pointDistanceEnabled=!1,this.lineVerticalPlaneEnabled=!1,this.intersectsLineEnabled=!1}}u([V()],D.prototype,"heightManifoldEnabled",void 0),u([V()],D.prototype,"pointDistanceEnabled",void 0),u([V()],D.prototype,"lineVerticalPlaneEnabled",void 0),u([V()],D.prototype,"intersectsLineEnabled",void 0);let P=class extends ye{constructor(t){super(t),this.isDecoration=!0,this.produces=W.LASERLINES,this.consumes={required:[W.LASERLINES,"normals"]},this.requireGeometryDepth=!0,this._configuration=new D,this._pathTechniqueConfiguration=new E,this._heightManifoldEnabled=!1,this._pointDistanceEnabled=!1,this._lineVerticalPlaneEnabled=!1,this._intersectsLineEnabled=!1,this._intersectsLineInfinite=!1,this._pathVerticalPlaneEnabled=!1,this._passParameters=new gt;const e=t.view.stage.renderView.techniques,i=new E;i.contrastControlEnabled=t.contrastControlEnabled,e.precompile(O,i)}initialize(){this._passParameters.renderCoordsHelper=this.view.renderCoordsHelper,this._pathTechniqueConfiguration.spherical=this.view.state.viewingMode===1,this._pathTechniqueConfiguration.contrastControlEnabled=this.contrastControlEnabled,this._techniques.precompile(O,this._pathTechniqueConfiguration),this._blit=new Ne(this._techniques,2)}destroy(){this._pathVerticalPlaneData=de(this._pathVerticalPlaneData),this._blit=null}get _techniques(){return this.view.stage.renderView.techniques}get heightManifoldEnabled(){return this._heightManifoldEnabled}set heightManifoldEnabled(t){this._heightManifoldEnabled!==t&&(this._heightManifoldEnabled=t,this.requestRender(1))}get heightManifoldTarget(){return this._passParameters.heightManifoldTarget}set heightManifoldTarget(t){m(this._passParameters.heightManifoldTarget,t),this.requestRender(1)}get pointDistanceEnabled(){return this._pointDistanceEnabled}set pointDistanceEnabled(t){t!==this._pointDistanceEnabled&&(this._pointDistanceEnabled=t,this.requestRender(1))}get pointDistanceTarget(){return this._passParameters.pointDistanceTarget}set pointDistanceTarget(t){m(this._passParameters.pointDistanceTarget,t),this.requestRender(1)}get pointDistanceOrigin(){return this._passParameters.pointDistanceOrigin}set pointDistanceOrigin(t){m(this._passParameters.pointDistanceOrigin,t),this.requestRender(1)}get lineVerticalPlaneEnabled(){return this._lineVerticalPlaneEnabled}set lineVerticalPlaneEnabled(t){t!==this._lineVerticalPlaneEnabled&&(this._lineVerticalPlaneEnabled=t,this.requestRender(1))}get lineVerticalPlaneSegment(){return this._passParameters.lineVerticalPlaneSegment}set lineVerticalPlaneSegment(t){R(t,this._passParameters.lineVerticalPlaneSegment),this.requestRender(1)}get intersectsLineEnabled(){return this._intersectsLineEnabled}set intersectsLineEnabled(t){t!==this._intersectsLineEnabled&&(this._intersectsLineEnabled=t,this.requestRender(1))}get intersectsLineSegment(){return this._passParameters.intersectsLineSegment}set intersectsLineSegment(t){R(t,this._passParameters.intersectsLineSegment),this.requestRender(1)}get intersectsLineInfinite(){return this._intersectsLineInfinite}set intersectsLineInfinite(t){t!==this._intersectsLineInfinite&&(this._intersectsLineInfinite=t,this.requestRender(1))}get pathVerticalPlaneEnabled(){return this._pathVerticalPlaneEnabled}set pathVerticalPlaneEnabled(t){t!==this._pathVerticalPlaneEnabled&&(this._pathVerticalPlaneEnabled=t,this._pathVerticalPlaneData!=null&&this.requestRender(1))}set pathVerticalPlaneVertices(t){this._pathVerticalPlaneData==null&&(this._pathVerticalPlaneData=new B(this._passParameters.renderCoordsHelper)),this._pathVerticalPlaneData.vertices=t,this.pathVerticalPlaneEnabled&&this.requestRender(1)}set pathVerticalPlaneBuffers(t){this._pathVerticalPlaneData==null&&(this._pathVerticalPlaneData=new B(this._passParameters.renderCoordsHelper)),this._pathVerticalPlaneData.buffers=t,this.pathVerticalPlaneEnabled&&this.requestRender(1)}setParameters(t){Le(this._passParameters,t)&&this.requestRender(1)}precompile(){this._acquireTechnique()}render(t){const e=t.find(({name:a})=>a===this.produces);if(this.isDecoration&&!this.bindParameters.decorations||this._blit==null)return e;const i=this.renderingContext,n=t.find(({name:a})=>a==="normals");this._passParameters.normals=n?.getTexture();const s=()=>{(this.heightManifoldEnabled||this.pointDistanceEnabled||this.lineVerticalPlaneSegment||this.intersectsLineEnabled)&&this._renderUnified(),this.pathVerticalPlaneEnabled&&this._renderPath()};if(!this.contrastControlEnabled)return i.bindFramebuffer(e.fbo),s(),e;this._passParameters.colors=e.getTexture();const r=this.fboCache.acquire(e.fbo.width,e.fbo.height,"laser lines");return i.bindFramebuffer(r.fbo),i.setClearColor(0,0,0,0),i.clear(16640),s(),i.unbindTexture(e.getTexture()),this._blit.blend(i,r,e,this.bindParameters)||this.requestRender(1),r.release(),e}_acquireTechnique(){return this._configuration.heightManifoldEnabled=this.heightManifoldEnabled,this._configuration.lineVerticalPlaneEnabled=this.lineVerticalPlaneEnabled,this._configuration.pointDistanceEnabled=this.pointDistanceEnabled,this._configuration.intersectsLineEnabled=this.intersectsLineEnabled,this._configuration.contrastControlEnabled=this.contrastControlEnabled,this._configuration.spherical=this.view.state.viewingMode===1,this._techniques.get(dt,this._configuration)}_renderUnified(){if(!this._updatePassParameters())return;const t=this._acquireTechnique();if(t.compiled){const e=this.renderingContext;e.bindTechnique(t,this.bindParameters,this._passParameters),e.screen.draw()}else this.requestRender(1)}_renderPath(){if(this._pathVerticalPlaneData==null)return;const t=this._techniques.get(O,this._pathTechniqueConfiguration);if(t.compiled){const e=this.renderingContext;this._passParameters.origin=this._pathVerticalPlaneData.origin,e.bindTechnique(t,this.bindParameters,this._passParameters),this._pathVerticalPlaneData.draw(e)}else this.requestRender(1)}_updatePassParameters(){if(!this._intersectsLineEnabled)return!0;const t=this.bindParameters.camera,e=this._passParameters;if(this._intersectsLineInfinite){if(ge(Ve(e.intersectsLineSegment.origin,e.intersectsLineSegment.vector),x),x.c0=-Number.MAX_VALUE,!_e(t.frustum,x))return!1;be(x,e.lineStartWorld),Pe(x,e.lineEndWorld)}else m(e.lineStartWorld,e.intersectsLineSegment.origin),k(e.lineEndWorld,e.intersectsLineSegment.origin,e.intersectsLineSegment.vector);return!0}get test(){}};u([L({constructOnly:!0})],P.prototype,"contrastControlEnabled",void 0),u([L()],P.prototype,"isDecoration",void 0),u([L()],P.prototype,"produces",void 0),u([L()],P.prototype,"consumes",void 0),P=u([pe("esri.views.3d.webgl-engine.effects.laserlines.LaserLineRenderer")],P);const x=me();class Wt extends we{constructor(e){super(e),this._angleCutoff=q,this._style={},this._heightManifoldTarget=o(),this._heightManifoldEnabled=!1,this._intersectsLine=I(),this._intersectsLineEnabled=!1,this._intersectsLineInfinite=!1,this._lineVerticalPlaneSegment=null,this._pathVerticalPlaneBuffers=null,this._pointDistanceLine=null,this.applyProperties(e)}get testData(){}createResources(){this._ensureRenderer()}destroyResources(){this._disposeRenderer()}updateVisibility(){this._syncRenderer(),this._syncHeightManifold(),this._syncIntersectsLine(),this._syncPathVerticalPlane(),this._syncLineVerticalPlane(),this._syncPointDistance()}get angleCutoff(){return this._angleCutoff}set angleCutoff(e){this._angleCutoff!==e&&(this._angleCutoff=e,this._syncAngleCutoff())}get style(){return this._style}set style(e){this._style=e,this._syncStyle()}get heightManifoldTarget(){return this._heightManifoldEnabled?this._heightManifoldTarget:null}set heightManifoldTarget(e){e!=null?(m(this._heightManifoldTarget,e),this._heightManifoldEnabled=!0):this._heightManifoldEnabled=!1,this._syncRenderer(),this._syncHeightManifold()}set intersectsWorldUpAtLocation(e){if(e==null)return void(this.intersectsLine=null);const i=this.view.renderCoordsHelper.worldUpAtPosition(e,_t);this.intersectsLine=fe(e,i),this.intersectsLineInfinite=!0}get intersectsLine(){return this._intersectsLineEnabled?this._intersectsLine:null}set intersectsLine(e){e!=null?(R(e,this._intersectsLine),this._intersectsLineEnabled=!0):this._intersectsLineEnabled=!1,this._syncIntersectsLine(),this._syncRenderer()}get intersectsLineInfinite(){return this._intersectsLineInfinite}set intersectsLineInfinite(e){this._intersectsLineInfinite=e,this._syncIntersectsLineInfinite()}get lineVerticalPlaneSegment(){return this._lineVerticalPlaneSegment}set lineVerticalPlaneSegment(e){this._lineVerticalPlaneSegment=e!=null?R(e):null,this._syncLineVerticalPlane(),this._syncRenderer()}get pathVerticalPlane(){return this._pathVerticalPlaneBuffers}set pathVerticalPlane(e){this._pathVerticalPlaneBuffers=e,this._syncPathVerticalPlane(),this._syncLineVerticalPlane(),this._syncPointDistance(),this._syncRenderer()}get pointDistanceLine(){return this._pointDistanceLine}set pointDistanceLine(e){this._pointDistanceLine=e!=null?{origin:N(e.origin),target:e.target?N(e.target):null}:null,this._syncPointDistance(),this._syncRenderer()}get isDecoration(){return this._isDecoration}set isDecoration(e){this._isDecoration=e,this._renderer&&(this._renderer.isDecoration=e)}_syncRenderer(){this.attached&&this.visible&&(this._intersectsLineEnabled||this._heightManifoldEnabled||this._pointDistanceLine!=null||this._pathVerticalPlaneBuffers!=null)?this._ensureRenderer():this._disposeRenderer()}_ensureRenderer(){this._renderer==null&&(this._renderer=new P({view:this.view,contrastControlEnabled:!0,isDecoration:this.isDecoration}),this._syncStyle(),this._syncHeightManifold(),this._syncIntersectsLine(),this._syncIntersectsLineInfinite(),this._syncPathVerticalPlane(),this._syncLineVerticalPlane(),this._syncPointDistance(),this._syncAngleCutoff())}_syncStyle(){this._renderer!=null&&this._renderer.setParameters(this._style)}_syncAngleCutoff(){this._renderer?.setParameters({angleCutoff:this._angleCutoff})}_syncHeightManifold(){this._renderer!=null&&(this._renderer.heightManifoldEnabled=this._heightManifoldEnabled&&this.visible,this._heightManifoldEnabled&&(this._renderer.heightManifoldTarget=this._heightManifoldTarget))}_syncIntersectsLine(){this._renderer!=null&&(this._renderer.intersectsLineEnabled=this._intersectsLineEnabled&&this.visible,this._intersectsLineEnabled&&(this._renderer.intersectsLineSegment=this._intersectsLine))}_syncIntersectsLineInfinite(){this._renderer!=null&&(this._renderer.intersectsLineInfinite=this._intersectsLineInfinite)}_syncPathVerticalPlane(){this._renderer!=null&&(this._renderer.pathVerticalPlaneEnabled=this._pathVerticalPlaneBuffers!=null&&this.visible,this._pathVerticalPlaneBuffers!=null&&(this._renderer.pathVerticalPlaneBuffers=this._pathVerticalPlaneBuffers))}_syncLineVerticalPlane(){this._renderer!=null&&(this._renderer.lineVerticalPlaneEnabled=this._lineVerticalPlaneSegment!=null&&this.visible,this._lineVerticalPlaneSegment!=null&&(this._renderer.lineVerticalPlaneSegment=this._lineVerticalPlaneSegment))}_syncPointDistance(){if(this._renderer==null)return;const e=this._pointDistanceLine,i=e!=null;this._renderer.pointDistanceEnabled=i&&e.target!=null&&this.visible,i&&(this._renderer.pointDistanceOrigin=e.origin,e.target!=null&&(this._renderer.pointDistanceTarget=e.target))}_disposeRenderer(){this._renderer!=null&&this.view.stage&&(this._renderer.destroy(),this._renderer=null)}forEachMaterial(){}}const _t=o(),bt=Object.freeze(Object.defineProperty({__proto__:null,build:oe,defaultAngleCutoff:q},Symbol.toStringTag,{value:"Module"})),Pt=Object.freeze(Object.defineProperty({__proto__:null,build:he},Symbol.toStringTag,{value:"Module"}));export{Wt as H};
