(function(){
'use strict';
var SCRIPT=document.currentScript;if(!SCRIPT)return;
var PID=SCRIPT.dataset.bot||'demo';
var API='https://d5dsbah1d4ju0glmp9d0.3zvepvee.apigw.yandexcloud.net/?action=web-chat';
var S=function(k,v){try{if(v!==undefined){localStorage.setItem(k,v);return v}return localStorage.getItem(k)}catch(e){return v!==undefined?v:null}};
var sid=S('neurogen_web_session')||('web_'+crypto.randomUUID()+'_'+Date.now());if(!S('neurogen_web_session'))S('neurogen_web_session',sid);
var email=S('neurogen_email')||'',userName=S('neurogen_name')||'',emailSub=S('neurogen_email_submitted')==='true',emailVer=S('neurogen_email_verified')==='true',userId='';
var jwt=S('neurogen_jwt');if(jwt){try{var p=JSON.parse(atob(jwt.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));userId=p.uid||''}catch(e){}}
var ch=[],isOpen=false,wait=false,stepLoaded=false;

var css=document.createElement('style');
css.textContent=
'.neurogen-w *{box-sizing:border-box;margin:0;padding:0}'+
'.neurogen-w{position:fixed!important;bottom:20px;right:20px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.4;color:#e2e8f0}'+
'.neurogen-btn{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#a855f7);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(168,85,247,0.4);display:flex;align-items:center;justify-content:center;font-size:28px;transition:transform .2s,box-shadow .2s;position:relative}'+
'.neurogen-btn:hover{transform:scale(1.05);box-shadow:0 6px 25px rgba(168,85,247,0.5)}'+
'.neurogen-badge{position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid #0f172a}'+
'.neurogen-popup{position:fixed!important;bottom:90px;right:20px;width:380px;height:580px;max-width:calc(100vw-40px);max-height:calc(100vh-110px);border-radius:20px;overflow:hidden;display:none;flex-direction:column;background:#0f172a;border:1px solid rgba(255,255,255,0.1);box-shadow:0 20px 60px rgba(0,0,0,0.6)}'+
'.neurogen-popup.open{display:flex}'+
'.neurogen-hdr{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(15,23,42,0.98);flex-shrink:0}'+
'.neurogen-hdr-l{display:flex;align-items:center;gap:10px}'+
'.neurogen-ava{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#a855f7);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px}'+
'.neurogen-hdr-t{font-weight:700;font-size:13px}'+
'.neurogen-hdr-s{font-size:10px;color:#64748b}'+
'.neurogen-close{background:none;border:none;color:#64748b;cursor:pointer;font-size:20px;padding:4px;line-height:1}'+
'.neurogen-body{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}'+
'.neurogen-body::-webkit-scrollbar{width:4px}'+
'.neurogen-body::-webkit-scrollbar-track{background:transparent}'+
'.neurogen-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}'+
'.neurogen-msg{padding:12px 16px;border-radius:16px;max-width:85%;word-break:break-word;font-size:13px;line-height:1.5;animation:fadeIn .3s ease}'+
'.neurogen-msg.bot{background:rgba(30,41,59,0.8);border:1px solid rgba(255,255,255,0.06);align-self:flex-start;border-bottom-left-radius:4px}'+
'.neurogen-msg.user{background:linear-gradient(135deg,#06b6d4,#a855f7);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}'+
'.neurogen-msg.loading{background:rgba(30,41,59,0.5);align-self:flex-start;border-bottom-left-radius:4px}'+
'.neurogen-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#64748b;margin:0 2px;animation:dotPulse 1.4s infinite}'+
'.neurogen-dot:nth-child(2){animation-delay:.2s}'+
'.neurogen-dot:nth-child(3){animation-delay:.4s}'+
'.neurogen-btn-row{padding:0 20px 12px;display:flex;flex-direction:column;gap:6px}'+
'.neurogen-btn-row button{padding:12px 16px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#e2e8f0;font-size:12px;font-weight:600;cursor:pointer;text-align:left;transition:background .2s,border-color .2s;display:flex;justify-content:space-between;align-items:center}'+
'.neurogen-btn-row button:hover{background:rgba(255,255,255,0.08);border-color:rgba(168,85,247,0.4)}'+
'.neurogen-btn-row button .arr{color:#64748b;font-size:16px}'+
'.neurogen-img{width:100%;border-radius:12px;margin-bottom:4px;border:1px solid rgba(255,255,255,0.06)}'+
'.neurogen-foot{flex-shrink:0;border-top:1px solid rgba(255,255,255,0.06);padding:12px 16px;background:rgba(15,23,42,0.98)}'+
'.neurogen-foot form{display:flex;gap:8px}'+
'.neurogen-foot input{flex:1;padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#e2e8f0;font-size:13px;outline:none}'+
'.neurogen-foot input:focus{border-color:rgba(168,85,247,0.5)}'+
'.neurogen-foot input::placeholder{color:#475569}'+
'.neurogen-foot button{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#06b6d4,#a855f7);border:none;color:#fff;cursor:pointer;font-size:18px;flex-shrink:0;display:flex;align-items:center;justify-content:center}'+
'.neurogen-foot button:disabled{opacity:.3;cursor:not-allowed}'+
'.neurogen-email{padding:20px;display:flex;flex-direction:column;gap:12px;justify-content:center;flex:1}'+
'.neurogen-email h3{font-size:16px;font-weight:700;text-align:center}'+
'.neurogen-email p{font-size:12px;color:#64748b;text-align:center}'+
'.neurogen-email input{padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#e2e8f0;font-size:13px;outline:none}'+
'.neurogen-email input:focus{border-color:rgba(168,85,247,0.5)}'+
'.neurogen-email .err{color:#ef4444;font-size:11px;text-align:center;display:none}'+
'.neurogen-email button{padding:12px;border-radius:12px;background:linear-gradient(135deg,#06b6d4,#a855f7);border:none;color:#fff;font-weight:700;font-size:13px;cursor:pointer}'+
'.neurogen-email button:disabled{opacity:.3;cursor:not-allowed}'+
'.neurogen-status{font-size:11px;color:#64748b;text-align:center;padding:8px 20px}'+
'@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}'+
'@keyframes dotPulse{0%,80%,100%{opacity:.3}40%{opacity:1}}';
document.head.appendChild(css);

var w=document.createElement('div');w.className='neurogen-w';
var btn=document.createElement('button');btn.className='neurogen-btn';btn.innerHTML='💬<span class="neurogen-badge"></span>';
btn.onclick=function(){isOpen?closeWidget():openWidget()};
w.appendChild(btn);

var popup=document.createElement('div');popup.className='neurogen-popup';
popup.innerHTML=
'<div class="neurogen-hdr"><div class="neurogen-hdr-l"><div class="neurogen-ava">N</div><div><div class="neurogen-hdr-t">NeuroGen</div><div class="neurogen-hdr-s">Онлайн</div></div></div><button class="neurogen-close" onclick="(function(){closeWidget()})()">✕</button></div>'+
'<div class="neurogen-body" id="n-body"></div>'+
'<div class="neurogen-foot" id="n-foot" style="display:none"><form id="n-form"><input id="n-input" placeholder="Введите сообщение..." autocomplete="off"><button type="submit" id="n-send">➤</button></form></div>';
w.appendChild(popup);
document.body.appendChild(w);

function q(id){return document.getElementById(id)}
var body=q('n-body'),foot=q('n-foot'),form=q('n-form'),input=q('n-input'),send=q('n-send');

function closeWidget(){isOpen=false;popup.classList.remove('open');btn.innerHTML='💬<span class="neurogen-badge"></span>'}
function openWidget(){isOpen=true;popup.classList.add('open');btn.innerHTML='✕';if(!stepLoaded&&emailSub)loadStep();if(emailSub&&input)setTimeout(function(){input.focus()},300)}

function addMsg(html,cls){var d=document.createElement('div');d.className='neurogen-msg '+cls;d.innerHTML=html;body.appendChild(d);body.scrollTop=body.scrollHeight;return d}
function addLoading(){var d=document.createElement('div');d.className='neurogen-msg loading';d.innerHTML='<span class="neurogen-dot"></span><span class="neurogen-dot"></span><span class="neurogen-dot"></span>';body.appendChild(d);body.scrollTop=body.scrollHeight;return d}
function rmLoader(l){if(l){if(l.parentNode)l.parentNode.removeChild(l)}}

function api(payload){
  var b=Object.assign({},payload,{sessionId:sid,userId:userId,email:email,partner_id:PID,afid:window.partnerAfid||'',first_name:userName||''});
  return fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json()}).catch(function(){return{success:false,error:'Ошибка соединения'}});
}

