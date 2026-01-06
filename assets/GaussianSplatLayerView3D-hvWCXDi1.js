import{c1 as se,_ as q,a as Ae,i as Le,o as Ue,m as Y}from"./jsonMap-Bs3hmeCU.js";import{l as te,w as je}from"./reactiveUtils-SO2Ko3sy.js";import{aS as We,a1 as Ne,R as Ze,af as Ye}from"./Point-62ir3Nzl.js";import{n as Qe}from"./quatf64-CCm9z-pX.js";import{d as Xe,bJ as Je,V as Ke,bL as he,ae as et,ag as tt,af as it,bM as at}from"./ShadowCastClear.glsl-BGPoo-07.js";import{_ as st}from"./tiles3DUtils-D7SG71qr.js";import{z as rt}from"./elevationInfoUtils-OU8rgnDX.js";import{n as nt}from"./unitConversionUtils-BSQ4LGUO.js";import{l as ot}from"./LayerView3D-CCv_nmv5.js";import{G as pe}from"./orientedBoundingBox-CbUQAgG7.js";import{i as lt}from"./memoryEstimations-Bd726a_p.js";import{F as ct}from"./Polygon-BbQMC1ht.js";import{r as ut,l as ht,n as pt}from"./vec2f64-rIxtbMRN.js";import{c as de,r as dt,g as Q,y as mt,P as me,j as ft,M as _t,s as vt}from"./vec32-zHQcyKRA.js";import{i as fe,n as z,t as gt}from"./collectionUtils-CB98pReO.js";import{s as xt}from"./vec42-fTNpW1Xv.js";import{j as yt}from"./plane-CAH7O3r1.js";import{S as wt,q as bt,W as Pt}from"./sphere-DGD4QNOm.js";import{r as $e,A as ze,T as re,V as ne,a$ as St,aq as Ct,bj as _e,ao as ve,be as Tt,Y as Dt,aW as Me,a1 as L,a2 as U,b1 as j,a3 as W,at as qe,a8 as oe,ba as Ge,bf as At,af as ge,b2 as $t,bc as xe}from"./Texture-CAvBvljT.js";import{s as zt}from"./intersectorUtilsConversions-Cv_V2i_M.js";import{r as Mt}from"./signal-BX9ezF8a.js";import{o as qt}from"./WorkerHandle-IsvMxqHu.js";import{N as Ie,E as Oe,A as Gt,n as X,_ as ye}from"./enums-B4pqBiXb.js";import{f as It}from"./HUDIntersectorResult-Ds4yeNc-.js";import{_ as N}from"./index-CB_zX-aI.js";import{d as Ot}from"./LayerView-B4B44Ajx.js";import{l as kt,t as Rt}from"./layerViewUtils-BTa15X3o.js";import{t as w,f as J,e as we,n as Ft,j as ie}from"./Emissions.glsl-B8XKMjLy.js";import"./reader-DcGs6kKN.js";import"./jsonUtils-alsySR4T.js";import"./Extent-Cs-ESnE1.js";import"./Polyline-CUSonZ4c.js";import"./typeUtils-BR_JAZOz.js";import"./modeUtils-BF30GgRz.js";import"./intl-BIQN36K8.js";import"./date-IqUzANpt.js";import"./uuid-Oe6SV2kF.js";import"./sanitizerUtils-BT_8V5US.js";import"./SimpleObservable-CvFyr0NA.js";import"./screenUtils-BitdhK1O.js";import"./lengthUtils-Cm-zragw.js";import"./workers-VgzaPqUK.js";import"./Queue-CYlrXMwB.js";import"./PooledRBush-Dco5QkUp.js";import"./quickselect-QQC62dOK.js";import"./GraphicsCollection-mGxi3VN1.js";import"./Graphic-CkB18CDi.js";import"./getPopupProvider-mckaq9Ri.js";import"./Color-CERqXxxY.js";import"./mathUtils-PIGhLnI9.js";import"./Layer-BLV7fz0K.js";import"./createFeatureId-CVwTD0fV.js";import"./typeUtils-D0MaDvT3.js";import"./lineMarkers-CDwLe3J6.js";import"./PolygonSymbol3D-Dla3O-pf.js";import"./ExtrudeSymbol3DLayer-DSc1ou2x.js";import"./opacityUtils-DuFH0EC9.js";import"./aaBoundingBox-DO0Hqciy.js";import"./aaBoundingRect-DfeeUq5j.js";import"./DoubleArray-DExKNiTh.js";import"./mat4f64-q_b6UJoq.js";import"./Font-BYMGzku7.js";import"./SimpleFillSymbol-CDawtd9z.js";import"./SimpleMarkerSymbol-BGAFRS9_.js";import"./PictureMarkerSymbol-CjQJkY_m.js";import"./TextSymbol-Ck-WHI2u.js";import"./HeightModelInfo-CNRqlD7K.js";import"./projectionUtils-ClsoIho7.js";import"./spatialReferenceEllipsoidUtils-BGTSZp-L.js";import"./projectPointToVector-B1tbWJiK.js";import"./RealisticTree.glsl-DAhEIR1w.js";import"./mat4-Bjnccznk.js";import"./vec4f64-DPb6J-GU.js";import"./BufferView-CdBDKeBv.js";import"./InterleavedLayout-KZk0acs8.js";import"./types-BKo2foNY.js";import"./VertexElementDescriptor-BlxU8vCE.js";import"./meshVertexSpaceUtils-BZiL5Bbc.js";import"./MeshLocalVertexSpace-De2t7DNQ.js";import"./projectVectorToVector-CDqzCeaL.js";import"./vec3f32-WCVSSNPR.js";import"./Indices-D0_UQPPr.js";import"./Intersector-BFu7YAUe.js";import"./frustum-Cq95H2HO.js";import"./vector-knXISDaK.js";import"./scaleUtils-m8EJvm5m.js";import"./layerUtils-4EQ207Ij.js";import"./TilemapCache-DrtAz5a3.js";import"./LRUCache-fy84PBMi.js";import"./TileKey-zev9cGPe.js";import"./tagSymbols-BPcGfZon.js";import"./UpdatingHandles-D2RI_3Hb.js";import"./asyncUtils-w6KfWU41.js";import"./Map-DoBsBAGU.js";import"./Basemap-BI8rdNrf.js";import"./loadAll-CleWBL8j.js";import"./PortalItem-QIiqvhel.js";import"./writeUtils-D0J7VXri.js";import"./CollectionFlattener-C1ewYzfL.js";import"./persistable-AW3PLevT.js";import"./MD5-MtSiOt06.js";import"./multiOriginJSONSupportUtils-C0wm8_Yw.js";import"./resourceExtension-3aprB2zB.js";import"./PolygonCollection-BQYUC051.js";import"./mat4f32-Djp3mnm5.js";import"./TablesMixin-MGFFfhKn.js";import"./timeZoneUtils-BSc7-7qA.js";import"./ReactiveMap-B0by2bYu.js";import"./Query-98igen-k.js";import"./Field-Cm_ZejYW.js";import"./fieldType-DVUzXtk_.js";import"./normalizeUtils-BTK6arYa.js";import"./Cyclical-BLSxUpe7.js";import"./normalizeUtilsCommon-BRJdiLvx.js";import"./utils-uBZTDKaj.js";import"./utils-tSEVTzcz.js";import"./ElevationQuery-C16QuML_.js";import"./TileInfo-fM6eYiPH.js";import"./Scheduler-CNrsbccs.js";import"./constants-D67WmGms.js";import"./quat-CCdR5JrD.js";import"./computeTranslationToOriginAndRotation-CTVG2hGD.js";import"./floatRGBA-D95YiFWR.js";import"./labelUtils-BtizwBfq.js";import"./ArcadeExpression-BKKJxDUn.js";import"./TimeOnly-DbBUn0Ig.js";import"./enum-BzLwmiID.js";import"./UnknownTimeZone-B697BDFv.js";import"./FieldsIndex-DoTtx8Ak.js";import"./TileKey-C44YQC4_.js";import"./vec2f32-CaVKkSa6.js";import"./dehydratedFeatures-BBoTEZJ8.js";import"./quantizationUtils-BSWXSK29.js";import"./featureConversionUtils-DlTGrdYn.js";import"./OptimizedFeature-CwRGZPwv.js";import"./OptimizedFeatureSet-BR8EEvDc.js";import"./Octree-vaE3elxD.js";import"./DefaultLoadingContext-BnNmzeR1.js";import"./wosrLoader-B8RYB0d4.js";import"./Version-BtYZEj58.js";import"./axisAngleDegrees-D1LL0HZb.js";import"./edgePreprocessing-CBVaMT5L.js";import"./config-Dg972SSE.js";import"./GeometryUtils-BUMmi0hw.js";import"./definitions-Dvg4hMIw.js";import"./colorUtils-CfxFVJbg.js";import"./vec3-B_phcnZY.js";import"./vec33-CWJeyzxV.js";import"./capabilities-Bi6C4OG6.js";import"./imageUtils-DRSdxeif.js";import"./videoUtils-Dwx3AEgj.js";let Et=class extends Xe{constructor(e,t,a,r){super(e,0,0,0,t),this.cachedNodes=a,this.memoryMBCached=r}};const T=4096,ke=16,k=1023,R=k+1,Ht=T*ke/R,B=4,Re=R*B,be=k*B;let Bt=class{constructor(e=Ht){this._pageCount=e;const t=Math.ceil(e/32);this._bitset=new Uint32Array(t)}get pageCount(){return this._pageCount}isAllocated(e){const t=e/32|0,a=e%32;return!!(this._bitset[t]&1<<a)}allocate(e){const t=e/32|0,a=e%32;this._bitset[t]|=1<<a}free(e){const t=e/32|0,a=e%32;this._bitset[t]&=~(1<<a)}findFirstFreePage(){for(let e=0;e<this._bitset.length;e++)if(this._bitset[e]!==4294967295)for(let t=0;t<32;t++){const a=32*e+t;if(a>=this._pageCount)break;if(!(this._bitset[e]&1<<t))return a}return null}resize(e){this._pageCount=e;const t=Math.ceil(e/32),a=this._bitset.length;if(t!==a){const r=new Uint32Array(t),s=Math.min(a,t);r.set(this._bitset.subarray(0,s)),this._bitset=r}this._clearExcessBits(this._bitset,e)}_clearExcessBits(e,t){const a=Math.floor((t-1)/32),r=(t-1)%32;if(t>0&&r<31){const s=(1<<r+1)-1;e[a]&=s}a+1<e.length&&e.fill(0,a+1)}};class Vt{constructor(e,t,a,r,s,d,u){this.handle=e,this.obb=t,this.gaussianAtlasIndices=a,this.pageIds=r,this.positions=s,this.squaredScales=d,this.maxScale=u,this.isVisible=!1,this.usedMemory=lt(this.gaussianAtlasIndices,this.positions,this.squaredScales)+this.pageIds.length*Re*4}}class Lt extends qt{constructor(e){super("GaussianSplatSortWorker","sort",{sort:t=>[t.distances.buffer,t.sortOrderIndices.buffer]},e,{strategy:"dedicated"})}sort(e,t){return this.invokeMethod("sort",e,t)}async destroyWorkerAndSelf(){await this.broadcast({},"destroy"),this.destroy()}}let Ut=class{constructor(e){this.texture=null,this._orderTextureCapacity=0,this._rctx=e}ensureCapacity(e){if(this._orderTextureCapacity<e){this.texture?.dispose();const t=Math.ceil(e*se),a=this._evalTextureSize(t),r=a[0]*a[1];this._orderBuffer=new Uint32Array(r);const s=new $e;s.height=a[0],s.width=a[1],s.pixelFormat=36244,s.dataType=Ie.UNSIGNED_INT,s.internalFormat=Oe.R32UI,s.wrapMode=33071,s.samplingMode=9728,this.texture=new ze(this._rctx,s),this._orderTextureCapacity=r}}setData(e,t){this.ensureCapacity(t),this._orderBuffer?.set(e),this.texture?.setData(this._orderBuffer)}clear(){this._orderTextureCapacity=0,this.texture?.dispose(),this.texture=null}destroy(){this.texture?.dispose()}_evalTextureSize(e){const t=Math.ceil(Math.sqrt(e)),a=Math.ceil(e/t);return ut(t,a)}},jt=class{constructor(e,t,a){this._splatAtlasTextureHeight=ke,this.texture=null,this._rctx=e,this._fboCache=a,this.pageAllocator=new Bt,this._cache=t.newCache("gaussian texture cache",r=>r.dispose())}ensureTextureAtlas(){if(this.texture)return;const e=this._cache.pop("splatTextureAtlas");if(e)return void(this.texture=e);const t=new $e;t.height=this._splatAtlasTextureHeight,t.width=T,t.pixelFormat=36249,t.dataType=Ie.UNSIGNED_INT,t.internalFormat=Oe.RGBA32UI,t.samplingMode=9728,t.wrapMode=33071,this.texture=new ze(this._rctx,t),this._updatePageAllocator()}grow(){if(!this.texture)return this.ensureTextureAtlas(),!1;const e=Math.floor(this._splatAtlasTextureHeight*se);if(e*T>this._rctx.parameters.maxPreferredTexturePixels)return!1;const t=new Je(this._rctx,this.texture),a=this._fboCache.acquire(T,e,"gaussian splat atlas resize",11);return this._rctx.blitFramebuffer(t,a.fbo,16384,9728,0,0,T,this._splatAtlasTextureHeight,0,0,T,this._splatAtlasTextureHeight),this.texture?.dispose(),this.texture=a.fbo?.detachColorTexture(),t.dispose(),a.dispose(),this._splatAtlasTextureHeight=e,this._updatePageAllocator(),!0}requestPage(){let e=this.pageAllocator.findFirstFreePage();return e===null&&this.grow()&&(e=this.pageAllocator.findFirstFreePage()),e!==null&&this.pageAllocator.allocate(e),e}freePage(e){this.pageAllocator.free(e)}update(e,t,a){this.ensureTextureAtlas(),this.texture.updateData(0,e,t,R,1,a)}_updatePageAllocator(){const e=T*this._splatAtlasTextureHeight/R;this.pageAllocator.pageCount!==e&&this.pageAllocator.resize(e)}clear(){this.texture&&(this._cache.put("splatTextureAtlas",this.texture),this.texture=null)}destroy(){this._cache.destroy(),this.texture?.dispose()}},Wt=class{constructor(e){this._updating=Mt(!1),this.visibleGaussians=0,this._visibleGaussianTiles=new Array,this._workerHandle=null,this._isSorting=!1,this._pendingSortTask=!1,this._bufferCapacity=0,this._renderer=e,this._orderTexture=new Ut(this._renderer.renderingContext),this._textureAtlas=new jt(this._renderer.renderingContext,this._renderer.view.resourceController.memoryController,this._renderer.fboCache);const{resourceController:t}=this._renderer.view;this._workerHandle=new Lt(Ke(t))}get textureAtlas(){return this._textureAtlas}get orderTexture(){return this._orderTexture}get visibleGaussianTiles(){return this._visibleGaussianTiles}updateGaussianVisibility(e){this._visibleGaussianTiles=e,this.requestSort()}isUpdating(){return this._updating.value}destroy(){this._pendingSortTask=!1,this._workerHandle?.destroyWorkerAndSelf(),this._textureAtlas.destroy(),this._orderTexture.destroy()}requestSort(){this._updating.value=!0,this._isSorting?this._pendingSortTask=!0:(this._isSorting=!0,this._pendingSortTask=!1,this._sortOnWorker().then(()=>this._handleSortComplete()).catch(()=>this._handleSortComplete()))}_handleSortComplete(){this._isSorting=!1,this._pendingSortTask?this.requestSort():this._updating.value=!1}_clearBuffersAndTextures(){this._bufferCapacity=0,this._orderTexture.clear(),this._textureAtlas.clear()}_ensureBufferCapacity(e){if(this._bufferCapacity<e){const t=Math.ceil(e*se);this._atlasIndicesBuffer=new Uint32Array(t),this._sortedAtlasIndicesBuffer=new Uint32Array(t),this._distancesBuffer=new Float64Array(t),this._sortOrderBuffer=new Uint32Array(t),this._bufferCapacity=t}}async _sortOnWorker(){let e=0;if(this._visibleGaussianTiles.forEach(n=>e+=n.gaussianAtlasIndices.length),e===0)return this.visibleGaussians=0,this._clearBuffersAndTextures(),void this._renderer.requestRender(1);this._ensureBufferCapacity(e),this._textureAtlas.ensureTextureAtlas();const t=this._renderer.camera.eye,a=t[0],r=t[1],s=t[2],d=this._atlasIndicesBuffer.subarray(0,e);let u=0;this._visibleGaussianTiles.forEach(n=>{const c=n.gaussianAtlasIndices,h=n.positions;for(let o=0;o<c.length;o++){d[u]=c[o];const x=3*o,g=h[x],l=h[x+1],p=h[x+2],_=g-a,v=l-r,b=p-s;this._distancesBuffer[u]=_*_+v*v+b*b,u++}});for(let n=0;n<e;n++)this._sortOrderBuffer[n]=n;const m={distances:this._distancesBuffer,sortOrderIndices:this._sortOrderBuffer,numGaussians:e,preciseSort:!1};await this._workerHandle?.sort(m).then(n=>{this._distancesBuffer=n.distances,this._sortOrderBuffer=n.sortedOrderIndices;const c=this._sortedAtlasIndicesBuffer.subarray(0,e);for(let o=0;o<e;o++)c[o]=d[n.sortedOrderIndices[o]];this._orderTexture.setData(c,e);const h=this._renderer.view.qualitySettings.gaussianSplat.maxAllowedVisibleGaussians;this.visibleGaussians=Math.min(e,h),this._renderer.requestRender(1)})}};function Nt(i){i.code.add(w`void computeCovariance3D(in mat3 rotation, in vec3 scale, out vec3 covarianceA, out vec3 covarianceB) {
mat3 scaleMatrix = mat3(
vec3(scale.x, 0.0, 0.0),
vec3(0.0, scale.y, 0.0),
vec3(0.0, 0.0, scale.z)
);
mat3 M = scaleMatrix * rotation;
mat3 covariance3D = transpose(M) * M;
covarianceA = vec3(covariance3D[0][0], covariance3D[0][1], covariance3D[0][2]);
covarianceB = vec3(covariance3D[1][1], covariance3D[1][2], covariance3D[2][2]);
}
vec3 computeCovariance2D(vec3 center, float focalLength, vec2 tanFov, float[6] cov3D, mat4 view) {
vec4 viewSpacePoint = vec4(center, 1);
vec2 max = 1.3 * tanFov;
vec2 normalized = viewSpacePoint.xy / viewSpacePoint.z;
viewSpacePoint.xy = clamp(normalized, -max, max) * viewSpacePoint.z;
float invZ = 1.0 / viewSpacePoint.z;
float invZSquared = invZ * invZ;
mat3 projectionJacobian = mat3(
focalLength * invZ,  0.0,                   -(focalLength * viewSpacePoint.x) * invZSquared,
0.0,                 focalLength * invZ,    -(focalLength * viewSpacePoint.y) * invZSquared,
0.0,                 0.0,                   0.0
);
mat3 worldToView = transpose(mat3(view));
mat3 T = worldToView * projectionJacobian;
mat3 covariance3D = mat3(
cov3D[0], cov3D[1], cov3D[2],
cov3D[1], cov3D[3], cov3D[4],
cov3D[2], cov3D[4], cov3D[5]
);
mat3 covariance2D = transpose(T) * transpose(covariance3D) * T;
const float regularization = 0.3;
covariance2D[0][0] += regularization;
covariance2D[1][1] += regularization;
return vec3(covariance2D[0][0], covariance2D[0][1], covariance2D[1][1]);
}`)}function Zt(i){i.code.add(w`vec4 unpackColor(uvec4 packedGaussian) {
vec4 color;
color.r = float((packedGaussian.w >> 1u) & 0xfeu);
color.g = float((packedGaussian.w >> 9u) & 0xffu);
color.b = float((packedGaussian.w >> 16u) & 0xfeu);
color.a = float((packedGaussian.w >> 24u) & 0xffu);
return color / 255.0;
}`),i.code.add(w`vec3 unpackScale(uvec4 packedGaussian) {
uint sx = (packedGaussian.z >> 10u) & 0xffu;
uint sy = (packedGaussian.z >> 18u) & 0xffu;
uint szLow = (packedGaussian.z >> 26u) & 0x3fu;
uint szHigh = packedGaussian.a & 0x3u;
uint sz = szLow | (szHigh << 6u);
return exp(vec3(sx, sy, sz) / 16.0 - 10.0);
}`),i.code.add(w`const uint MASK_9_BITS = 0x1FFu;
const float SQRT_HALF = 0.7071067811865476;
const ivec3 COMPONENT_ORDER[4] = ivec3[4](
ivec3(3, 2, 1),
ivec3(3, 2, 0),
ivec3(3, 1, 0),
ivec3(2, 1, 0)
);
vec4 unpackQuaternion(uvec4 packedGaussian) {
uint packedRotation = packedGaussian.x;
uint largestComponent = packedRotation >> 30u;
vec4 quaternion = vec4(0.0);
float sumSquares = 0.0;
uint bitfield = packedRotation;
for (int j = 0; j < 3; ++j) {
int index = COMPONENT_ORDER[int(largestComponent)][j];
uint magnitude = bitfield & MASK_9_BITS;
uint signBit = (bitfield >> 9u) & 1u;
bitfield = bitfield >> 10u;
float value = SQRT_HALF * float(magnitude) / float(MASK_9_BITS);
quaternion[index] = signBit == 1u ? -value : value;
sumSquares += value * value;
}
quaternion[int(largestComponent)] = sqrt(1.0 - sumSquares);
return quaternion;
}`),i.code.add(w`vec3 unpackTileOriginRelativePosition(uvec4 packedGaussian) {
uint packedPositionLow = packedGaussian.y;
uint packedPositionHigh = packedGaussian.z;
uint x = packedPositionLow & 0x3FFFu;
uint y = (packedPositionLow >> 14u) & 0x3FFFu;
uint zLow = (packedPositionLow >> 28u) & 0xFu;
uint zHigh = packedPositionHigh & 0x3FFu;
uint z = zLow | (zHigh << 4u);
return vec3(float(x), float(y), float(z));
}`),i.code.add(w`vec3 unpackCameraRelativeGaussianPosition(uvec4 packedHeader, highp vec3 position, vec3 cameraPosition, vec3 cameraPos8k, vec3 cameraDelta) {
vec3 tileOrigin = uintBitsToFloat(packedHeader.xyz);
float invPosScale = 1.0 / exp2(float(packedHeader.w & 0xffu));
vec3 delta = tileOrigin.xyz - cameraPos8k;
vec3 cameraRelativePosition = position.xyz * invPosScale + delta * 2.048 - cameraDelta;
return cameraRelativePosition;
}`)}function Yt(i){i.code.add(w`mat3 quaternionToRotationMatrix(vec4 q) {
float x2 = q.x + q.x;
float y2 = q.y + q.y;
float z2 = q.z + q.z;
float xx = x2 * q.x;
float yy = y2 * q.y;
float zz = z2 * q.z;
float xy = x2 * q.y;
float xz = x2 * q.z;
float yz = y2 * q.z;
float wx = x2 * q.w;
float wy = y2 * q.w;
float wz = z2 * q.w;
return mat3(
1.0 - (yy + zz), xy - wz, xz + wy,
xy + wz, 1.0 - (xx + zz), yz - wx,
xz - wy, yz + wx, 1.0 - (xx + yy)
);
}`)}class le extends re{constructor(){super(...arguments),this.totalGaussians=-1,this.focalLength=-1,this.minSplatRadius=-1,this.minSplatOpacity=-1,this.tanFov=ht,this.cameraDelta=fe,this.cameraPos8k=fe}}function Fe(i){const e=new ne;e.varyings.add("vColor","vec4"),e.varyings.add("conicOpacity","vec4"),e.varyings.add("depth","float"),e.varyings.add("gaussianCenterScreenPos","vec2"),e.varyings.add("fragScreenPos","vec2"),e.outputs.add("fragColor","vec4",0),e.vertex.uniforms.add(new he("splatOrderTexture",a=>a.splatOrder),new he("splatAtlasTexture",a=>a.splatAtlas),new St("numSplats",a=>a.totalGaussians),new J("focalLength",a=>a.focalLength),new J("minSplatRadius",a=>a.minSplatRadius),new J("minSplatOpacity",a=>a.minSplatOpacity),new Ct("tanFov",a=>a.tanFov),new we("cameraDelta",a=>a.cameraDelta),new we("cameraPos8k",a=>a.cameraPos8k),new _e("fullWidth",({camera:a})=>a.viewport[2]),new _e("fullHeight",({camera:a})=>a.viewport[3]),new ve("proj",a=>a.camera.projectionMatrix),new ve("view",a=>a.camera.viewMatrix),new Tt("cameraPosition",a=>a.camera.eye)),e.vertex.include(Zt),e.vertex.include(Yt),e.vertex.include(Nt),e.include(Dt,i),e.vertex.code.add(w`float ndcToPixel(float ndcCoord, float screenSize) {
return ((ndcCoord + 1.0) * screenSize - 1.0) * 0.5;
}`),e.vertex.main.add(`
    uint instanceID = uint(gl_InstanceID);

    // Transform the instanceID into 2D coordinates
    uint orderTextureWidth = uint(textureSize(splatOrderTexture, 0).x);
    uint x = instanceID % orderTextureWidth;
    uint y = instanceID / orderTextureWidth;

    // Fetch the index of the remaining frontmost Gaussian
    uint gaussianIndex = texelFetch(splatOrderTexture, ivec2(x, y), 0).r;

    uint splatAtlasSize = uint(textureSize(splatAtlasTexture, 0).x);

    // Fetch the packed Gaussian according to the index
    uint gaussianIndexX = gaussianIndex % uint(splatAtlasSize);
    uint gaussianIndexY = gaussianIndex / uint(splatAtlasSize);
    uvec4 packedGaussian = texelFetch(splatAtlasTexture, ivec2(gaussianIndexX, gaussianIndexY), 0);

    // Fetch the header associated with the packed Gaussian (contains tile origin and number of fractional bits)
    uint pageNum = gaussianIndex / 1024u;
    uint headerIndex = (pageNum + 1u) * 1024u - 1u;
    uint headerIndexX = headerIndex % uint(splatAtlasSize);
    uint headerIndexY = headerIndex / uint(splatAtlasSize);
    uvec4 packedHeader = texelFetch(splatAtlasTexture, ivec2(headerIndexX, headerIndexY), 0);

    // Unpack the Gaussian
    vColor = unpackColor(packedGaussian);
    // Ignore gaussians with very small contribution, with tolerance based on the quality profile
    if(vColor.a < minSplatOpacity) {
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
      return;
    }

    vec3 scale = unpackScale(packedGaussian); 
    vec4 quaternion = unpackQuaternion(packedGaussian);
    mat3 rotation = quaternionToRotationMatrix(quaternion);
    vec3 tileOriginRelativePosition = unpackTileOriginRelativePosition(packedGaussian);

    vec3 cameraRelativePosition = unpackCameraRelativeGaussianPosition(packedHeader, tileOriginRelativePosition, cameraPosition, cameraPos8k, cameraDelta);

    vec4 viewPos = vec4(mat3(view) * cameraRelativePosition, 1);

    if (viewPos.z > 1.0) {
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
      return;
    }

    forwardViewPosDepth(viewPos.xyz);

    vec3 covarianceA;
    vec3 covarianceB;
    computeCovariance3D(rotation, scale.xyz, covarianceA, covarianceB);

    float covariance3D[6] = float[6](covarianceA.x, covarianceA.y, covarianceA.z, covarianceB.x, covarianceB.y, covarianceB.z);

    vec3 covariance2D = computeCovariance2D(viewPos.xyz, focalLength, tanFov, covariance3D, view);
    
    // Invert covariance (EWA algorithm)
    float determinant = (covariance2D.x * covariance2D.z - covariance2D.y * covariance2D.y);
    if (determinant == 0.) {
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
      return;
    }
    float invDeterminant = 1. / determinant;
    

    vec4 projPos = proj * viewPos;
    float invW = 1. / (projPos.w + 1e-7);
    vec3 ndcPos = projPos.xyz * invW;

    // Compute extent in screen space (by finding the eigenvalues of the 2D covariance matrix). 
    // Use the extent to compute the bounding rectangle of the Gaussian in screen space.
    float mid = 0.5 * (covariance2D.x + covariance2D.z);
    float lambda1 = mid + sqrt(max(0.1, mid * mid - determinant));
    float lambda2 = mid - sqrt(max(0.1, mid * mid - determinant));
    float radius = ceil(3. * sqrt(max(lambda1, lambda2)));
    gaussianCenterScreenPos = vec2(ndcToPixel(ndcPos.x, float(fullWidth)), ndcToPixel(ndcPos.y, float(fullHeight)));

    // Ignore gaussians with very small contribution, with tolerance based on the quality profile
    if(minSplatRadius > 0.0) {
      float effectiveSize = radius * vColor.a;
      if(effectiveSize < minSplatRadius) {
        gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
        return;
      }
    }

    // This maps vertex IDs 0, 1, 2, 3 to (-1,-1), (1,-1), (-1,1), (1,1)
    vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2) - 1.0;

    // Vertex (corner) position in screen space
    fragScreenPos = gaussianCenterScreenPos + radius * corner;

    // We use a conic function to derive the opacity
    vec3 conic = vec3(covariance2D.z, -covariance2D.y, covariance2D.x) * invDeterminant;
    conicOpacity = vec4(conic, vColor.a);

    depth = ndcPos.z;
    
    // Convert from screen-space to clip-space
    vec2 clipPos = fragScreenPos / vec2(fullWidth, fullHeight) * 2. - 1.;

    gl_Position = vec4(clipPos, depth, 1.0);

  `);const t=i.depthPass;return e.fragment.main.add(`
    discardByTerrainDepth();
    vec2 offsetFromCenter = gaussianCenterScreenPos - fragScreenPos;

    // Evaluate the 2D elliptical Gaussian exponent using the general conic form: Ax^2+2Bxy+Cy^2
    float x = offsetFromCenter.x;
    float y = offsetFromCenter.y;
    float A = conicOpacity.x;
    float B = conicOpacity.y;
    float C = conicOpacity.z;
    float opacityScale = conicOpacity.w;
    float gaussianExponent = -0.5 * (A * x * x + 2.0 * B * x * y + C * y * y);

    // A positive exponent indicates alpha > 1, this should not happen
    if (gaussianExponent > 0.0) {
      discard;
    }

    float gaussianFalloff = exp(gaussianExponent);
    
      // cap at 0.99 to avoid blending issues, such as seams between overlapping Gaussians
    float alpha = min(.99f, opacityScale * gaussianFalloff);

    // discard low alpha fragments since their contribution would not be visible
    if (alpha < 1./255.) {
        discard;
    }

    // We cannot write color and depth in the same pass, as they require different blend modes.
    // Regular depth writing based on first hit is not precise enough due to the inherently 
    // transparent nature of Gaussian Splats (especially at the borders of the Splat).
    // We thus use a blended depth that computes a non-linear average using 
    // the splat order and opacity with geometric decay.
    // This means the depth is averaged based on the order and opacity of the Gaussians,
    // with the frontmost Gaussians contributing the most.
    ${Ft(t,"fragColor = vec4(depth, 0, 0, alpha);","fragColor = vec4(vColor.rgb * alpha, alpha);")}
  `),e}const Ee=Object.freeze(Object.defineProperty({__proto__:null,GaussianSplatPassParameters:le,build:Fe},Symbol.toStringTag,{value:"Module"}));let ce=class extends re{};function He(){const i=new ne;return i.include(Me),i.fragment.uniforms.add(new ie("colorTexture",e=>e.color),new ie("splatOutputColor",e=>e.splatColor)),i.fragment.main.add(w`vec4 color = texture(colorTexture, uv);
vec4 splatColor = texture(splatOutputColor, uv);
fragColor = splatColor + color * (1.0 - splatColor.a);`),i}const Qt=Object.freeze(Object.defineProperty({__proto__:null,GaussianSplatCompositionPassParameters:ce,build:He},Symbol.toStringTag,{value:"Module"}));let Pe=class extends L{constructor(e,t){super(e,t,new U(Qt,()=>N(()=>Promise.resolve().then(()=>Jt),void 0)),j)}initializePipeline(){return W({colorWrite:oe,depthTest:null,depthWrite:qe})}},ue=class extends re{};function Be(){const i=new ne;return i.include(Me),i.fragment.uniforms.add(new ie("splatOutputDepth",e=>e.splatDepth)),i.fragment.main.add(w`vec4 splatDepth = texture(splatOutputDepth, uv);
float ndcDepth = splatDepth.x;
float depthCutOff = 0.75;
if(splatDepth.a < depthCutOff) {
discard;
}
gl_FragDepth = (ndcDepth + 1.0) * 0.5;`),i}const Xt=Object.freeze(Object.defineProperty({__proto__:null,GaussianSplatDepthCompositionPassParameters:ue,build:Be},Symbol.toStringTag,{value:"Module"}));let Se=class extends L{constructor(e,t){super(e,t,new U(Xt,()=>N(()=>Promise.resolve().then(()=>Kt),void 0)),j)}initializePipeline(){return W({colorWrite:null,depthTest:{func:515},depthWrite:qe,drawBuffers:{buffers:[Gt]}})}},Ce=class extends L{constructor(e,t){super(e,t,new U(Ee,()=>N(()=>Promise.resolve().then(()=>Ve),void 0)),j)}_createPipeline(){return W({blending:Ge(773,773,772,1,32774,32774),depthTest:{func:513},colorWrite:oe})}initializePipeline(){return this._createPipeline()}};class Te extends L{constructor(e,t){super(e,t,new U(Ee,()=>N(()=>Promise.resolve().then(()=>Ve),void 0)),j)}_createPipeline(){return W({blending:Ge(773,773,1,1,32774,32774),depthTest:{func:515},colorWrite:oe})}initializePipeline(){return this._createPipeline()}}class V extends At{constructor(e=!1){super(),this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.occlusionPass=!1,this.depthPass=e}}q([ge()],V.prototype,"terrainDepthTest",void 0),q([ge()],V.prototype,"cullAboveTerrain",void 0);var H;let ae=class extends $t{constructor(){super(...arguments),this.gaussianPosition=z(),this.intersectionRayDir=z(),this.intersectionPlane=yt(),this._slicePlaneEnabled=!1,this._data=null,this.produces=xe.OPAQUE,this.type=0,this.isGround=!1,this.layerViewUid="",this._gaussianSplatParameters=new le,this._gaussianSplatCompositionParameters=new ce,this._gaussianSplatDepthCompositionParameters=new ue,this._splatTechniqueConfiguration=new V,this._splatDepthTechniqueConfiguration=new V(!0),this._previousCameraPosition=z(),this._previousCameraDirection=z(),this._tanFov=pt(),this._tempVec=z(),this._cameraDelta=z(),this._coarseCameraPosition=z()}static{H=this}async initialize(){this._data=new Wt(this),this.view.sceneIntersectionHelper.addIntersectionHandler(this),this.addHandles([te(()=>this.view.state.camera,()=>this._onCameraChange())])}precompile(){this._splatTechniqueConfiguration.terrainDepthTest=this.bindParameters.terrainDepthTest,this.techniques.precompile(Te,this._splatTechniqueConfiguration),this._splatDepthTechniqueConfiguration.terrainDepthTest=this.bindParameters.terrainDepthTest,this.techniques.precompile(Ce,this._splatDepthTechniqueConfiguration),this.techniques.precompile(Pe),this.techniques.precompile(Se)}render(i){const e=i.find(({name:v})=>v===xe.OPAQUE);if(!this._data.visibleGaussians||!this._data.orderTexture.texture||!this._data.textureAtlas.texture)return e;const t=this.techniques.get(Te,this._splatTechniqueConfiguration),a=this.techniques.get(Ce,this._splatDepthTechniqueConfiguration),r=this.techniques.get(Pe),s=this.techniques.get(Se);if(!(t.compiled&&a.compiled&&s.compiled&&r.compiled))return this.requestRender(1),e;const{fullWidth:d,fullHeight:u}=this.bindParameters.camera,m=this.fboCache,n=m.acquire(d,u,"gaussian color output");n.attachDepth(e.getAttachment(X));const c=this.renderingContext;c.bindFramebuffer(n.fbo),c.setClearColor(0,0,0,0),c.clear(16384),this._gaussianSplatParameters.totalGaussians=this._data.visibleGaussians,this._gaussianSplatParameters.splatOrder=this._data.orderTexture.texture,this._gaussianSplatParameters.splatAtlas=this._data.textureAtlas.texture;const h=Math.tan(.5*this.camera.fovY),o=h/u*d;ct(this._tanFov,o,h);const x=u/(2*h);this._gaussianSplatParameters.focalLength=x,this._gaussianSplatParameters.tanFov=this._tanFov;const g=this.view.qualitySettings.gaussianSplat,l=g.minimumSplatPixelRadius*Math.sqrt(d*u)/Math.sqrt(2073600);this._gaussianSplatParameters.minSplatRadius=l,this._gaussianSplatParameters.minSplatOpacity=g.minimumOpacity,this._prepareHighPrecisionCameraPosition(),this.renderingContext.bindTechnique(t,this.bindParameters,this._gaussianSplatParameters),this.renderingContext.drawArraysInstanced(ye.TRIANGLE_STRIP,0,4,this._data.visibleGaussians);const p=m.acquire(d,u,"splat depth",8);p.attachDepth(e.getAttachment(X)),c.bindFramebuffer(p.fbo),c.setClearColor(0,0,0,0),c.clear(16384),this.renderingContext.bindTechnique(a,this.bindParameters,this._gaussianSplatParameters),this.renderingContext.drawArraysInstanced(ye.TRIANGLE_STRIP,0,4,this._data.visibleGaussians);const _=m.acquire(d,u,this.produces);return this._gaussianSplatDepthCompositionParameters.splatDepth=p.getTexture(),_.attachDepth(e.getAttachment(X)),c.bindFramebuffer(_.fbo),c.bindTechnique(s,this.bindParameters,this._gaussianSplatDepthCompositionParameters),c.screen.draw(),this._gaussianSplatCompositionParameters.color=e.getTexture(),this._gaussianSplatCompositionParameters.splatColor=n.getTexture(),c.bindFramebuffer(_.fbo),c.bindTechnique(r,this.bindParameters,this._gaussianSplatCompositionParameters),c.screen.draw(),n.release(),p.release(),_}intersect(i,e,t,a){const{gaussianPosition:r,intersectionRayDir:s,intersectionPlane:d,layerViewUid:u}=this,m=wt(t,a);de(s,a,t);const n=1/dt(s);Q(s,s,n);const c=z();mt(c,s),xt(d,s[0],s[1],s[2],-me(s,t));const h=new K,o=new K,x=new Array;this._data.visibleGaussianTiles.forEach(l=>{const{maxScale:p}=l,_=l.obb.minimumDistancePlane(d),v=l.obb.maximumDistancePlane(d),b=v<0,F=h.dist!=null&&o.dist!=null&&h.dist<_*n&&o.dist>v*n;if(b||F)return;const G=bt(l.obb.center,l.obb.radius+p);if(!Pt(G,m,null)||!l.obb.intersectRay(t,s,p))return;const{positions:P,squaredScales:f,gaussianAtlasIndices:y}=l,E=y.length;for(let S=0;S<E;S++){const M=3*S;r[0]=P[M]-t[0],r[1]=P[M+1]-t[1],r[2]=P[M+2]-t[2];const D=f[S],I=me(r,s),Z=I*I;if(ft(r)-Z>D)continue;const A=I*n,$=C=>(C.point=C.point?C.point.fill(r[0],r[1],r[2]):gt(r),C.dist=A,C.normal=c,C.layerViewUid=u,C);if((h.dist==null||A<h.dist)&&(e==null||e(t,a,A))&&$(h),i.options.store!==0&&(o.dist==null||A>o.dist)&&(e==null||e(t,a,A))&&$(o),i.options.store===2&&(e==null||e(t,a,A))){const C=new K;x.push($(C))}}});const g=(l,p)=>{const{layerViewUid:_}=p,v=new zt(p.point,_);l.set(0,v,p.dist,p.normal)};if(De(h)){const l=i.results.min;(l.distance==null||h.dist<l.distance)&&g(l,h)}if(De(o)&&i.options.store!==0){const l=i.results.max;(l.distance==null||o.dist>l.distance)&&g(l,o)}if(i.options.store===2)for(const l of x){const p=new It(m);g(p,l),i.results.all.push(p)}}get slicePlaneEnabled(){return this._slicePlaneEnabled}set slicePlaneEnabled(i){this._slicePlaneEnabled!==i&&(this._slicePlaneEnabled=i,this.requestRender(1))}get data(){return this._data}destroy(){this._data.destroy(),super.destroy()}_onCameraChange(){const i=this.view.state.camera.eye,e=this.view.state.camera.ray.direction,t=.001;(Math.abs(i[0]-this._previousCameraPosition[0])>t||Math.abs(i[1]-this._previousCameraPosition[1])>t||Math.abs(i[2]-this._previousCameraPosition[2])>t||Math.abs(e[0]-this._previousCameraDirection[0])>t||Math.abs(e[1]-this._previousCameraDirection[1])>t||Math.abs(e[2]-this._previousCameraDirection[2])>t)&&this._data.requestSort()}_prepareHighPrecisionCameraPosition(){Q(this._tempVec,this.camera.eye,1/H.tileSize),_t(this._tempVec,this._tempVec),vt(this._coarseCameraPosition,this._tempVec),this._gaussianSplatParameters.cameraPos8k=this._coarseCameraPosition,Q(this._tempVec,this._tempVec,H.tileSize),de(this._cameraDelta,this.camera.eye,this._tempVec),this._gaussianSplatParameters.cameraDelta=this._cameraDelta}static{this.tileSize=2.048}};function De(i){return i.dist!=null&&i.point!=null}ae=H=q([Ae("esri.views.3d.webgl-engine.lib.GaussianSplatRenderNode")],ae);class K{constructor(){this.point=null,this.dist=null,this.normal=null,this.layerViewUid=""}}const ee=()=>Le.getLogger("esri.views.3d.layers.GaussianSPlatLayerView3D");let O=class extends ot(Ot){constructor(i){super(i),this.type="gaussian-splat-3d",this._gaussianTileHandles=new Map,this._pageBuffer=new Uint32Array(Re),this._wasmLayerId=-1,this._metersPerVCSUnit=1,this.ignoresMemoryFactor=!1,this._usedMemory=0,this._cacheMemory=0,this._useEsriCrs=!1,this.fullExtentInLocalViewSpatialReference=null,this._suspendedHandle=null,this._conversionBuffer=new ArrayBuffer(4),this._u32View=new Uint32Array(this._conversionBuffer),this._f32View=new Float32Array(this._conversionBuffer);const{view:e}=i;this._memCache=e.resourceController.memoryController.newCache(`GaussianSplat-${this.uid}`,t=>this._deleteTile(t)),this._renderNode=new ae({view:e})}initialize(){if(!this._canProjectWithoutEngine())throw kt("layer",this.layer.spatialReference.wkid,this.view.renderSpatialReference?.wkid);const i=et(this).then(e=>{this._wasmLayerId=e,this.addHandles([te(()=>this.layer.elevationInfo,t=>this._elevationInfoChanged(t))]),this._suspendedHandle=te(()=>this.suspended,t=>this._wasm?.setEnabled(this,!t),je)});this.addResolvingPromise(i)}get wasmLayerId(){return this._wasmLayerId}get metersPerVCSUnit(){return this._metersPerVCSUnit}isUpdating(){const i=this._wasm;return!(this._wasmLayerId<0||i==null)&&(i.isUpdating(this._wasmLayerId)||this._renderNode.data.isUpdating())}updatingFlagChanged(){this.notifyChange("updating")}get _wasm(){return tt(this.view)}get usedMemory(){return this._usedMemory}get unloadedMemory(){return 0}get cachedMemory(){return this._cacheMemory}get useEsriCrs(){return this._useEsriCrs}async createRenderable(i){const e=i.meshData;if(e.data==null)throw new Error("meshData.data undefined");if(e.desc=JSON.parse(e.desc),e.desc==null)throw new Error("meshData.desc undefined");const t=e.desc.prims[0],a=t.vertexCount,r=t.atrbs[0].view,s=t.atrbs[0].view.byteCount,d=t.atrbs[0].view.byteOffset;let u=null;if(r.type!=="U32")return ee().warnOnce("unexpected meshData.data format"),{memUsageBytes:0};u=new Uint32Array(e.data.buffer,d,s/4);const m=this.extractHeader(u),n=Math.ceil(a/k),c=new Uint32Array(a),h=[];for(let f=0;f<n;f++){let y=this._data.textureAtlas.requestPage();if(y===null&&(this._freeInvisibleTiles(),y=this._data.textureAtlas.requestPage()),y===null)return ee().warnOnce("ran out of gaussian splat memory"),{memUsageBytes:0};{h.push(y);const E=a-f*k,S=Math.min(E,k),M=f*k;for(let $=0;$<S;$++)c[$+M]=$+R*y;const D=f*be;this._pageBuffer.set(u.subarray(D,D+S*B)),this._pageBuffer.set(m.packedHeader,be);const I=y*R,Z=I%T,A=Math.floor(I/T);this._data.textureAtlas.update(Z,A,this._pageBuffer)}}const o=new Float64Array(3*a),x=new Float64Array(a),g=2.048,l=m.tileOrigin.x*g,p=m.tileOrigin.y*g,_=m.tileOrigin.z*g,v=m.invPosScale;let b=0,F=0;for(let f=0;f<a;f++){const y=f*B,{rawX:E,rawY:S,rawZ:M}=this._extractGaussianPosition(u,y),D=this._extractGaussianSphericalScale(u,y);o[b]=E*v+l,o[b+1]=S*v+p,o[b+2]=M*v+_,x[f]=D*D,F=Math.max(F,D),b+=3}let G=null;if(e.desc.obb){const f=e.desc.obb.quaternion;G=new pe(e.desc.obb.center,e.desc.obb.halfSize,Qe(...f))}G||(ee().warnOnce("encountered tile without a bounding box"),G=new pe);const P=new Vt(i.handle,G,c,h,o,x,F);return this._memCache.put(`${P.handle}`,P),this._gaussianTileHandles.set(i.handle,P),this._cacheMemory+=P.usedMemory,{memUsageBytes:P.usedMemory}}_extractGaussianPosition(i,e){const t=i[e+1];return{rawX:16383&t,rawY:t>>>14&16383,rawZ:t>>>28&15|(1023&i[e+2])<<4}}_extractGaussianSphericalScale(i,e){const t=i[e+2],a=t>>>10&255,r=t>>>18&255,s=t>>>26&63|(3&i[e+3])<<6,d=Math.exp(a/16-10),u=Math.exp(r/16-10),m=Math.exp(s/16-10);return Math.max(d,u,m)}freeRenderable(i){const e=this._gaussianTileHandles.get(i);e&&(e.isVisible?this._usedMemory-=e.usedMemory:this._cacheMemory-=e.usedMemory,e.pageIds.forEach(t=>this._data.textureAtlas.freePage(t)),this.freeObject(e),this._gaussianTileHandles.delete(i)),this._updateGaussians()}freeObject(i){this._memCache.pop(`${i.handle}`)}get visibleAtCurrentScale(){return Rt(this.layer.effectiveScaleRange,this.view.scale)}setRenderableVisibility(i,e,t){for(let a=0;a<t;a++){if(!e[a])continue;const r=i[a],s=this._gaussianTileHandles.get(r);if(s){if(s.isVisible)continue;s.isVisible=!0,this._usedMemory+=s.usedMemory,this._cacheMemory-=s.usedMemory,this._memCache.pop(`${r}`)}}for(let a=0;a<t;a++){if(e[a])continue;const r=i[a],s=this._gaussianTileHandles.get(r);if(s){if(!s.isVisible)continue;s.isVisible=!1,this._usedMemory-=s.usedMemory,this._cacheMemory+=s.usedMemory,this._memCache.put(`${r}`,s)}}this._updateGaussians()}destroy(){it(this),this._suspendedHandle&&(this._suspendedHandle=Ue(this._suspendedHandle)),this._renderNode.destroy(),this._memCache.destroy()}_canProjectWithoutEngine(){if(this.view.state.viewingMode===1||We(this.view.renderSpatialReference)||Ne(this.view.renderSpatialReference))return!0;if(this.layer.esriCrsSpatialReference&&Ze(this.layer.esriCrsSpatialReference,this.view.renderSpatialReference)){const i=st(this.layer.esriCrsSpatialReference),e=this.view.heightModelInfo;return this._useEsriCrs=at(i,e,!1)===0,this._useEsriCrs&&i&&(this._metersPerVCSUnit=Ye(1,"meters",i.heightUnit),this.fullExtentInLocalViewSpatialReference=this.layer.esriCrsFullExtent),this._useEsriCrs}return!1}_elevationInfoChanged(i){if(i?.offset)if(this._useEsriCrs){const e=nt(i?.unit)/this._metersPerVCSUnit,t=i?.offset??0;this._wasm?.setLayerOffset(this,t*e)}else this._wasm?.setLayerOffset(this,rt(i));else this._wasm?.setLayerOffset(this,0)}_updateGaussians(){const i=new Array;for(const e of this._gaussianTileHandles.values())e.isVisible&&i.push(e);this._data.updateGaussianVisibility(i),this.notifyChange("updating")}_freeInvisibleTiles(){for(const i of this._gaussianTileHandles.values())i.isVisible||this._deleteTile(i)}get _data(){return this._renderNode.data}extractHeader(i){const e=i.length-4,t=this.reinterpretU32AsFloat(i[e]),a=this.reinterpretU32AsFloat(i[e+1]),r=this.reinterpretU32AsFloat(i[e+2]),s=1/(1<<(255&i[e+3]));return{packedHeader:i.subarray(e,e+4),tileOrigin:{x:t,y:a,z:r},invPosScale:s}}_deleteTile(i){this._wasm?.onRenderableEvicted(this,i.handle,i.usedMemory),this.freeRenderable(i.handle)}reinterpretU32AsFloat(i){return this._u32View[0]=i,this._f32View[0]}get performanceInfo(){let i=0,e=0;return this._gaussianTileHandles.forEach(t=>{t.isVisible?i++:e++}),new Et(this.usedMemory,i,e,this.cachedMemory)}};q([Y()],O.prototype,"layer",void 0),q([Y()],O.prototype,"fullExtentInLocalViewSpatialReference",void 0),q([Y({readOnly:!0})],O.prototype,"visibleAtCurrentScale",null),O=q([Ae("esri.views.3d.layers.GaussianSplatLayerView3D")],O);const Ks=O,Jt=Object.freeze(Object.defineProperty({__proto__:null,GaussianSplatCompositionPassParameters:ce,build:He},Symbol.toStringTag,{value:"Module"})),Kt=Object.freeze(Object.defineProperty({__proto__:null,GaussianSplatDepthCompositionPassParameters:ue,build:Be},Symbol.toStringTag,{value:"Module"})),Ve=Object.freeze(Object.defineProperty({__proto__:null,GaussianSplatPassParameters:le,build:Fe},Symbol.toStringTag,{value:"Module"}));export{Ks as default};
