import{ba as e,bb as t,bc as n}from"./index-BKzwkbhU.js";import{f as o,s}from"./index8-Xm3H2wcV.js";
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const r=()=>{const r=window;r.addEventListener("statusTap",(()=>{e((()=>{const e=r.innerWidth,i=r.innerHeight,a=document.elementFromPoint(e/2,i/2);if(!a)return;const d=o(a);d&&new Promise((e=>t(d,e))).then((()=>{n((async()=>{d.style.setProperty("--overflow","hidden"),await s(d,300),d.style.removeProperty("--overflow")}))}))}))}))};export{r as startStatusTap};