function renderStep(data){
  stepLoaded=true;
  if(data.image){var img=document.createElement('img');img.className='neurogen-img';img.src=data.image;img.alt='';body.appendChild(img)}
  if(data.text){addMsg(data.text.replace(/\n/g,'<br>'),'bot')}
  if(data.token){S('neurogen_jwt',data.token);try{var p=JSON.parse(atob(data.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));userId=p.uid||''}catch(e){}}
  if(data.buttons&&data.buttons.length){
    var c=document.createElement('div');c.className='neurogen-btn-row';
    data.buttons.forEach(function(row){
      row.forEach(function(b){
        var bt=document.createElement('button');
        bt.innerHTML=b.text+' <span class="arr">→</span>';
        if(b.url){bt.onclick=function(){window.open(b.url)}}
        else if(b.web_app&&b.web_app.url){bt.onclick=function(){window.open(b.web_app.url)}}
        else if(b.callback_data){
          bt.onclick=function(){
            ch.push({role:'user',content:b.text});
            loadStep(b.callback_data,b.text);
          };
        }
        c.appendChild(bt);
      });
    });
    body.appendChild(c);body.scrollTop=body.scrollHeight;
  }
  foot.style.display='flex';
  if(input)setTimeout(function(){input.focus()},100);
}

function loadStep(cd,bt){
  wait=true;
  var ld=addLoading();
  api({
    action:cd?'click-button':'get-web-step',
    callback_data:cd||null,
    message:bt||'',
    email:email
  }).then(function(data){
    rmLoader(ld);
    if(data.success===false){addMsg('⚠️ '+data.error,'bot');wait=false;return}
    renderStep(data);
    wait=false;
  }).catch(function(){rmLoader(ld);addMsg('⚠️ Ошибка сервера','bot');wait=false});
}

