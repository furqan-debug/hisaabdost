import{bb as o}from"./index-BKzwkbhU.js";
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const e=o=>"ION-CONTENT"===o.tagName,t=async t=>e(t)?(await new Promise((e=>o(t,e))),t.getScrollElement()):t,r=o=>o.closest("ion-content, .ion-content-scroll-host"),s=(o,t)=>{if(e(o)){return o.scrollToTop(t)}return Promise.resolve(o.scrollTo({top:0,left:0,behavior:"smooth"}))},l=(o,t,r,s)=>{if(e(o)){return o.scrollByPoint(t,r,s)}return Promise.resolve(o.scrollBy({top:r,left:t,behavior:s>0?"smooth":"auto"}))};export{l as a,r as f,t as g,s};
