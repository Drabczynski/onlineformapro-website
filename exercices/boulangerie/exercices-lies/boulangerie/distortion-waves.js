/*! distortion-waves 0.1.0 (WaveController seul, sans React) - https://libraries.dev/waves - licence MIT, voir distortion-waves.LICENSE */
var DistortionWaves=(()=>{var mt=Object.defineProperty;var we=Object.getOwnPropertyDescriptor;var be=Object.getOwnPropertyNames;var ye=Object.prototype.hasOwnProperty;var xe=(r,t)=>{for(var e in t)mt(r,e,{get:t[e],enumerable:!0})},Re=(r,t,e,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of be(t))!ye.call(r,s)&&s!==e&&mt(r,s,{get:()=>t[s],enumerable:!(i=we(t,s))||i.enumerable});return r};var Ae=r=>Re(mt({},"__esModule",{value:!0}),r);var Ii={};xe(Ii,{WaveController:()=>rt});var st=()=>null,pt=()=>null,Dt=r=>r,Q=()=>({}),_t=r=>[r],Bt=()=>{},Ut=()=>{},It=()=>{};var ut={colorful:{colors:[[255,201,21],[126,196,255],[180,40,230],[235,100,160],[255,176,122],[154,160,255],[127,217,238]],ahead:[255,122,182],behind:[90,190,255]},green:{colors:[[53,186,0],[140,235,90],[0,196,110],[190,250,130],[40,160,60],[110,225,160],[90,210,40]],ahead:[196,255,120],behind:[0,150,70]},ocean:{colors:[[40,120,255],[90,200,255],[20,80,200],[120,230,240],[60,150,255],[150,180,255],[0,180,220]],ahead:[150,230,255],behind:[30,70,220]},sunset:{colors:[[255,140,60],[255,90,120],[255,200,80],[240,70,90],[255,170,120],[220,90,200],[255,120,80]],ahead:[255,220,120],behind:[200,60,160]},mono:{colors:[[240,240,245],[200,205,215],[255,255,255],[170,175,190],[225,228,235],[190,195,205],[245,245,250]],ahead:[255,255,255],behind:[160,165,180]}},nt=(r,t,e)=>[r[0]+(t[0]-r[0])*e,r[1]+(t[1]-r[1])*e,r[2]+(t[2]-r[2])*e];function Ee(r){return{colors:[r,nt(r,[255,255,255],.25),r,nt(r,[0,0,0],.15)],ahead:nt(r,[255,255,255],.45),behind:nt(r,[0,0,0],.3)}}function Te(r){let t=parseInt(r.replace("#",""),16);return[t>>16&255,t>>8&255,t&255]}function Wt(r){let t={type:r,anticipation:.5,travel:2.28,launchGap:0,linger:-.35,rimFade:3.03,returnSpeed:1.45,pull:24,inhale:56,gatherGlow:.33,gatherDots:1,amplitude:34,lensWidth:150,aberration:.78,swell:22,blur:18,blurAhead:90,blurBehind:240,lead:130,tail:300,strength:.92,rimWidth:14,rimUnevenness:1,rimStrength:.82,rimSoftness:343,cornerRadius:62,rimPulse:.6,hairlineWidth:1.5,hairlineOpacity:.9,hairlineWhite:.95,hairlineLinger:.47,hairlineFade:3,orientation:.5,particleCount:64,particleSize:1.8,particleReach:150,particleFlight:30,particleGap:24,particleLife:2.19,particleSpread:1,palette:ut.colorful};return r!=="center"?t:{...t,anticipation:.25,travel:3.43,rimFade:2.51,hairlineLinger:.96,strength:.6,rimStrength:.6,aberration:0,gatherGlow:0,gatherDots:0,particleCount:89,particleLife:3.93,particleSpread:.64,palette:ut.green,cornerRadius:48,pull:14.4,inhale:33.6,amplitude:20.4,lensWidth:90,swell:13.2,blur:10.8,blurAhead:54,blurBehind:144,lead:78,tail:180,rimSoftness:205.8,particleReach:90,particleFlight:18,particleGap:11}}function tt(r){return r.anticipation+Math.max(r.travel*.6,r.linger+r.rimFade,r.linger+r.hairlineLinger+r.hairlineFade,r.particleLife)}function ft(r,t,e,i){let s=(n,a,l)=>{let o=1-n;return 3*o*o*n*a+3*o*n*n*l+n*n*n};return n=>{if(n<=0)return 0;if(n>=1)return 1;let a=0,l=1;for(let o=0;o<24;o++){let h=(a+l)/2;s(h,r,e)<n?a=h:l=h}return s((a+l)/2,t,i)}}var se=ft(.22,1,.36,1),J=[.22,1,.36,1],Ot=se;function Se(r){let t=r.easeX1??.22,e=r.easeY1??1,i=r.easeX2??.36,s=r.easeY2??1;return t===.22&&e===1&&i===.36&&s===1?se:((t!==J[0]||e!==J[1]||i!==J[2]||s!==J[3])&&(J=[t,e,i,s],Ot=ft(Math.min(Math.max(t,0),1),e,Math.min(Math.max(i,0),1),s)),Ot)}var Nt=ft(.42,0,.58,1),z=(r,t,e)=>{let i=Math.min(Math.max((e-r)/(t-r),0),1);return i*i*(3-2*i)};function At(){return{ox:0,oy:0,tilt:0,spine:0,radius:0,moved:0,squash:1,time:0,energy:0,swell:0,width:0,height:0,gravity:0,glow:0,clearRadius:0,hairClearRadius:0,rim:0,sparkle:0,flying:0,launched:!1,hasCleared:!1,ring:!1,sideways:!1,hold:0}}var ne=60,ke=1.4,Me=.22,Fe=.5,Ce=100,Pe=.45,$e=.2,Le=.55;function gt(r,t,e,i,s,n,a){let l=tt(s),o=Math.min(Math.max(r,0),1)*l,h=o-s.anticipation,c=z(0,Math.max(s.anticipation,.001),o),u=Math.min(Math.max(h/s.travel,0),1),d=Se(s)(u),v=s.type==="center",b=s.type==="horizontal",f=v?1:ke,y=t.x+t.w/2,g=t.y+t.h/2,R=Math.min(t.w,t.h)/2,w=b?t.h:t.w,p=v?0:Math.max(0,w/2-R),A=b?Math.PI/2:0,C=Math.cos(A),L=Math.sin(A),F=0;if(!v&&n){let V=b?n.y-g:n.x-y;F=Math.min(Math.max(V/Math.max(w/2,1),-1),1)}let k=F*w/2*s.orientation,D=F*s.orientation*Pe,I=A+D,S=z(0,.45,d),_=Math.cos(I),W=Math.sin(I),U=0;for(let V=0;V<4;V++){let Lt=(V&1?e:0)-y-k*C,zt=(V&2?i:0)-g-k*L;U=Math.max(U,Math.hypot((_*Lt+W*zt)*f,-W*Lt+_*zt))}let m=U+(s.swell+ne)*f,x=1-z($e,Le,u),T=R+Math.max(s.launchGap,0),P=h<0?T+s.inhale*(1-c):T+(m+Ce-T)*d,M=Math.min(Fe*Math.max(s.gatherGlow,0),1),$=R-s.rimSoftness,B=U+(s.rimSoftness+s.swell)*f,E=a??At(),j=z(0,.1,d);return E.ox=y+k*j*C,E.oy=g+k*j*L,E.tilt=A+D*j,E.spine=p*(1-S),E.radius=P,E.moved=d,E.squash=1+(f-1)*z(0,.5,d),E.time=o,E.energy=z(0,.05,u)*x,E.swell=s.swell*z(0,.3,d),E.width=e,E.height=i,E.gravity=s.pull*c*(1-z(0,Me,h)),E.glow=h<0?M*c:(M+(1-M)*z(0,.07,u))*x,E.clearRadius=$+(B-$)*Nt((h-s.linger)/Math.max(s.rimFade,.01)),E.hairClearRadius=$+(B-$)*Nt((h-s.linger-s.hairlineLinger)/Math.max(s.hairlineFade,.01)),E.rim=s.rimStrength*z(0,.1,u)*(1-z(.9,1,o/l)),E.sparkle=z(0,Math.max(s.anticipation,.001)*.35,o),E.flying=Math.max(h,0),E.launched=h>0,E.hasCleared=P>m,E.ring=v,E.sideways=b,E.hold=v?R:0,E}var Y=7,ze=new Float32Array(Y*3),vt=(r,t,e)=>{let i=Math.sin(r*t+e)*43758.5453;return i-Math.floor(i)};function qt(r,t,e,i,s){let n=Math.max(t/2-i,0),a=Math.max(e/2-i,0),l=4*(n+a+.5*Math.PI*i),o=ze;for(let h=0;h<Y;h++){let c=vt(h,12.9898,1.3),u=vt(h,78.233,4.1),d=vt(h,39.425,2.7),v=l*(h+.35*c)/Y+r*(-22+44*u)*(1+2*s),b=l/Y*(.2+.25*d),f=(.25+.3*s)*Math.sin(r*(1.1+1.2*c)*(1+s)+h*2.4);o[h*3]=v,o[h*3+1]=b,o[h*3+2]=(.2+2.6*u)*(1+f)}return o}var De=.22,_e=.3,ot=(r,t,e)=>{let i=Math.sin(r*12.9898+t*78.233+e*37.719)*43758.5453;return i-Math.floor(i)};function Be(r){let t=[];for(let e=0;e<Math.round(r.particleCount);e++){let i=e+1,s=a=>i*a%1,n=s(.5497004779);t.push({index:i,column:(s(.7548776662)*2-1)*.92,heading:s(.7548776662)*2*Math.PI,pace:.35+.72*Math.sqrt(s(.8191725134)),drift:15+50*s(.6710436067),sway:3+11*s(.4142135624),swayRate:2.5+3.5*s(.7320508076),twinkleRate:8+12*s(.2360679775),phase:s(.6180339887)*2*Math.PI,life:r.particleLife*(.4+.6*s(.6457513111)),size:r.particleSize*(.55+.45*n*n),brightness:.3+.7*s(.6055512755),hop:.16+.14*s(.1231056256),hopOffset:s(.472135955)})}return t}function Ue(r,t,e,i,s={x:0,y:0,a:0}){let n=.5+.5*Math.sin(t.time*r.twinkleRate+r.phase),a=r.brightness*(.7+.3*n),l=Math.min(Math.max(i.particleSpread,0),1),o=e.x+e.w/2,h=e.y+e.h/2;if(!t.launched){let R=t.time/r.hop+r.hopOffset,w=Math.floor(R),p=R-w,A=z(0,.25,p)*(1-z(.55,1,p)),C=1-z(i.anticipation*.75,i.anticipation,t.time),L=t.sparkle*A*C*a*i.gatherDots;if(t.ring){let B=ot(r.index,w,1)*2*Math.PI,E=Math.min(e.w,e.h)/2+i.particleGap+i.particleFlight,j=E+Math.max(i.particleReach-E,0)*ot(r.index,w,2)-i.particleFlight*p*p;return s.x=o+Math.cos(B)*j,s.y=h+Math.sin(B)*j,s.a=L,s}let F=(t.sideways?e.h:e.w)/2,k=(t.sideways?e.w:e.h)/2,D=(ot(r.index,w,1)*2-1)*(F+24),I=i.particleGap+i.particleFlight,S=I+Math.max(i.particleReach-I,0)*ot(r.index,w,2),_=Math.min(e.w,e.h)/2,W=k+S,U=Math.min(Math.max(D,-F+_),F-_),m=t.sideways?o+W:o+D,x=t.sideways?h+D:h-W,T=(t.sideways?o+k:o+U)-m,P=(t.sideways?h+U:h-k)-x,M=Math.max(Math.hypot(T,P),1),$=i.particleFlight*p*p;return s.x=m+T/M*$,s.y=x+P/M*$,s.a=L,s}let c=(1-z(r.life*.55,r.life,t.flying))*a,u=r.sway*Math.sin(r.swayRate*t.flying+r.phase)*Math.min(t.flying/.25,1);if(t.ring){let R=Math.min(e.w,e.h)/2,w=R+((t.radius-R)*r.pace+r.drift*t.flying)*l,p=Math.cos(r.heading),A=Math.sin(r.heading);return s.x=t.ox+p*w-A*u,s.y=t.oy+A*w+p*u,s.a=c,s}let d=Math.min(e.w,e.h)/2,v=1+De*t.moved*r.pace*l,b=r.column*(t.sideways?e.h:e.w)/2*v+u,f=(d+(t.radius-d)*r.pace*l)*(1-_e*r.column*r.column)+r.drift*t.flying*l,y=Math.cos(t.tilt),g=Math.sin(t.tilt);return s.x=t.ox+y*b+g*f,s.y=t.oy+g*b-y*f,s.a=c,s}function wt(r){let t=o=>{let h=o/255;return h<=.04045?h/12.92:Math.pow((h+.055)/1.055,2.4)},[e,i,s]=[t(r[0]),t(r[1]),t(r[2])],n=Math.cbrt(.4122214708*e+.5363325363*i+.0514459929*s),a=Math.cbrt(.2119034982*e+.6806995451*i+.1073969566*s),l=Math.cbrt(.0883024619*e+.2817188376*i+.6299787005*s);return[.2104542553*n+.793617785*a-.0040720468*l,1.9779984951*n-2.428592205*a+.4505937099*l,.0259040371*n+.7827717662*a-.808675766*l]}var bt=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,Ie=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uStep;
uniform float uSigma;
out vec4 outColor;
void main() {
  float r = ceil(uSigma * 3.0);
  vec4 acc = vec4(0.0);
  float wsum = 0.0;
  for (float i = -48.0; i <= 48.0; i += 1.0) {
    if (abs(i) > r) continue;
    float w = exp(-0.5 * i * i / (uSigma * uSigma));
    acc += texture(uTex, vUv + uStep * i) * w;
    wsum += w;
  }
  outColor = acc / wsum;
}`,We=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform float uLod;
out vec4 outColor;
void main() { outColor = textureLod(uTex, vUv, uLod); }`,Oe=`#version 300 es
precision highp float;
uniform vec2 uSize;
uniform vec2 uPx;
uniform float uF[19];
uniform sampler2D uC0;
uniform sampler2D uC1;
uniform sampler2D uC2;
uniform sampler2D uR0;
uniform sampler2D uR1;
uniform sampler2D uR2;
uniform int uContent;
uniform int uRevealed;
uniform int uLens;
uniform int uLive;
uniform int uSame;
uniform int uRound;
uniform float uFloor;
uniform float uAmplitude;
uniform float uLensWidth;
uniform float uAberration;
uniform float uBlur;
uniform float uBlurAhead;
uniform float uBlurBehind;
uniform float uNear;
uniform vec3 uPal[9];
uniform int uPalCount;
uniform vec3 uAhead;
uniform vec3 uBehind;
uniform float uLead;
uniform float uTail;
uniform float uStrength;
uniform float uRimWidth;
uniform float uRimSoftness;
uniform float uCorner;
uniform float uUneven;
uniform float uPulse;
uniform float uHairW;
uniform float uHairO;
uniform float uHairWhite;
uniform vec3 uLumps[${Y}];
out vec4 outColor;

const float coverZone = ${ne.toFixed(1)};
const float PI = 3.14159265;

struct Field { float d; vec2 n; vec2 q; vec2 raw; float g; };

float heldAt(vec2 p) {
  if (uF[16] <= 0.0) return 1.0;
  return smoothstep(uF[16] * 0.9, uF[16] * 1.8, length(p - vec2(uF[0], uF[1])));
}

Field fieldAt(vec2 p) {
  vec2 raw = p - vec2(uF[0], uF[1]);
  float cs = cos(uF[14]), sn = sin(uF[14]);
  vec2 q = vec2(cs * raw.x + sn * raw.y, -sn * raw.x + cs * raw.y);
  float spine = uF[2], radius = uF[3], squash = uF[4], time = uF[5], swell = uF[7];
  float mx = q.x * squash;
  vec2 v = vec2(max(abs(mx) - spine, 0.0), q.y);
  float l = max(length(v), 1e-3);
  vec2 grad = vec2(v.x * sign(q.x) * squash, v.y) / l;
  float g = max(length(grad), 1e-3);
  float bend;
  if (uF[15] > 0.5) {
    float a = atan(q.y, q.x);
    bend = 0.62 * sin(2.0 * a + time * 1.1) + 0.38 * sin(3.0 * a - time * 1.5 + 1.7);
  } else {
    float s = mx * 0.0058;
    bend = 0.62 * sin(s + time * 1.1) + 0.38 * sin(s * 2.1 - time * 1.5 + 1.7);
  }
  vec2 n = grad / g;
  Field o;
  o.d = (l - radius) / g + swell * bend;
  o.n = vec2(cs * n.x - sn * n.y, sn * n.x + cs * n.y);
  o.q = q;
  o.raw = raw;
  o.g = g;
  return o;
}

/* The progressive blur, as the stacked blurred copies: near over sharp, far
   over that, each taking over where the last ends.

   Every read names its level. These calls sit inside branches that differ
   from one pixel to the next, where the derivatives a plain texture() picks
   its mip level from are undefined: along each branch's boundary it would
   read a far smaller level, and draw the boundary as a thin dotted line. */
vec3 side(sampler2D a, sampler2D b, sampler2D c, vec2 s, float tn, float tf) {
  vec2 uv = clamp(s, vec2(0.5), uSize - 0.5) / uSize;
  vec3 col = textureLod(a, uv, 0.0).rgb;
  if (tn > 0.0) col = mix(col, textureLod(b, uv, 0.0).rgb, tn);
  if (tf > 0.0) col = mix(col, textureLod(c, uv, 0.0).rgb, tf);
  return col;
}

const vec3 spectrum[5] = vec3[5](
  vec3(0.571, 0.0, 0.0), vec3(0.343, 0.206, 0.0), vec3(0.086, 0.588, 0.086), vec3(0.0, 0.206, 0.343), vec3(0.0, 0.0, 0.571)
);

vec3 lensed(int which, vec2 s, vec2 split, float tn, float tf) {
  if (dot(split, split) < 0.0625) {
    return which == 0 ? side(uC0, uC1, uC2, s, tn, tf) : side(uR0, uR1, uR2, s, tn, tf);
  }
  vec3 o = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    float along = float(i) / 4.0 * 2.0 - 1.0;
    vec3 c = which == 0 ? side(uC0, uC1, uC2, s + split * along, tn, tf) : side(uR0, uR1, uR2, s + split * along, tn, tf);
    o += c * spectrum[i];
  }
  return o;
}

float continuousRectSDF(vec2 p, vec2 halfSize, float radius) {
  float a = min(radius * 1.528665, min(halfSize.x, halfSize.y));
  vec2 q = abs(p) - (halfSize - a);
  if (q.x <= 0.0 || q.y <= 0.0) return max(abs(p.x) - halfSize.x, abs(p.y) - halfSize.y);
  const float n = 3.26;
  vec2 u = q / a;
  float norm = pow(pow(u.x, n) + pow(u.y, n), 1.0 / n);
  vec2 gg = pow(u / max(norm, 1e-4), vec2(n - 1.0));
  return (norm - 1.0) * a / max(length(gg), 1e-3);
}

/* The area's edge: the continuous corners of an iOS screen, or the circular
   ones CSS draws. */
float edgeSDF(vec2 p, vec2 halfSize, float radius) {
  if (uRound == 0) return continuousRectSDF(p, halfSize, radius);
  float r = min(radius, min(halfSize.x, halfSize.y));
  vec2 q = abs(p) - (halfSize - r);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec2 perimeterAt(vec2 p, vec2 halfSize, float r) {
  float ex = max(halfSize.x - r, 0.0);
  float ey = max(halfSize.y - r, 0.0);
  float arc = 0.5 * PI * r;
  float P = 4.0 * (ex + ey + arc);
  float ax = abs(p.x), ay = abs(p.y);
  if (ax > ex && ay > ey) {
    vec2 v = p - vec2(sign(p.x) * ex, sign(p.y) * ey);
    float a, base;
    if (p.x >= 0.0 && p.y < 0.0) { a = atan(v.x, -v.y); base = ex; }
    else if (p.x >= 0.0) { a = atan(v.y, v.x); base = ex + arc + 2.0 * ey; }
    else if (p.y >= 0.0) { a = atan(-v.x, v.y); base = 3.0 * ex + 2.0 * arc + 2.0 * ey; }
    else { a = atan(-v.y, -v.x); base = 3.0 * ex + 3.0 * arc + 4.0 * ey; }
    return vec2(base + r * clamp(a, 0.0, 0.5 * PI), P);
  }
  bool sideHit = ax > ex ? true : (ay > ey ? false : (halfSize.x - ax) < (halfSize.y - ay));
  if (sideHit) return vec2(p.x >= 0.0 ? ex + arc + (p.y + ey) : 3.0 * ex + 3.0 * arc + 2.0 * ey + (ey - p.y), P);
  return vec2(p.y < 0.0 ? (p.x >= 0.0 ? p.x : P + p.x) : ex + 2.0 * arc + 2.0 * ey + (ex - p.x), P);
}

float rimThickness(float s, float P) {
  float t = 0.08;
  for (int i = 0; i < ${Y}; i++) {
    float ds = s - uLumps[i].x;
    ds -= P * floor(ds / P + 0.5);
    float k = ds / uLumps[i].y;
    t += uLumps[i].z * exp(-k * k);
  }
  return t / 1.0498;
}

float dither(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))) - 0.5; }

vec3 paletteAt(float u) {
  float x = fract(u) * float(uPalCount);
  int i = min(int(x), uPalCount - 1);
  int j = i + 1 == uPalCount ? 0 : i + 1;
  float m = fract(x);
  m = m * m * (3.0 - 2.0 * m);
  return mix(uPal[i], uPal[j], m);
}

vec3 oklabToSRGB(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  vec3 lin = clamp(vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  ), 0.0, 1.0);
  return mix(12.92 * lin, 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), lin));
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uPx.y - gl_FragCoord.y) * (uSize.x / uPx.x);

  if (uLive == 0) {
    outColor = vec4(uRevealed == 1 ? textureLod(uR0, p / uSize, 0.0).rgb : textureLod(uC0, p / uSize, 0.0).rgb, 1.0);
    return;
  }

  Field w = fieldAt(p);
  float energy = uF[6], gravity = uF[10];
  float held = heldAt(p);

  // \u2500\u2500\u2500 The two screens, through the swell (waveLens) \u2500\u2500\u2500
  vec2 s = p;
  vec2 split = vec2(0.0);
  if (uLens == 1) {
    float u = w.d / (uLensWidth * (w.d > 0.0 ? 0.85 : 1.5));
    float lift = exp(-u * u);
    float r = max(length(w.raw), 1.0);
    vec2 swollen = w.n * energy * uAmplitude * lift * held;
    vec2 inward = w.raw / r;
    s = p - swollen + inward * gravity * exp(-r / 900.0) * held;
    split = (swollen - inward * gravity * exp(-r / 240.0) * held) * uAberration;
  }
  // The progressive blur, read where the pixel is (waveBlurMask).
  float bu = w.d / (w.d > 0.0 ? uBlurAhead : uBlurBehind);
  float radius = energy * uBlur * exp(-bu * bu) * held;
  float tn = clamp(radius / max(uNear, 1e-3), 0.0, 1.0);
  tn = tn * tn * (3.0 - 2.0 * tn);
  float tf = clamp((radius - uNear) / max(uBlur - uNear, 1e-3), 0.0, 1.0);
  tf = tf * tf * (3.0 - 2.0 * tf);

  float cover = 1.0;
  if (uContent == 1 && uF[17] > 0.5) cover = smoothstep(-coverZone, coverZone, w.d);
  if (uContent == 0) cover = 0.0;

  // How much of this pixel the canvas owns. All of it when opaque; over a
  // page, only what the wave changes: where the lens moves, splits or blurs
  // the screen, and where the revealed screen has taken over from the
  // content the page is still showing. Each reaches 1 well before its
  // effect can be seen, so the hand-over to the page has no seam.
  float own = uFloor;
  if (own < 1.0) {
    float moved = max(smoothstep(0.03, 0.4, length(s - p)), smoothstep(0.03, 0.4, length(split)));
    own = max(own, max(moved, smoothstep(0.0, 0.6, radius)));
    if (uSame == 0 && uContent == 1) own = max(own, 1.0 - smoothstep(0.9, 1.0, cover));
  }

  vec3 col = vec3(0.0);
  if (own > 0.0) {
    if (uSame == 1) {
      col = lensed(0, s, split, tn, tf);
    } else {
      bool showRevealed = uRevealed == 1 && w.d <= coverZone + 6.0 && cover < 1.0;
      if (showRevealed) col = lensed(1, s, split, tn, tf);
      if (cover > 0.0) col = mix(col, lensed(0, s, split, tn, tf), cover);
    }
  }

  // \u2500\u2500\u2500 The colour (waveBand) \u2500\u2500\u2500
  float d = w.d, time = uF[5], glow = uF[11], rim = uF[13];
  vec2 c = p - uSize * 0.5;
  float inset = max(-edgeSDF(c, uSize * 0.5, uCorner), 0.0);
  bool nearEdge = rim > 0.0 && inset < max(uRimWidth * 2.2 * (1.0 + 1.9 * uUneven), uHairW * 0.5 + 0.75);
  if (glow <= 0.0 && !nearEdge) {
    outColor = vec4((col + dither(gl_FragCoord.xy) / 255.0) * own, own);
    return;
  }
  bool ring = uF[15] > 0.5;
  float turn = atan(w.q.y, w.q.x);
  float along = w.q.x * 0.0068;
  float lobes = ring
    ? 0.5 + 0.5 * sin(2.0 * turn + time * 1.4) * cos(turn - time * 0.7 + 1.2)
    : 0.5 + 0.5 * sin(along * 1.3 + time * 1.4) * cos(along * 0.6 - time * 0.7 + 1.2);
  float bandA = 0.0;
  if (glow > 0.0 && d < uLead) {
    if (d >= 0.0) {
      float k = 1.0 - d / uLead;
      bandA = k * k * k * (k * (k * 6.0 - 15.0) + 10.0);
    } else {
      bandA = pow(1.0 - clamp(-d / (uTail * mix(0.6, 1.3, lobes)), 0.0, 1.0), 2.3);
    }
    bandA *= glow * uStrength * mix(0.6, 1.0, exp(-inset / 140.0)) * held;
  }
  float aroundA = atan(c.y / uSize.y, c.x / uSize.x);
  float rimA = 0.0;
  float hairA = 0.0;
  float shimmer = 0.5;
  if (nearEdge) {
    vec2 edge = perimeterAt(c, uSize * 0.5, uCorner);
    float thickness = 1.0;
    if (uUneven > 0.0) thickness = max(1.0 + (rimThickness(edge.x, edge.y) - 1.0) * uUneven, 0.04);
    float hk = inset / (uRimWidth * thickness);
    float hug = exp(-hk * hk);
    float reached = 1.0 - smoothstep(-uLead * 0.7, uLead * 0.5, d);
    float kept = smoothstep(-uRimSoftness, uRimSoftness, d + (uF[3] - uF[12]) / w.g);
    shimmer = 0.5 + 0.5 * sin(time * 3.4 - edge.x / edge.y * 4.0 * PI);
    rimA = hug * reached * kept * rim * mix(1.0, 0.7 + 0.3 * shimmer, uPulse);
    if (uHairW > 0.0) {
      float line = 1.0 - smoothstep(uHairW * 0.5, uHairW * 0.5 + 0.75, inset);
      float hairKept = smoothstep(-uRimSoftness, uRimSoftness, d + (uF[3] - uF[18]) / w.g);
      hairA = line * reached * hairKept * rim * uHairO
        * mix(0.5, 1.0, smoothstep(0.1, 1.5, thickness))
        * mix(1.0, 0.55 + 0.45 * shimmer, uPulse);
    }
  }
  float a = 1.0 - (1.0 - bandA) * (1.0 - rimA);
  float total = 1.0 - (1.0 - a) * (1.0 - hairA);
  if (total <= 0.0005) {
    outColor = vec4((col + dither(gl_FragCoord.xy) / 255.0) * own, own);
    return;
  }
  float flow = 0.62 + (ring ? turn / (2.0 * PI) : along * 0.2) + time * 0.13 + d * 0.0015 + (ring ? 0.0 : 0.05 * sin(w.q.y * 0.009 + time));
  vec3 lab = paletteAt(flow);
  lab = mix(lab, uAhead, 0.5 * exp(-pow((d - 30.0) / 50.0, 2.0)));
  lab = mix(lab, uBehind, 0.5 * exp(-pow((d + 84.0) / 72.0, 2.0)));
  lab.yz *= 1.22;
  lab = mix(lab, vec3(0.99, 0.0, 0.0), 0.7 * exp(-pow((d + 8.0) / 26.0, 2.0)));
  vec3 rimLab = paletteAt(aroundA / (2.0 * PI) + time * (0.12 + 0.25 * uPulse) + inset * 0.0012);
  rimLab.yz *= 1.1;
  lab = mix(lab, rimLab, rimA / (rimA + bandA + 1e-4));
  vec3 rgb = oklabToSRGB(lab);
  if (hairA > 0.0) {
    vec3 hair = mix(oklabToSRGB(rimLab), vec3(1.0), uHairWhite * (0.5 + 0.5 * shimmer));
    rgb = (rgb * a * (1.0 - hairA) + hair * hairA) / total;
  }
  float noise = dither(gl_FragCoord.xy) * 2.0 / 255.0;
  // The colour over the screens, as the band view over the transition \u2014
  // premultiplied, so it lies as well over the page where the canvas is clear.
  float over = clamp(total + noise, 0.0, 1.0);
  outColor = vec4(col * own * (1.0 - over) + clamp(rgb + noise, 0.0, 1.0) * over, 1.0 - (1.0 - own) * (1.0 - over));
}`,Ne=`#version 300 es
in vec3 aDot;
uniform vec2 uSize;
uniform float uPoint;
out float vA;
void main() {
  vec2 clip = vec2(aDot.x / uSize.x * 2.0 - 1.0, 1.0 - aDot.y / uSize.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = uPoint;
  vA = aDot.z;
}`,qe=`#version 300 es
precision highp float;
in float vA;
uniform float uScale;
uniform float uPoint;
out vec4 outColor;
void main() {
  float a = fract(vA);
  float size = floor(vA) / 10.0;
  float r = length(gl_PointCoord - 0.5) * uPoint;
  float edge = size * uScale * 0.5;
  float cov = clamp(edge - r + 0.5, 0.0, 1.0);
  outColor = vec4(vec3(1.0) * a * cov, a * cov);
}`;function Gt(r,t,e){let i=r.createShader(t);if(r.shaderSource(i,e),r.compileShader(i),!r.getShaderParameter(i,r.COMPILE_STATUS))throw new Error(`${t===r.VERTEX_SHADER?"vertex":"fragment"} shader: ${r.isContextLost()?"context lost":r.getShaderInfoLog(i)}`);return i}function at(r,t,e){let i=r.createProgram();if(r.attachShader(i,Gt(r,r.VERTEX_SHADER,t)),r.attachShader(i,Gt(r,r.FRAGMENT_SHADER,e)),r.bindAttribLocation(i,0,"aPos"),r.bindAttribLocation(i,0,"aDot"),r.linkProgram(i),!r.getProgramParameter(i,r.LINK_STATUS))throw new Error(r.getProgramInfoLog(i)||"link");let s=new Map;return{p:i,loc:n=>(s.has(n)||s.set(n,r.getUniformLocation(i,n)),s.get(n))}}var Ge=["uC0","uC1","uC2","uR0","uR1","uR2"],G=7;function Xt(r){let t=r;return{w:t.naturalWidth||t.videoWidth||t.displayWidth||t.width||1,h:t.naturalHeight||t.videoHeight||t.displayHeight||t.height||1}}var ct=class{constructor(t,e={}){this.canvas=t,this.screens={content:null,revealed:null},this.blank=null,this.sizePt={w:1,h:1},this.farBlur=-1,this.field=new Float32Array(19),this.dotsSize=0,this.pal=new Float32Array(27),this.palKey=null,this.ahead=new Float32Array(3),this.behind=new Float32Array(3),this.scratches=new Map,this.alpha=!!e.alpha;let i=t.getContext("webgl2",{antialias:!1,premultipliedAlpha:!0,alpha:this.alpha,depth:!1,stencil:!1,preserveDrawingBuffer:!1});if(this.ok=!!i,this.gl=i,!i){this.quad=this.dots=null,this.main=this.blur=this.copy=this.dot=null;return}this.main=at(i,bt,Oe),this.blur=at(i,bt,Ie),this.copy=at(i,bt,We),this.dot=at(i,Ne,qe),this.quad=i.createBuffer(),i.bindBuffer(i.ARRAY_BUFFER,this.quad),i.bufferData(i.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),i.STATIC_DRAW),this.dots=i.createBuffer()}get lost(){return!this.ok||this.gl.isContextLost()}get maxTextureSize(){return this.ok?this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE):0}has(t){return!!this.screens[t]}texture(t,e,i,s=!1){let n=this.gl,a=n.createTexture();return n.bindTexture(n.TEXTURE_2D,a),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i?n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,i):n.texImage2D(n.TEXTURE_2D,0,n.RGBA,t,e,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,s?n.LINEAR_MIPMAP_LINEAR:n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),s&&n.generateMipmap(n.TEXTURE_2D),a}target(t,e){let i=this.gl,s=this.texture(t,e),n=i.createFramebuffer();return i.bindFramebuffer(i.FRAMEBUFFER,n),i.framebufferTexture2D(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,s,0),{tex:s,fb:n,w:t,h:e}}drop(t){t&&(this.gl.deleteTexture(t.tex),this.gl.deleteFramebuffer(t.fb))}quadDraw(t){let e=this.gl;e.useProgram(t.p),e.bindBuffer(e.ARRAY_BUFFER,this.quad),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLE_STRIP,0,4)}blurred(t,e,i,s,n){let a=this.gl,l=e/this.sizePt.w,o=s*l,h=Math.max(1,Math.round(o/5)),c=Math.max(1,Math.round(e/h)),u=Math.max(1,Math.round(i/h)),d=n;(!d||d.w!==c||d.h!==u)&&(this.drop(d),d=this.target(c,u));let v=this.scratch(c,u);a.viewport(0,0,c,u),a.bindFramebuffer(a.FRAMEBUFFER,d.fb),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,t),a.useProgram(this.copy.p),a.uniform1i(this.copy.loc("uTex"),0),a.uniform1f(this.copy.loc("uLod"),Math.log2(h)),this.quadDraw(this.copy);let b=o/h;return a.useProgram(this.blur.p),a.uniform1i(this.blur.loc("uTex"),0),a.uniform1f(this.blur.loc("uSigma"),Math.max(b,.01)),a.bindFramebuffer(a.FRAMEBUFFER,v.fb),a.bindTexture(a.TEXTURE_2D,d.tex),a.uniform2f(this.blur.loc("uStep"),1/c,0),this.quadDraw(this.blur),a.bindFramebuffer(a.FRAMEBUFFER,d.fb),a.bindTexture(a.TEXTURE_2D,v.tex),a.uniform2f(this.blur.loc("uStep"),0,1/u),this.quadDraw(this.blur),a.bindFramebuffer(a.FRAMEBUFFER,null),d}scratch(t,e){let i=`${t}x${e}`,s=this.scratches.get(i);return s||(s=this.target(t,e),this.scratches.set(i,s)),s}setScreen(t,e,i,s,n="content"){if(!this.ok)return;let a=this.gl,{w:l,h:o}=Xt(t);this.sizePt.w=e,this.sizePt.h=i;let h=this.screens[n];h&&(h.w!==l||h.h!==o)&&(this.dropScreen(h),h=null),h?(a.bindTexture(a.TEXTURE_2D,h.sharp),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,t),a.generateMipmap(a.TEXTURE_2D)):h={sharp:this.texture(l,o,t,!0),near:null,far:null,w:l,h:o},h.near=this.blurred(h.sharp,h.w,h.h,G,h.near),h.far=this.blurred(h.sharp,h.w,h.h,Math.max(s,G),h.far),this.screens[n]=h,this.farBlur=s}setSize(t,e){this.sizePt.w=Math.max(t,1),this.sizePt.h=Math.max(e,1)}clearScreen(t){this.ok&&(this.dropScreen(this.screens[t]),this.screens[t]=null)}dropScreen(t){t&&(this.gl.deleteTexture(t.sharp),this.drop(t.near),this.drop(t.far))}patchScreen(t,e,i,s){if(!this.ok)return;let n=this.screens[t];if(!n)return;let{w:a,h:l}=Xt(e);if(i<0||s<0||i+a>n.w||s+l>n.h)return;let o=this.gl;o.bindTexture(o.TEXTURE_2D,n.sharp),o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),o.texSubImage2D(o.TEXTURE_2D,0,i,s,o.RGBA,o.UNSIGNED_BYTE,e),o.generateMipmap(o.TEXTURE_2D)}reblur(t){if(!this.ok)return;let e=this.screens[t];e&&(e.near=this.blurred(e.sharp,e.w,e.h,G,e.near),e.far=this.blurred(e.sharp,e.w,e.h,Math.max(this.farBlur,G),e.far))}setBlur(t){if(!(!this.ok||t===this.farBlur)){this.farBlur=t;for(let e of[this.screens.content,this.screens.revealed])e&&(e.far=this.blurred(e.sharp,e.w,e.h,Math.max(t,G),e.far))}}clear(){if(!this.ok)return;let t=this.gl;t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,this.canvas.width,this.canvas.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT)}blankTexture(){if(!this.blank){let t=this.gl;this.blank=t.createTexture(),t.bindTexture(t.TEXTURE_2D,this.blank),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,new Uint8Array(4)),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST)}return this.blank}render(t,e,i,s,n={}){if(!this.ok)return;let a=this.screens.content;if(!a&&!this.alpha)return;if(!t&&this.alpha){this.clear();return}let l=n.same?a:this.screens.revealed??a,o=this.gl,h=this.canvas.width,c=this.canvas.height;o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,h,c),o.disable(o.BLEND);let u=this.main;o.useProgram(u.p);let d=a?null:this.blankTexture();for(let p=0;p<6;p++){let A=p<3?a:l,C=A?p%3===0?A.sharp:p%3===1?A.near.tex:A.far.tex:d;o.activeTexture(o.TEXTURE0+p),o.bindTexture(o.TEXTURE_2D,C),o.uniform1i(u.loc(Ge[p]),p)}o.uniform2f(u.loc("uSize"),this.sizePt.w,this.sizePt.h),o.uniform2f(u.loc("uPx"),h,c);let v=!!t;if(o.uniform1i(u.loc("uLive"),v?1:0),!t){o.uniform1i(u.loc("uRevealed"),0),this.quadDraw(u);return}let b=a?Math.min(Math.max(n.gain??1,0),1):0,f=t.energy*b,y=t.gravity*b,g=this.field;g[0]=t.ox,g[1]=t.oy,g[2]=t.spine,g[3]=t.radius,g[4]=t.squash,g[5]=t.time,g[6]=f,g[7]=t.swell,g[8]=t.width,g[9]=t.height,g[10]=y,g[11]=t.glow,g[12]=t.clearRadius,g[13]=t.rim,g[14]=t.tilt,g[15]=t.ring?1:0,g[16]=t.hold,g[17]=t.launched?1:0,g[18]=t.hairClearRadius,o.uniform1fv(u.loc("uF"),g);let R=f>0;o.uniform1i(u.loc("uContent"),t.hasCleared?0:1),o.uniform1i(u.loc("uRevealed"),t.launched?1:0),o.uniform1i(u.loc("uLens"),R||y>0?1:0),o.uniform1i(u.loc("uSame"),n.same||l===a?1:0),o.uniform1i(u.loc("uRound"),n.round?1:0),o.uniform1f(u.loc("uFloor"),Math.min(Math.max(n.floor??(this.alpha?0:1),0),1)),o.uniform1f(u.loc("uAmplitude"),e.amplitude),o.uniform1f(u.loc("uLensWidth"),e.lensWidth),o.uniform1f(u.loc("uAberration"),e.aberration),o.uniform1f(u.loc("uBlur"),R?Math.max(e.blur,G):0),o.uniform1f(u.loc("uBlurAhead"),e.blurAhead),o.uniform1f(u.loc("uBlurBehind"),e.blurBehind),o.uniform1f(u.loc("uNear"),G);let w=Math.min(e.palette.colors.length,9);if(this.palKey!==e.palette){this.palKey=e.palette;for(let p=0;p<w;p++)this.pal.set(wt(e.palette.colors[p]),p*3);this.ahead.set(wt(e.palette.ahead)),this.behind.set(wt(e.palette.behind))}if(o.uniform3fv(u.loc("uPal"),this.pal),o.uniform1i(u.loc("uPalCount"),Math.max(w,1)),o.uniform3fv(u.loc("uAhead"),this.ahead),o.uniform3fv(u.loc("uBehind"),this.behind),o.uniform1f(u.loc("uLead"),e.lead),o.uniform1f(u.loc("uTail"),e.tail),o.uniform1f(u.loc("uStrength"),e.strength),o.uniform1f(u.loc("uRimWidth"),e.rimWidth),o.uniform1f(u.loc("uRimSoftness"),e.rimSoftness),o.uniform1f(u.loc("uCorner"),e.cornerRadius),o.uniform1f(u.loc("uUneven"),e.rimUnevenness),o.uniform1f(u.loc("uPulse"),e.rimPulse),o.uniform1f(u.loc("uHairW"),e.hairlineWidth),o.uniform1f(u.loc("uHairO"),e.hairlineOpacity),o.uniform1f(u.loc("uHairWhite"),e.hairlineWhite),o.uniform3fv(u.loc("uLumps"),i),this.quadDraw(u),s&&s.count>0){let p=this.dot;o.enable(o.BLEND),o.blendFunc(o.ONE,o.ONE_MINUS_SRC_ALPHA),o.useProgram(p.p),o.uniform2f(p.loc("uSize"),this.sizePt.w,this.sizePt.h);let A=h/this.sizePt.w;o.uniform1f(p.loc("uScale"),A),o.uniform1f(p.loc("uPoint"),Math.ceil((e.particleSize+1)*A)+2),o.bindBuffer(o.ARRAY_BUFFER,this.dots),this.dotsSize<s.data.length&&(o.bufferData(o.ARRAY_BUFFER,s.data.byteLength,o.DYNAMIC_DRAW),this.dotsSize=s.data.length),o.bufferSubData(o.ARRAY_BUFFER,0,s.data,0,s.count*3),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,3,o.FLOAT,!1,0,0),o.drawArrays(o.POINTS,0,s.count),o.disable(o.BLEND)}}prime(t,e,i,s,n={}){if(!this.ok)return;let a=this.gl;a.enable(a.SCISSOR_TEST),a.scissor(0,0,1,1),this.render(t,e,i,s,n),a.disable(a.SCISSOR_TEST),this.clear()}dispose(){if(!this.ok)return;let t=this.gl;this.dropScreen(this.screens.content),this.dropScreen(this.screens.revealed),this.screens={content:null,revealed:null},this.blank&&t.deleteTexture(this.blank),this.blank=null;for(let e of this.scratches.values())this.drop(e);this.scratches.clear();for(let e of[this.main,this.blur,this.copy,this.dot])t.deleteProgram(e.p);t.deleteBuffer(this.quad),t.deleteBuffer(this.dots)}},it="http://www.w3.org/1999/xhtml",K="http://www.w3.org/2000/svg",Xe=new RegExp("^(?:"+["animation","transition","view-timeline","scroll-timeline","timeline-scope","view-transition","scroll-behavior","scroll-snap","scroll-margin","scroll-padding","scroll-marker","scroll-target","overscroll-behavior","anchor-","position-anchor","position-area","position-try","position-visibility","cursor$","pointer-events$","user-select$","-webkit-user-","-moz-user-","touch-action$","will-change$","resize$","caret-","interactivity$","app-region$","-webkit-app-region$","-webkit-tap-highlight","orphans$","widows$","page","break-","speak","interpolate-size$","field-sizing$","reading-flow$","reading-order$","-moz-window","-moz-force-broken","-moz-context-properties$","-moz-orient$","-webkit-line-grid","-webkit-nbsp-mode","-webkit-cursor","-webkit-touch-callout"].join("|")+")"),He=/(?:^|-)(?:block|inline)(?:-|$)|^border-(?:start|end)-(?:start|end)-radius$/,je=new Set("border-collapse border-spacing caption-side color color-scheme direction empty-cells font-family font-feature-settings font-kerning font-language-override font-optical-sizing font-palette font-size font-size-adjust font-stretch font-width font-style font-synthesis-weight font-synthesis-style font-synthesis-small-caps font-synthesis-position font-variant-alternates font-variant-caps font-variant-east-asian font-variant-emoji font-variant-ligatures font-variant-numeric font-variant-position font-variation-settings font-weight forced-color-adjust hanging-punctuation hyphenate-character hyphenate-limit-chars hyphens image-orientation image-rendering letter-spacing line-break line-height line-height-step list-style-image list-style-position list-style-type math-depth math-shift math-style overflow-wrap paint-order print-color-adjust quotes ruby-align ruby-position tab-size text-align text-align-last text-anchor text-autospace text-combine-upright text-decoration-skip-ink text-emphasis-color text-emphasis-position text-emphasis-style text-indent text-justify text-orientation text-rendering text-shadow text-size-adjust text-spacing-trim text-transform text-underline-offset text-underline-position text-wrap-mode text-wrap-style text-wrap white-space-collapse white-space visibility word-break word-spacing writing-mode fill fill-opacity fill-rule stroke stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width clip-rule color-interpolation color-interpolation-filters color-rendering shape-rendering marker-start marker-mid marker-end -webkit-font-smoothing -moz-osx-font-smoothing -webkit-text-fill-color -webkit-text-stroke-color -webkit-text-stroke-width -webkit-text-security -webkit-locale -webkit-rtl-ordering -webkit-text-orientation -webkit-writing-mode -webkit-line-break -webkit-border-horizontal-spacing -webkit-border-vertical-spacing -webkit-print-color-adjust -webkit-text-decorations-in-effect -webkit-text-size-adjust -webkit-hyphenate-character -webkit-text-emphasis-color -webkit-text-emphasis-position -webkit-text-emphasis-style -webkit-text-combine -webkit-ruby-position -webkit-text-zoom -webkit-box-direction -webkit-user-modify -moz-text-size-adjust -moz-tab-size -moz-box-direction -webkit-hyphens -webkit-text-underline-position -webkit-font-kerning -webkit-font-feature-settings".split(" ")),Ve=new Set(["border-top-color","border-right-color","border-bottom-color","border-left-color","outline-color","text-decoration-color","column-rule-color","-webkit-text-decoration-color"]),Ye=new Set(["script","style","noscript","template","link","meta","title","head","base","source","track","param","datalist"]),Ke=new Set(["area","br","col","embed","hr","img","input","wbr"]),Ze=/^[A-Za-z_][\w.-]*$/,Qe=/^(?:(?:xlink|xml):)?[A-Za-z_][\w.-]*$/,Ht={"*":["dir","lang"],input:["type","placeholder","disabled","min","max","step","size","multiple","readonly"],textarea:["placeholder","rows","cols","disabled","readonly"],select:["multiple","size","disabled"],button:["disabled","type"],option:["disabled","label"],optgroup:["disabled","label"],progress:["value","max"],meter:["value","min","max","low","high","optimum"],td:["colspan","rowspan"],th:["colspan","rowspan"],col:["span"],colgroup:["span"],ol:["start","reversed","type"],li:["value"],details:["open"],dialog:["open"]},O=null,N=[],q=[],Ft=[],Ct=0,ht=0,oe=-1,ae=-1,le=-1,et=-1,Et=[],he=[],Pt={inh:[],non:[]},Tt=new Map;function Je(){if(O&&O.frame.isConnected&&O.frame.contentDocument===O.doc&&O.hidden.isConnected)return!0;if(typeof document>"u")return!1;O?.frame.remove(),O=null,Tt.clear();let r=document.createElement("iframe");r.setAttribute("aria-hidden","true"),r.setAttribute("tabindex","-1"),r.setAttribute("data-dw-skip",""),r.style.cssText="position:fixed;left:0;top:0;width:0;height:0;border:0;margin:0;padding:0;visibility:hidden;pointer-events:none;",(document.body??document.documentElement).appendChild(r);let t=r.contentDocument,e=r.contentWindow;if(!t||!e)return r.remove(),!1;t.open(),t.write(`<!doctype html><html><head></head><body><div id="h" style="display:none"><svg xmlns="${K}"></svg></div></body></html>`),t.close();let i=t.getElementById("h");if(!i)return r.remove(),!1;if(O={frame:r,win:e,doc:t,hidden:i,svg:i.firstElementChild},!N.length){let s=t.createElement("div");i.appendChild(s);let n=e.getComputedStyle(s),a=[],l=[];for(let u=0;u<n.length;u++){let d=n[u];d.startsWith("--")||Xe.test(d)||He.test(d)||(je.has(d)?a:l).push(d)}s.remove(),N=a,q=l,Ft=l.map(u=>Ve.has(u)),Ct=a.indexOf("color"),ht=a.indexOf("font-family"),oe=l.indexOf("transform"),ae=l.indexOf("transform-origin"),le=l.indexOf("perspective-origin"),et=l.indexOf("appearance"),et<0&&(et=l.indexOf("-webkit-appearance"));let o=/^border-(?:top|right|bottom|left)-(?:width|style|color)$/,h=/^background-(?:color|image)$/,c=/^padding-(?:top|right|bottom|left)$/;he=l.map(u=>o.test(u)||h.test(u)||c.test(u)),Et=l.map((u,d)=>o.test(u)||h.test(u)?d:-1).filter(u=>u>=0)}return Pt=ue("div",it,""),!0}function ue(r,t,e){let i=t===K,s=i?"svg:"+r:e?r+":"+e:r,n=Tt.get(s);if(n)return n;let a=O,l;try{l=i?a.doc.createElementNS(K,r):a.doc.createElement(r)}catch{l=a.doc.createElement("span")}e&&l.setAttribute("type",e),(i&&r!=="svg"?a.svg:a.hidden).appendChild(l);let o=a.win.getComputedStyle(l),h={inh:N.map(c=>o.getPropertyValue(c)),non:q.map(c=>o.getPropertyValue(c))};return l.remove(),Tt.set(s,h),h}var H=new Map,yt=new Map,ti=400;function ei(r,t){if(H.size>=ti){let e=H.keys().next().value;e!==void 0&&H.delete(e)}H.set(r,t)}function ce(r){return new Promise(t=>{let e=new FileReader;e.onload=()=>t(typeof e.result=="string"?e.result:null),e.onerror=()=>t(null),e.readAsDataURL(r)})}async function ii(r){try{let t=new AbortController,e=setTimeout(()=>t.abort(),4e3),i=await fetch(r,{signal:t.signal});return clearTimeout(e),i.ok?await i.text():null}catch{return null}}async function Z(r){try{let t=new AbortController,e=setTimeout(()=>t.abort(),4e3),i=await fetch(r,{signal:t.signal});return clearTimeout(e),i.ok?await ce(await i.blob()):null}catch{return null}}async function ri(r,t,e,i){try{let s=document.createElement("canvas");s.width=e,s.height=i;let n=s.getContext("2d");if(!n)return Z(t);n.imageSmoothingQuality="high",n.drawImage(r,0,0,e,i);let a=await new Promise(l=>s.toBlob(l,"image/webp",.96));if(a)return await ce(a)}catch{}return Z(t)}function de(r,t){let e=yt.get(r);return e||(e=t().catch(()=>null).then(i=>{ei(r,i),yt.delete(r)}),yt.set(r,e)),e}var jt=[],St="",Vt=new Map,fe=r=>r.trim().replace(/^(["'])(.*)\1$/,"$2"),$t=r=>fe(r).toLowerCase(),si=r=>r.trim().toLowerCase().replace(/\bnormal\b/g,"400").replace(/\bbold\b/g,"700")||"400",ni=r=>r.toLowerCase().split(",").map(t=>t.trim().replace(/^u\+/,"").split("-").map(e=>e.replace(/^0+(?=.)/,"")).join("-")).filter(Boolean).join(",")||"0-10ffff",me=(r,t,e,i)=>`${$t(r)}|${t.trim().toLowerCase()||"normal"}|${si(e)}|${ni(i)}`;function oi(r){let t={},e=0,i="",s=0,n=a=>{let l=r.slice(s,a),o=l.indexOf(":");o>0&&(t[l.slice(0,o).trim().toLowerCase()]=l.slice(o+1).trim())};for(let a=0;a<r.length;a++){let l=r[a];i?l==="\\"?a++:l===i&&(i=""):l==='"'||l==="'"?i=l:l==="("?e++:l===")"?e=Math.max(0,e-1):l===";"&&e===0&&(n(a),s=a+1)}return n(r.length),t}var ai=["font-style","font-weight","font-stretch","font-width","unicode-range","font-feature-settings","font-variation-settings","ascent-override","descent-override","line-gap-override","size-adjust"];function Yt(r,t,e){let i=/@font-face\s*\{([^}]*)\}/gi,s;for(;s=i.exec(r);){let n=oi(s[1]),a=n["font-family"],l=n.src;if(!a||!l)continue;let o=`font-family:"${fe(a).replace(/["\\]/g,"\\$&")}";`;for(let h of ai)n[h]&&(o+=`${h}:${n[h]};`);e.push({family:$t(a),key:me(a,n["font-style"]??"",n["font-weight"]??"",n["unicode-range"]??""),descriptors:o,src:l,base:t})}}async function li(){let r=Array.from(document.styleSheets),t=r.length+"|"+r.map(n=>{var a,l;return n.href??((l=(a=n.ownerNode)==null?void 0:a.textContent)==null?void 0:l.length)??0}).join(",");if(t===St)return jt;let e=[],i=[],s=(n,a)=>{let l=n.href??document.baseURI,o;try{o=n.cssRules}catch{if(n.href){let c=n.href,u=Vt.get(c);u||Vt.set(c,u=ii(c)),i.push(u.then(d=>{d&&Yt(d,c,e)}))}return}let h=c=>{for(let u=0;u<c.length;u++){let d=c[u];if(d.constructor.name==="CSSFontFaceRule"||d.cssText.startsWith("@font-face"))Yt(d.cssText,l,e);else if(d.styleSheet&&a<4)s(d.styleSheet,a+1);else if(d.cssRules&&!d.cssText.startsWith("@keyframes"))try{h(d.cssRules)}catch{}}};h(o)};for(let n of r)s(n,0);if(document.adoptedStyleSheets)for(let n of document.adoptedStyleSheets)s(n,0);return await Promise.all(i),jt=e,St=t,e}function hi(r,t){let e=/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)(?:\s*format\(\s*["']?([\w-]+)["']?\s*\))?/g,i=null,s;for(;s=e.exec(r);){let n=s[1]??s[2]??s[3]??"",a=n;if(!n.startsWith("data:"))try{a=new URL(n,t).href}catch{continue}let l=(s[4]??"").toLowerCase();if(l==="woff2"||/\.woff2(?:[?#]|$)/i.test(a))return{url:a,format:"woff2"};i??(i={url:a,format:l})}return i}async function ui(r){if(!r.size||!document.fonts)return"";let t=await li();if(!t.length)return"";let e=new Set;document.fonts.forEach(l=>{l.status==="loaded"&&e.add(me(l.family,l.style,l.weight,l.unicodeRange))});let i=t.filter(l=>r.has(l.family)&&(e.has(l.key)||!/url\(/i.test(l.src))),s=[],n=i.map(l=>{if(!/url\(/i.test(l.src))return{f:l,source:null};let o=hi(l.src,l.base);return o&&!o.url.startsWith("data:")&&H.get("u:"+o.url)===void 0&&s.push(de("u:"+o.url,()=>Z(o.url))),{f:l,source:o}});s.length&&await Promise.all(s);let a="";for(let{f:l,source:o}of n){if(!o){a+=`@font-face{${l.descriptors}src:${l.src};}`;continue}let h=o.url.startsWith("data:")?o.url:H.get("u:"+o.url);h&&(a+=`@font-face{${l.descriptors}src:url("${h}")${o.format?` format("${o.format}")`:""};}`)}return a}var pe=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,kt=r=>/[&<>\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/.test(r)?r.replace(pe,"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):r,X=r=>/[&<"\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/.test(r)?r.replace(pe,"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"):r;function dt(r,t,e){let i=H.get(t);return i!==void 0?i:(r.missing.has(t)||r.missing.set(t,e),null)}var ci=/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/g;function ge(r,t){return r.replace(ci,(e,i,s,n)=>{let a=i??s??n??"";if(!a||a.startsWith("data:")||a.startsWith("#"))return e;let l;try{l=new URL(a,document.baseURI).href}catch{return e}let o=l.indexOf("#");if(o>=0&&l.slice(0,o)===location.href.split("#")[0])return`url("${l.slice(o)}")`;let h=dt(t,"u:"+l,()=>Z(l));return h?`url("${h}")`:"none"})}function di(r,t){for(let e of r.split(","))t.families.add($t(e))}function fi(r,t){let e=r.currentSrc||r.src;if(!e)return null;if(e.startsWith("data:"))return e;if(!r.complete||!r.naturalWidth)return null;let i=r.naturalWidth,s=r.naturalHeight,n=Math.max(r.clientWidth,1)*t.o.scale,a=Math.max(r.clientHeight,1)*t.o.scale,l=Math.min(1,Math.max(n/i,a/s));if(l>.62||i*s<4e5||/\.svg(?:[?#]|$)/i.test(e))return dt(t,"u:"+e,()=>Z(e));let o=Math.max(1,Math.ceil(i*l/16)*16),h=Math.max(1,Math.round(o*s/i));return dt(t,`i:${e}|${o}`,()=>ri(r,e,o,h))}function mi(r){try{if(r instanceof HTMLCanvasElement)return r.width&&r.height?r.toDataURL():null;if(!r.videoWidth||r.readyState<2)return null;let t=document.createElement("canvas");return t.width=r.videoWidth,t.height=r.videoHeight,t.getContext("2d").drawImage(r,0,0),t.toDataURL("image/jpeg",.92)}catch{return null}}function pi(r){if(!r)return"";let t="";for(let e in r)t+=`${e}:${r[e]};`;return t}function Kt(r,t,e,i){let s=getComputedStyle(r,t),n=s.getPropertyValue("content");if(!n||n==="none"||n==="normal"||n==="-moz-alt-content"||s.getPropertyValue("display")==="none")return"";let a="",l="";for(let c=0;c<N.length;c++){let u=s.getPropertyValue(N[c]);c===Ct&&(l=u),u!==e[c]&&(a+=`${N[c]}:${u};`)}let o=Pt.non;for(let c=0;c<q.length;c++){let u=s.getPropertyValue(q[c]);u!==o[c]&&(Ft[c]&&u===l||(u.indexOf("url(")>=0&&(u=ge(u,i)),a+=`${q[c]}:${u};`))}let h="dw"+i.classes++;return i.rules.push(`.${h}${t}{${a}}`),h}function ve(r,t,e,i,s){var n,a,l,o;if(r!==s.root&&(a=(n=s.o).skip)!=null&&a.call(n,r))return;let h=r.namespaceURI,c=h===K;if(!c&&h!==it)return;let u=r.localName;if(!c&&Ye.has(u)||!Ze.test(u))return;let d=getComputedStyle(r);if(d.getPropertyValue("display")==="none")return;s.nodes++;let v="",b=null,f=!1;if(!c)if(u==="img"){let m=fi(r,s);m&&(v+=` src="${X(m)}"`)}else if(u==="canvas"||u==="video"){let m=mi(r);u="img",m&&(v+=` src="${X(m)}"`)}else if(u==="iframe"||u==="object"||u==="embed"||u==="audio")u="div",f=!0;else if(u==="textarea")b=r.value;else if(u==="input"){let m=r;m.type!=="file"&&(v+=` value="${X(m.value)}"`),m.checked&&(v+=' checked=""')}else u==="option"&&r.selected&&(v+=' selected=""');let y=!c&&(u==="input"||u==="button")?(r.getAttribute("type")??"").toLowerCase():"",g=ue(u,h,y),R=c?g:Pt,w=new Array(N.length),p="",A=g.inh,C=R.inh;for(let m=0;m<N.length;m++){let x=d.getPropertyValue(N[m]);w[m]=x,(t===null||A[m]!==C[m]||x!==t[m])&&(p+=`${N[m]}:${x};`)}let L=w[Ct];(t===null||w[ht]!==t[ht])&&di(w[ht],s);let F=g.non,k=R.non,D=!i&&d.getPropertyValue("transform")==="none"&&(d.getPropertyValue("translate")||"none")==="none"&&(d.getPropertyValue("rotate")||"none")==="none"&&(d.getPropertyValue("scale")||"none")==="none"&&(d.getPropertyValue("offset-path")||"none")==="none",I=!1;if(!c&&et>=0&&F[et]!=="none")for(let m=0;m<Et.length;m++){let x=Et[m];if(d.getPropertyValue(q[x])!==F[x]){I=!0;break}}for(let m=0;m<q.length;m++){let x=d.getPropertyValue(q[m]),T=k[m],P=F[m]===T&&!(I&&he[m]);if(m===oe&&i)x=x==="none"?i:`${i} ${x}`;else if(P&&(x===T||Ft[m]&&x===L||m===ae&&D||m===le&&d.getPropertyValue("perspective")==="none"))continue;x.indexOf("url(")>=0&&(x=ge(x,s)),p+=`${q[m]}:${x};`}p+=pi((o=(l=s.o).force)==null?void 0:o.call(l,r));let S=Kt(r,"::before",w,s),_=Kt(r,"::after",w,s);if(c){let m=r.attributes;for(let x=0;x<m.length;x++){let{name:T,value:P}=m[x];if(T==="style"||T==="class"||T==="xmlns"||T.startsWith("on")||T.startsWith("xmlns:")||!Qe.test(T))continue;let M=P;if((T==="href"||T==="xlink:href")&&M&&!M.startsWith("#")&&!M.startsWith("data:")){let $=M;try{$=new URL(M,document.baseURI).href}catch{continue}let B=dt(s,"u:"+$,()=>Z($));if(!B)continue;M=B}v+=` ${T}="${X(M)}"`}}else{for(let x of Ht["*"]){let T=r.getAttribute(x);T!==null&&(v+=` ${x}="${X(T)}"`)}let m=Ht[u];if(m)for(let x of m){let T=r.getAttribute(x);T!==null&&(v+=` ${x}="${X(T)}"`)}}let W=S&&_?`${S} ${_}`:S||_,U=`<${u}${h!==e?` xmlns="${h}"`:""}${W?` class="${W}"`:""} style="${X(p)}"${v}`;if(!c&&Ke.has(u)){s.out.push(U+"/>");return}if(s.out.push(U+">"),b!==null)s.out.push(kt(b));else if(!f){let m=r.scrollLeft,x=r.scrollTop,T=m||x?`translate(${-m}px,${-x}px)`:"",P=r.shadowRoot,M=P?P.childNodes:r.childNodes;if(!c&&u==="slot"){let $=r.assignedNodes({flatten:!0});$.length&&(M=$)}for(let $=0;$<M.length;$++){let B=M[$];B.nodeType===1?ve(B,w,h,T,s):B.nodeType===3&&s.out.push(kt(B.data))}}s.out.push(`</${u}>`)}function Zt(r,t){let e={o:t,root:r,out:[],rules:[],classes:0,nodes:0,missing:new Map,families:new Set};return ve(r,null,it,"",e),e}var gi={"%":"%25","#":"%23","\n":"%0A","\r":"%0D","	":"%09"};function vi(r){return new Promise((t,e)=>{let i=new Image;i.onload=()=>t(i),i.onerror=()=>e(new Error("distortion-waves: the snapshot would not load")),i.src="data:image/svg+xml;charset=utf-8,"+r.replace(/[%#\n\r\t]/g,s=>gi[s])})}function wi(r){return!r||r==="transparent"||/(?:,|\/)\s*0(?:\.0+)?%?\s*\)$/.test(r)}function bi(r){for(let t=r.parentElement;t;t=t.parentElement){let e=getComputedStyle(t).backgroundColor;if(!wi(e))return e}return"#fff"}var yi=typeof navigator<"u"&&/AppleWebKit/.test(navigator.userAgent)&&!/Chrome|Chromium|Edg\//.test(navigator.userAgent),xi=typeof CSS<"u"&&typeof CSS.supports=="function"&&CSS.supports("zoom","2")&&!(typeof navigator<"u"&&/Firefox\//.test(navigator.userAgent));async function Ri(r,t){if(!Je())throw new Error("distortion-waves: no document to read styles in");let e=performance.now(),i=Zt(r,t),s=performance.now()-e;if(i.missing.size){await Promise.all(Array.from(i.missing,([R,w])=>de(R,w)));let g=performance.now();i=Zt(r,t),s+=performance.now()-g}let n=await ui(i.families),a=performance.now(),l=+t.width.toFixed(3),o=+t.height.toFixed(3),h=Math.max(1,Math.round(t.width*t.scale)),c=Math.max(1,Math.round(t.height*t.scale)),u=n.length>0||i.out.some(g=>g.indexOf("data:")>=0),d=`<style>${kt(n+i.rules.join(""))}</style>`+i.out.join(""),v=xi&&t.scale!==1?`<svg xmlns="${K}" xmlns:xlink="http://www.w3.org/1999/xlink" width="${h}" height="${c}" viewBox="0 0 ${h} ${c}"><foreignObject x="0" y="0" width="${h}" height="${c}"><div xmlns="${it}" style="position:relative;width:${h}px;height:${c}px;overflow:hidden;"><div style="position:relative;width:${l}px;height:${o}px;overflow:hidden;zoom:${+t.scale.toFixed(4)};">`+d+"</div></div></foreignObject></svg>":`<svg xmlns="${K}" xmlns:xlink="http://www.w3.org/1999/xlink" width="${l}" height="${o}" viewBox="0 0 ${l} ${o}"><foreignObject x="0" y="0" width="${l}" height="${o}"><div xmlns="${it}" style="position:relative;width:${l}px;height:${o}px;overflow:hidden;">`+d+"</div></foreignObject></svg>",b=await vi(v);try{await b.decode()}catch{}yi&&u&&await new Promise(g=>setTimeout(g,60));let f=t.into??document.createElement("canvas");(f.width!==h||f.height!==c)&&(f.width=h,f.height=c);let y=f.getContext("2d",{alpha:!1});if(!y)throw new Error("distortion-waves: no 2D canvas");return y.setTransform(1,0,0,1,0,0),y.fillStyle="#fff",y.fillRect(0,0,h,c),y.fillStyle=t.background,y.fillRect(0,0,h,c),y.drawImage(b,0,0,h,c),{canvas:f,walk:s,raster:performance.now()-a,nodes:i.nodes,size:v.length}}function Ai(){St=""}var Ei=393*852,Ti=ft(.22,1,.36,1),Qt=r=>r,Si=.12,ki=150,Mi=300,Fi=9e6,Ci=3e4,Pi=2e3,$i="button, a[href], [role=button], input, select, textarea, summary, label, [data-wave-source]",Jt=(r,t,e)=>Math.min(Math.max(r,t),e),lt=r=>parseFloat(r)||0,te=r=>{let t=window;typeof t.requestIdleCallback=="function"?t.requestIdleCallback(r,{timeout:600}):window.setTimeout(r,1)},ee=new Map;function Li(r,t){if(!r)return t;if(typeof r!="string")return r;if(r in ut)return ut[r];if(!/^#?[0-9a-f]{6}$/i.test(r))return t;let e=r.replace("#","").toLowerCase(),i=ee.get(e);return i||(i=Ee(Te(e)),ee.set(e,i)),i}function zi(r,t){if(r===t)return!0;if(!r||!t)return!1;let e=Object.keys(r);if(e.length!==Object.keys(t).length)return!1;let i=r,s=t;for(let n of e)if(i[n]!==s[n])return!1;return!0}var Di=["content"],_i=["content","revealed"],xt=()=>({canvas:null,ready:!1,stale:!0,busy:!1,dirty:0,cost:0,last:0,began:0,broken:!1,nodes:0,size:0,walk:0,raster:0,count:0});function Rt(r,t,e){r.style.opacity=t>=1?"":String(Math.max(t,0)),r.style.pointerEvents=e?"":"none",r.toggleAttribute("inert",!e),e?r.removeAttribute("aria-hidden"):r.setAttribute("aria-hidden","true")}var rt=class{constructor(t,e,i=null){this.opts={},this.first=!0,this.destroyed=!1,this.canvas=null,this.renderer=null,this.failed=!1,this.positioned=!1,this.geom=null,this.geomDirty=!0,this.epoch=0,this.style=Wt("vertical"),this.styleDirty=!0,this.total=tt(this.style),this.particles=[],this.particlesKey="",this.dots={data:new Float32Array(0),count:0},this.front=At(),this.probe=At(),this.spot={x:0,y:0,a:0},this.frame={floor:0,gain:0,round:!0,same:!0},this.patch=null,this.primed=!1,this.slots={content:xt(),revealed:xt()},this.waiting={content:!1,revealed:!1},this.p=0,this.run=null,this.runAt=0,this.raf=0,this.scrubbing=!1,this.fading=!1,this.mode=null,this.lensAt=null,this.lastProp=void 0,this.shown=NaN,this.srcEl=null,this.srcCss={x:0,y:0,w:1,h:1},this.focusCss=null,this.src={x:0,y:0,w:1,h:1},this.focus=null,this.held=!1,this.playOpts=null,this.launchAt=0,this.clearAt=1,this.press=null,this.pointerInside=!1,this.focusInside=!1,this.refreshTimer=0,this.releaseTimer=0,this.abort=new AbortController,this.still=null,this.lastGain=0,this.lastFloor=0,this.lastDraw=0,this.tick=s=>{this.raf=0;let n=this.run;if(!n){this.scrubbing&&this.paint(s);return}n.t0<0&&(n.t0=s);let a=n.dur>0?(s-n.t0)/n.dur:1;if(a>=1){this.finish();return}this.p=n.from+(n.to-n.from)*n.ease(a),this.paint(s),this.raf=requestAnimationFrame(this.tick)},this.root=t,this.a=e,this.b=i,getComputedStyle(t).position==="static"&&(t.style.position="relative",this.positioned=!0),this.still=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,this.observer=new MutationObserver(s=>this.onMutations(s)),this.observer.observe(t,{subtree:!0,childList:!0,attributes:!0,characterData:!0}),this.resizer=new ResizeObserver(()=>this.onResize()),this.resizer.observe(t),this.listen()}update(t){if(this.destroyed)return;let e=this.opts;this.opts=t;let i=this.first;this.first=!1,(i||e.type!==t.type||e.palette!==t.palette||!zi(e.waveStyle,t.waveStyle))&&(this.styleDirty=!0),(i||e.scale!==t.scale||e.resolution!==t.resolution||e.cornerRadius!==t.cornerRadius)&&(this.geomDirty=!0);let s=t.revealed,n=s!==void 0&&s!==this.lastProp;if(s!==void 0&&(this.lastProp=s),t.scrub!=null){this.scrubTo(t.scrub);return}if(this.scrubbing){this.scrubbing=!1,this.go(s??this.p>=.5?1:0);return}if(i){this.p=s?1:0,this.held=!1,this.show(this.p),t.prewarm!==!1&&this.warm();return}if(n){this.go(s?1:0);return}(this.styleDirty||this.geomDirty)&&!this.run&&this.p>0&&this.p<1&&this.invalidate()}setRevealedLayer(t){var e;t!==this.b&&(this.b=t,this.slots.revealed=xt(),(e=this.renderer)==null||e.clearScreen("revealed"),this.shown=NaN,!this.run&&!this.scrubbing&&this.show(this.p>=1?1:0))}play(t){this.destroyed||(this.halt(),this.scrubbing=!1,this.p=0,this.held=!1,this.show(0),this.playOpts=t??null,this.go(1))}reverse(){this.destroyed||(this.scrubbing=!1,this.go(0))}reset(){var t;this.destroyed||(this.halt(),this.scrubbing=!1,this.p=0,this.held=!1,this.mode=null,(t=this.renderer)==null||t.clear(),this.canvas&&(this.canvas.style.display="none"),this.show(0),this.rest())}async prepare(){this.destroyed||this.opts.capture===!1||this.motionless()||!this.ensureRenderer()||(this.flush(),await Promise.all(this.needed().map(t=>this.fresh(t)?void 0:this.capture(t))))}get debug(){let t=e=>({ready:e.ready,stale:e.stale,busy:e.busy,cost:e.cost,walk:e.walk,raster:e.raster,nodes:e.nodes,size:e.size,count:e.count});return{progress:this.p,running:!!this.run,mode:this.fading?"fade":this.mode,gain:this.lastGain,floor:this.lastFloor,draw:this.lastDraw,clearAt:this.clearAt,duration:this.total,geometry:this.geom,source:this.src,webgl:!!this.renderer&&!this.renderer.lost,content:t(this.slots.content),revealed:t(this.slots.revealed)}}destroy(){this.destroyed||(this.destroyed=!0,this.halt(),clearTimeout(this.refreshTimer),clearTimeout(this.releaseTimer),this.abort.abort(),this.observer.disconnect(),this.resizer.disconnect(),this.dropRenderer(),this.positioned&&(this.root.style.position=""))}measure(){var t,e;this.geomDirty=!1;let i=this.root,s=i.getBoundingClientRect(),n=getComputedStyle(i),a=i.offsetWidth,l=a>0&&s.width>0?s.width/a:1;(!(l>0)||Math.abs(l-1)<.01)&&(l=1);let o=lt(n.borderLeftWidth),h=lt(n.borderTopWidth),c=lt(n.borderRightWidth),u=lt(n.borderBottomWidth),d=s.width/l,v=s.height/l,b=Math.max(d-o-c,1),f=Math.max(v-h-u,1),y=Math.min(d,v)/2,g=(M,$)=>{let B=M.split(" ")[0],E=parseFloat(B)||0;return Math.max(Math.min(B.endsWith("%")?E/100*d:E,y)-$,0)},R=g(n.borderTopLeftRadius,o),w=g(n.borderTopRightRadius,c),p=g(n.borderBottomRightRadius,c),A=g(n.borderBottomLeftRadius,o),C=this.opts.cornerRadius,L=C!=null&&C>=0?C:Math.max(R,w,p,A),F=C!=null&&C>=0&&R+w+p+A===0?`${C}px`:`${R}px ${w}px ${p}px ${A}px`,k=this.opts.scale??"auto",D=typeof k=="number"&&k>0?k:Jt(Math.sqrt(b*f/Ei),.6,2.2),I=((t=this.renderer)==null?void 0:t.maxTextureSize)||4096,S=this.opts.resolution&&this.opts.resolution>0?this.opts.resolution:(window.devicePixelRatio||1)*l,_=Math.min(S,Math.sqrt(Fi/(b*f)),I/b,I/f),W=Math.max(1,Math.round(b*_)),U=Math.max(1,Math.round(f*_)),m=this.geom,x=!m||m.W!==W||m.H!==U||m.w!==b||m.h!==f||m.bl!==o||m.bt!==h,T=!m||m.k!==D||m.radius!==L;this.geom={w:b,h:f,bw:d,bh:v,bl:o,bt:h,anc:l,k:D,vw:b/D,vh:f/D,bs:_,W,H:U,radius:L,radii:F};let P=this.canvas;if(P&&((P.width!==W||P.height!==U)&&(P.width=W,P.height=U),P.style.borderRadius!==F&&(P.style.borderRadius=F)),x&&(this.epoch++,this.slots.content.stale=!0,this.slots.revealed.stale=!0),(x||T||this.styleDirty)&&(this.restyle(),this.run||this.scrubbing)){if((e=this.srcEl)!=null&&e.isConnected){let M=this.srcEl.getBoundingClientRect();M.width>0&&M.height>0&&(this.srcCss=this.local(M))}this.retime()}}local(t){let e=this.geom,i=this.root.getBoundingClientRect();return{x:(t.left-i.left)/e.anc-e.bl,y:(t.top-i.top)/e.anc-e.bt,w:t.width/e.anc,h:t.height/e.anc}}restyle(){let t=this.geom;if(!t)return;this.styleDirty=!1;let e=this.opts,i=Wt(e.type??"vertical"),s=e.waveStyle;if(s){let l=i,o=s;for(let h in o){let c=o[h];h!=="palette"&&h!=="type"&&h!=="cornerRadius"&&typeof c=="number"&&isFinite(c)&&(l[h]=c)}}i.palette=Li(e.palette??s?.palette,i.palette),i.cornerRadius=t.radius/t.k;let n=Math.sqrt(t.k);i.hairlineWidth/=n,i.particleSize/=n,this.style=i,this.total=tt(i);let a=`${Math.round(i.particleCount)}|${i.particleSize}|${i.particleLife}`;a!==this.particlesKey&&(this.particlesKey=a,this.particles=Be(i),this.dots.data.length<this.particles.length*3&&(this.dots={data:new Float32Array(this.particles.length*3),count:0}))}aim(t){var e,i;let s=this.opts,n=((e=this.playOpts)==null?void 0:e.source)??s.source;if(t===0&&this.held&&n==null)return;let a=this.geom,l=performance.now(),o=this.press&&l-this.press.t<Pi?this.press:null,h=null,c=null;if(n&&typeof n.getBoundingClientRect=="function"?h=n:n&&"current"in n?h=n.current:n&&(c=n),!h&&!c){if((i=o?.el)!=null&&i.isConnected)h=o.el;else if(!o){let f=document.activeElement;f&&f!==this.root&&this.root.contains(f)&&(h=f)}}if(h){let f=h.getBoundingClientRect();f.width>0&&f.height>0?c=this.local(f):h=null}let u=s.type??"vertical",d=o?this.local({left:o.x,top:o.y,width:0,height:0}):null,v=null,b=this.playOpts&&"focus"in this.playOpts?this.playOpts.focus:s.focus;if(b!==void 0?v=b:d&&(!h||h===o.el)&&(v={x:d.x,y:d.y}),!c){let f=a.k;if(u==="center"){let y=d??{x:a.w/2,y:a.h/2};c={x:y.x-29*f,y:y.y-29*f,w:58*f,h:58*f}}else if(u==="horizontal"){let y=Math.min(a.h*.5,240*f);c={x:-20*f,y:(a.h-y)/2,w:40*f,h:y}}else{let y=Math.min(a.w-48*f,345*f);c={x:(a.w-y)/2,y:a.h-82*f,w:y,h:58*f}}}this.srcEl=h,this.srcCss=c,this.focusCss=v}retime(){let t=this.geom,e=this.style,i=t.k,s=this.srcCss;this.src={x:s.x/i,y:s.y/i,w:s.w/i,h:s.h/i},this.focus=this.focusCss?{x:this.focusCss.x/i,y:this.focusCss.y/i}:null,this.total=tt(e),this.launchAt=e.anticipation/this.total;let n=o=>gt(o,this.src,t.vw,t.vh,e,this.focus,this.probe).hasCleared;if(!n(1)){this.clearAt=1;return}let a=this.launchAt,l=1;for(let o=0;o<22;o++){let h=(a+l)/2;n(h)?l=h:a=h}this.clearAt=l}motionless(){var t;let e=this.opts.reducedMotion??"system";return e==="always"||e==="system"&&!!((t=this.still)!=null&&t.matches)}needed(){return this.b?_i:Di}fresh(t){let e=this.slots[t];return e.ready&&!e.stale}halt(){cancelAnimationFrame(this.raf),this.raf=0,this.run=null,this.fading=!1,this.playOpts=this.playOpts&&null}go(t){var e;if(this.destroyed)return;clearTimeout(this.refreshTimer),clearTimeout(this.releaseTimer),this.flush();let i=!this.run&&(this.p<=0||this.p>=1);if(i&&this.p===t){this.playOpts=null;return}if(cancelAnimationFrame(this.raf),this.raf=0,this.motionless()||!this.ensureRenderer()){(e=this.renderer)==null||e.clear(),this.canvas&&(this.canvas.style.display="none"),this.fading=!0,this.mode=null,this.run={from:this.p,to:t,t0:-1,dur:Mi*Math.abs(t-this.p),ease:Qt},this.raf=requestAnimationFrame(this.tick);return}this.fading=!1,this.measure(),(i||this.geomDirty)&&(this.aim(t),this.mode=null),this.retime(),this.playOpts=null;let s=this.total;if(this.run={from:this.p,to:t,t0:-1,dur:(t===1?s:s/Math.max(this.style.returnSpeed,.05))*1e3,ease:t===1?Qt:Ti},i){let n=this.opts.capture!==!1;this.runAt=performance.now();let a=n;for(let l of this.needed()){let o=this.fresh(l);this.waiting[l]=n&&!o,o||(a=!1,n&&!this.slots[l].busy&&this.capture(l))}this.lensAt=a?-1/0:null}this.canvas.style.display="block",this.raf=requestAnimationFrame(this.tick)}paint(t){if(this.fading||!this.renderer||this.renderer.lost){this.show(this.p);return}let e=performance.now();this.draw(t),this.lastDraw=performance.now()-e}invalidate(){!this.raf&&!this.destroyed&&(this.raf=requestAnimationFrame(this.tick))}finish(){var t,e;let i=this.run.to;this.run=null,this.p=i,this.fading=!1,this.mode=null,this.lensAt=null,this.waiting.content=this.waiting.revealed=!1,this.lastGain=this.lastFloor=0,this.held=i===1,this.renderer&&!this.renderer.lost&&this.renderer.clear(),this.canvas&&(this.canvas.style.display="none"),this.show(i),this.rest(),(e=(t=this.opts).onFinish)==null||e.call(t,i===1)}scrubTo(t){let e=Jt(t,0,1);if(!this.scrubbing){let i=!this.run&&(this.p<=0||this.p>=1);if(this.halt(),this.scrubbing=!0,clearTimeout(this.refreshTimer),clearTimeout(this.releaseTimer),this.flush(),this.motionless()||!this.ensureRenderer())this.fading=!0;else{if(this.measure(),i&&(this.aim(1),this.mode=null),this.retime(),this.waiting.content=this.waiting.revealed=!1,this.lensAt=-1/0,this.opts.capture!==!1)for(let s of this.needed())!this.fresh(s)&&!this.slots[s].busy&&this.capture(s);this.canvas.style.display="block"}}e===this.p&&this.shown===this.shown&&!this.styleDirty&&!this.geomDirty||(this.p=e,this.invalidate())}draw(t){let e=this.renderer;this.geomDirty?this.measure():this.styleDirty&&(this.restyle(),this.retime());let i=this.geom,s=this.style,n=this.p;if(n<=0||n>=1){e.clear(),this.lastGain=this.lastFloor=0,this.show(n>=1?1:0);return}let a=!!this.b,l=gt(n,this.src,i.vw,i.vh,s,this.focus,this.front),o=this.slots.content,h=this.slots.revealed,c=this.opts.capture!==!1,u=c&&o.ready&&!this.waiting.content&&(!a||h.ready&&!this.waiting.revealed),d=0;u&&(this.lensAt===null&&(this.lensAt=t),d=this.scrubbing||this.lensAt===-1/0?1:z(0,ki,t-this.lensAt));let v=0,b=!0,f=u,y=Si/this.total;a&&(!this.scrubbing&&this.mode===null&&n>this.launchAt&&n<this.clearAt+y&&(this.mode=u?"lens":"plain"),!this.scrubbing&&this.mode!==null&&(f=this.mode==="lens"),f?(b=!1,n>=this.clearAt?(this.show(1),v=1-z(this.clearAt,this.clearAt+y,n)):this.show(0)):(d=0,this.show(l.hasCleared?1:l.launched?z(.08,.7,l.moved):0))),this.lastGain=d,this.lastFloor=v,e.setSize(i.vw,i.vh),e.setBlur(s.blur);let g=qt(n*this.total,i.vw,i.vh,s.cornerRadius,s.rimPulse),R=this.dots,w=0;if(l.time>0){let A=this.src,C=this.particles,L=this.spot;for(let F=0;F<C.length;F++){let k=C[F];Ue(k,l,A,s,L),!(L.a<=.002)&&(R.data[w*3]=L.x,R.data[w*3+1]=L.y,R.data[w*3+2]=Math.floor(k.size*10)+Math.min(L.a,.999),w++)}}R.count=w;let p=this.frame;p.floor=v,p.gain=d,p.same=b,u&&this.patchLive(),e.render(l,s,g,R,p),c&&this.chase(t,l,d>0&&(l.energy>0||l.gravity>0)||v>0||a&&f&&l.launched&&n<this.clearAt+y)}patchLive(){let t=this.renderer,e=this.geom;if(!t||!e)return;let i=this.root.querySelectorAll("canvas[data-dw-live]");if(!i.length)return;let s=!1,n=!1;for(let a=0;a<i.length;a++){let l=i[a],o=this.a.contains(l)?"content":this.b&&this.b.contains(l)?"revealed":null;if(!o||!l.width||!l.height)continue;let h=this.slots[o].canvas;if(!h||!t.has(o))continue;let c=this.local(l.getBoundingClientRect()),u=e.bs,d=c.x*u,v=c.y*u,b=Math.max(0,Math.floor(d)),f=Math.max(0,Math.floor(v)),y=Math.min(h.width,Math.ceil(d+c.w*u)),g=Math.min(h.height,Math.ceil(v+c.h*u));if(y<=b||g<=f)continue;let R=y-b,w=g-f,p=this.patch;p||(p=this.patch=document.createElement("canvas")),(p.width!==R||p.height!==w)&&(p.width=R,p.height=w);let A=p.getContext("2d");if(!A)return;A.setTransform(1,0,0,1,0,0),A.globalCompositeOperation="copy",A.drawImage(h,b,f,R,w,0,0,R,w),A.globalCompositeOperation="source-over",A.drawImage(l,0,0,l.width,l.height,d-b,v-f,c.w*u,c.h*u),t.patchScreen(o,p,b,f),o==="content"?s=!0:n=!0}s&&t.reblur("content"),n&&t.reblur("revealed")}chase(t,e,i){let s=this.opts.live??!0,n=this.needed();for(let a=0;a<n.length;a++){let l=n[a],o=this.slots[l];if(!(o.busy||o.broken)){if(this.waiting[l]||!o.ready){this.capture(l);continue}if(s===!1||!i||this.scrubbing){this.scrubbing&&o.stale&&this.capture(l);continue}t-o.last<Math.max(90,o.cost*6)||(!o.stale&&s==="animations"&&this.animating(l)&&(o.stale=!0),o.stale&&this.capture(l))}}}animating(t){let e=t==="content"?this.a:this.b;return!e||typeof e.getAnimations!="function"?!1:e.getAnimations({subtree:!0}).some(i=>i.playState==="running")}show(t){if(t===this.shown)return;this.shown=t;let e=this.b;if(!e)Rt(this.a,1,!0);else{let i=t>.5;Rt(this.a,t>=1?0:1,!i),Rt(e,t,i)}this.flush()}ensureRenderer(){if(this.renderer)return this.renderer.lost?null:this.renderer;if(this.failed||this.destroyed)return null;let t=document.createElement("canvas");t.setAttribute("data-dw-skip",""),t.setAttribute("aria-hidden","true");let e=t.style;e.position="absolute",e.left=e.top="0",e.width=e.height="100%",e.pointerEvents="none",e.zIndex="1",e.display="none";let i=new ct(t,{alpha:!0});if(!i.ok)return this.failed=!0,null;let s={signal:this.abort.signal};return t.addEventListener("webglcontextlost",n=>{n.preventDefault(),this.slots.content.ready=this.slots.revealed.ready=!1,this.run&&this.finish()},s),t.addEventListener("webglcontextrestored",()=>{this.destroyed||this.canvas!==t||(this.renderer=new ct(t,{alpha:!0}),this.primed=!1,this.slots.content.stale=this.slots.revealed.stale=!0,this.scheduleRefresh(!0))},s),this.root.appendChild(t),this.canvas=t,this.renderer=i,this.primed=!1,this.slots.content.ready=this.slots.revealed.ready=!1,this.geomDirty=!0,this.flush(),i}dropRenderer(){var t,e;let i=this.renderer,s=this.canvas;this.renderer=null,this.canvas=null;for(let n of["content","revealed"]){let a=this.slots[n];a.ready=!1,a.stale=!0,a.canvas=null}i!=null&&i.ok&&(i.dispose(),(e=(t=s?.getContext("webgl2"))==null?void 0:t.getExtension("WEBGL_lose_context"))==null||e.loseContext()),s?.remove(),this.destroyed||this.flush()}async capture(t){let e=this.slots[t],i=t==="content"?this.a:this.b,s=this.renderer;if(e.busy||this.destroyed||!i||!s||s.lost)return;this.flush(),(this.geomDirty||!this.geom)&&this.measure();let n=this.geom,a=this.root,l=this.canvas,o=t==="content"?this.b:this.a,h=e.dirty,c=this.epoch,u=performance.now();e.busy=!0,e.began=u;let d=!1;try{let v=g=>g===l||g===o||g.hasAttribute("data-dw-skip")||g.hasAttribute("data-dw-live"),b=bi(a),f,y=this.opts.capture;if(typeof y=="function")f=await y({element:a,slot:t,width:n.w,height:n.h,scale:n.bs,background:b,ignore:v});else{let g={"border-radius":"0",position:"absolute",left:`${-n.bl}px`,top:`${-n.bt}px`,right:"auto",bottom:"auto",margin:"0",transform:"none",translate:"none",rotate:"none",scale:"none",opacity:"1",visibility:"visible",width:`${n.bw}px`,height:`${n.bh}px`,"box-sizing":"border-box","min-width":"0","min-height":"0","max-width":"none","max-height":"none"},R={opacity:"1",visibility:"visible"},w=await Ri(a,{width:n.w,height:n.h,scale:n.bs,background:b,skip:v,force:p=>p===a?g:p===i?R:void 0,into:e.canvas??void 0});e.canvas=w.canvas,e.walk=w.walk,e.raster=w.raster,e.nodes=w.nodes,e.size=w.size,f=w.canvas}if(this.destroyed||this.renderer!==s||s.lost||c!==this.epoch)return;s.setScreen(f,n.vw,n.vh,this.style.blur,t),e.ready=!0,e.stale=e.dirty!==h,e.broken=!1,e.count++,d=!0}catch(v){e.broken=!0,typeof console<"u"&&console.warn("distortion-waves: could not picture the element; the wave runs without its lens.",v)}finally{e.busy=!1,e.last=performance.now(),e.cost=e.last-u}this.destroyed||(d&&(u>=this.runAt||!e.stale)&&(this.waiting[t]=!1),e.broken&&(this.waiting[t]=!1),this.scrubbing?this.invalidate():this.run||(d&&this.prime(),this.scheduleRefresh()))}prime(){let t=this.renderer,e=this.geom;if(this.primed||!t||t.lost||!e)return;let i=this.needed();for(let h=0;h<i.length;h++)if(!this.slots[i[h]].ready)return;this.primed=!0;let s=this.style,n=Math.min(e.vw,e.vh)/4,a={x:(e.vw-n)/2,y:(e.vh-n)/2,w:n,h:n},l=gt((s.anticipation+s.travel*.1)/tt(s),a,e.vw,e.vh,s,null,this.probe),o=this.dots.data.length>=3?this.dots:null;o&&(o.data[0]=e.vw/2,o.data[1]=e.vh/2,o.data[2]=10.5,o.count=1),t.setSize(e.vw,e.vh),t.setBlur(s.blur),t.prime(l,s,qt(0,e.vw,e.vh,s.cornerRadius,s.rimPulse),o,{floor:0,gain:1,round:!0,same:!this.b}),o&&(o.count=0)}warm(){this.opts.capture!==!1&&te(()=>{this.destroyed||this.run||this.scrubbing||this.motionless()||!this.ensureRenderer()||(this.refresh(),this.rest())})}refresh(){if(!(this.destroyed||this.run||this.scrubbing||this.opts.capture===!1||!this.renderer||this.renderer.lost)){this.flush();for(let t of this.needed()){let e=this.slots[t];!this.fresh(t)&&!e.busy&&!e.broken&&this.capture(t)}}}scheduleRefresh(t=!1){if(this.destroyed||this.run||this.scrubbing||this.opts.capture===!1||!this.renderer||this.renderer.lost||!t&&!this.pointerInside&&!this.focusInside||this.fresh("content")&&(!this.b||this.fresh("revealed")))return;clearTimeout(this.refreshTimer);let e=Math.max(this.slots.content.cost,this.slots.revealed.cost);this.refreshTimer=window.setTimeout(()=>te(()=>this.refresh()),Math.max(140,e*8))}rest(){this.destroyed||(this.scheduleRefresh(),clearTimeout(this.releaseTimer),!(this.pointerInside||this.focusInside||!this.renderer)&&(this.releaseTimer=window.setTimeout(()=>{this.destroyed||this.run||this.scrubbing||this.pointerInside||this.focusInside||this.dropRenderer()},Ci)))}mark(t){if(t&&t!==this.root){let n=t.nodeType===1?t:t.parentElement,a=n&&typeof n.closest=="function"?n.closest("[data-dw-skip],canvas[data-dw-live]"):null;if(a&&this.root.contains(a))return!1}let e=this.slots.content,i=this.slots.revealed,s=!!t&&this.a.contains(t);return!s&&t&&this.b&&this.b.contains(t)||(e.dirty++,e.stale=!0,e.broken=!1),s||(i.dirty++,i.stale=!0,i.broken=!1),!0}onMutations(t){let e=!1;for(let i of t){let s=i.target;if(s!==this.canvas){if(i.type==="attributes"){if((s===this.a||s===this.b)&&(i.attributeName==="style"||i.attributeName==="inert"||i.attributeName==="aria-hidden"))continue}else if(i.type==="childList"&&s===this.root){let n=!0;for(let a of[i.addedNodes,i.removedNodes])for(let l=0;l<a.length;l++){let o=a[l];o.nodeType===1&&o.hasAttribute("data-dw-skip")||(n=!1)}if(n)continue}this.mark(s)&&(e=!0)}}e&&this.scheduleRefresh()}flush(){let t=this.observer.takeRecords();t.length&&this.onMutations(t)}onResize(){let t=this.geom;this.geomDirty=!0,t&&(this.scrubbing?this.invalidate():this.run||this.scheduleRefresh(!0))}listen(){var t;let e=this.root,i={signal:this.abort.signal,passive:!0},s={...i,capture:!0},n=l=>{this.mark(l.target)&&this.scheduleRefresh()};e.addEventListener("pointerdown",l=>{let o=l.target,h=o&&typeof o.closest=="function"?o.closest($i):null;this.press={el:h&&e.contains(h)?h:null,x:l.clientX,y:l.clientY,t:performance.now()}},s),e.addEventListener("pointerenter",()=>{this.pointerInside=!0,clearTimeout(this.releaseTimer),!this.renderer&&!this.run&&this.opts.capture!==!1?this.warm():this.scheduleRefresh()},i),e.addEventListener("pointerleave",()=>{this.pointerInside=!1,!this.run&&!this.scrubbing&&this.rest()},i),e.addEventListener("pointerover",n,i),e.addEventListener("pointerout",n,i),e.addEventListener("focusin",l=>{this.focusInside=!0,clearTimeout(this.releaseTimer),n(l)},i),e.addEventListener("focusout",l=>{let o=l.relatedTarget;this.focusInside=!!o&&e.contains(o),n(l),!this.focusInside&&!this.run&&!this.scrubbing&&this.rest()},i);for(let l of["input","change","transitionend","animationend"])e.addEventListener(l,n,i);e.addEventListener("scroll",n,s),e.addEventListener("load",l=>{this.mark(l.target),this.scheduleRefresh(!0)},s);let a=document.fonts;(t=a?.addEventListener)==null||t.call(a,"loadingdone",()=>{Ai(),this.mark(null),this.scheduleRefresh(!0)},i)}},ie=typeof window<"u"?Ut:It,Mt={gridArea:"1 / 1",minWidth:0,minHeight:0,isolation:"isolate"},re={...Mt,opacity:0,pointerEvents:"none"},Bi={gridArea:"1 / 1",minWidth:0,minHeight:0,position:"relative",zIndex:2,pointerEvents:"none"},Ui=':where([data-dw-layer="overlay"])>*{pointer-events:auto}',Gi=Dt(function(r,t){let{children:e,revealedContent:i,overlay:s,revealed:n,type:a,source:l,focus:o,waveStyle:h,palette:c,scale:u,cornerRadius:d,scrub:v,capture:b,live:f,prewarm:y,resolution:g,reducedMotion:R,onFinish:w,style:p,...A}=r,C=Q(null),L=Q(null),F=Q(null),k=Q(null),[D]=_t(()=>!!n),I=i!=null&&i!==!1;return ie(()=>{let S=new rt(C.current,L.current,F.current);return k.current=S,()=>{S.destroy(),k.current=null}},[]),ie(()=>{let S=k.current;S&&(S.setRevealedLayer(F.current),S.update({revealed:n,type:a,source:l,focus:o,waveStyle:h,palette:c,scale:u,cornerRadius:d,scrub:v,capture:b,live:f,prewarm:y,resolution:g,reducedMotion:R,onFinish:w}))}),Bt(t,()=>({play:S=>{var _;return(_=k.current)==null?void 0:_.play(S)},reverse:()=>{var S;return(S=k.current)==null?void 0:S.reverse()},reset:()=>{var S;return(S=k.current)==null?void 0:S.reset()},prepare:()=>{var S;return((S=k.current)==null?void 0:S.prepare())??Promise.resolve()},get element(){return C.current},get controller(){return k.current}}),[]),pt("div",{ref:C,"data-distortion-wave":"",...A,style:{display:"grid",isolation:"isolate",...p},children:[st("div",{ref:L,"data-dw-layer":"content",style:I&&D?re:Mt,children:e}),I?st("div",{ref:F,"data-dw-layer":"revealed",style:D?Mt:re,children:i}):null,s!=null&&s!==!1?pt("div",{"data-dw-layer":"overlay","data-dw-skip":"",style:Bi,children:[st("style",{"data-dw-skip":"",children:Ui}),s]}):null]})});return Ae(Ii);})();