function showEmailForm(){
  body.innerHTML='';
  foot.style.display='none';
  var c=document.createElement('div');c.className='neurogen-email';
  c.innerHTML='<h3>🚀 NeuroGen Chat</h3><p>Введите email для начала работы</p>';
  var nm=document.createElement('input');nm.type='text';nm.placeholder='Ваше имя';nm.id='n-ename';
  var em=document.createElement('input');em.type='email';em.placeholder='Email';em.id='n-eemail';
  var er=document.createElement('div');er.className='err';er.id='n-eerr';
  var sb=document.createElement('button');sb.id='n-esub';sb.textContent='Начать';
  sb.onclick=function(){
    var name=nm.value.trim(),emailVal=em.value.trim();
    if(!name){er.textContent='Введите имя';er.style.display='block';return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)){er.textContent='Некорректный email';er.style.display='block';return}
    er.style.display='none';sb.disabled=true;sb.textContent='Отправка...';
    api({isEmail:true,email:emailVal,first_name:name}).then(function(data){
      S('neurogen_email',emailVal);S('neurogen_name',name);S('neurogen_email_submitted','true');
      email=emailVal;userName=name;emailSub=true;
      if(data&&data.token){S('neurogen_jwt',data.token);try{var p=JSON.parse(atob(data.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));userId=p.uid||''}catch(e){}}
      c.innerHTML='<h3>✅ Почта отправлена</h3><p class="neurogen-status">Проверьте <b>'+emailVal+'</b> и перейдите по ссылке из письма. Затем нажмите кнопку ниже.</p><button id="n-everify">✅ Я подтвердил(а)</button>';
      document.getElementById('n-everify').onclick=function(){
        if(S('neurogen_email_verified')==='true'){startChat()}else{er.textContent='Email ещё не подтверждён. Проверьте почту.';er.style.display='block'}
      };
    }).catch(function(){sb.disabled=false;sb.textContent='Начать';er.textContent='Ошибка сети';er.style.display='block'});
  };
  c.appendChild(nm);c.appendChild(em);c.appendChild(er);c.appendChild(sb);
  body.appendChild(c);body.scrollTop=0;
}

function startChat(){
  body.innerHTML='';
  addMsg('👋 Добро пожаловать! Загружаем ваш сценарий...','bot');
  foot.style.display='flex';
  loadStep();
}

form.onsubmit=function(e){e.preventDefault();var t=input.value.trim();if(!t||wait)return;
  input.value='';wait=true;send.disabled=true;
  ch.push({role:'user',content:t});addMsg(t.replace(/</g,'&lt;').replace(/>/g,'&gt;'),'user');
  var ld=addLoading();
  api({message:t,history:ch.slice(-10)}).then(function(data){
    rmLoader(ld);
    if(data.token){S('neurogen_jwt',data.token);try{var p=JSON.parse(atob(data.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));userId=p.uid||''}catch(e){}}
    if(data.image){var im=document.createElement('img');im.className='neurogen-img';im.src=data.image;im.alt='';body.appendChild(im);body.scrollTop=body.scrollHeight}
    var a=data.answer||data.text||'🤖 Я немного задумался. Повтори, пожалуйста!';
    ch.push({role:'assistant',content:a});addMsg(a.replace(/\n/g,'<br>'),'bot');
    if(data.loadNextStep){setTimeout(function(){loadStep()},1500)}
    wait=false;send.disabled=false;input.focus();
  }).catch(function(){rmLoader(ld);addMsg('⚠️ Ошибка сервера','bot');wait=false;send.disabled=false});
};

// Init
if(emailSub&&emailVer){startChat();}
else if(emailSub&&!emailVer){showEmailForm();}
else{showEmailForm();}

// Poll verification status
var verCheck=setInterval(function(){
  if(!emailSub||emailVer)return;
  if(S('neurogen_email_verified')==='true'){emailVer=true;startChat()}
},2000);

// Expose
window.neurogenWidget={open:openWidget,close:closeWidget};
})();
