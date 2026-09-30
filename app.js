const CITIES={"São Paulo-SP":{lat:-23.55,lng:-46.63},"Guarulhos-SP":{lat:-23.45,lng:-46.53},"São Bernardo-SP":{lat:-23.69,lng:-46.55},"Campinas-SP":{lat:-22.9,lng:-47.06},"Jundiaí-SP":{lat:-23.18,lng:-46.88},"Sorocaba-SP":{lat:-23.5,lng:-47.45},"Santos-SP":{lat:-23.96,lng:-46.33},"São José dos Campos-SP":{lat:-23.22,lng:-45.9},"Curitiba-PR":{lat:-25.42,lng:-49.27},"Resende-RJ":{lat:-22.47,lng:-44.44},"Betim-MG":{lat:-19.96,lng:-44.19},"Contagem-MG":{lat:-19.93,lng:-44.05}};
const CATS=["Motores","Aço / Chapas","Rolamentos","Elétrica / CLP","Hidráulica","Ferramentas","Embalagens","Fixação"];
let DB=[
{v:"Metalúrgica Atlas",c:"São Bernardo-SP",t:"Motor WEG 10CV trifásico 220/380V",cat:"Motores",p:4800,m:8900,q:4,cond:"Seminovo revisado",kg:85,d:"Excedente de expansão de linha. Com laudo.",nfe:true,sales:34},
{v:"AutoPeças Rinaldi",c:"Jundiaí-SP",t:"Lote 200kg chapa aço carbono 3mm",cat:"Aço / Chapas",p:1350,m:2400,q:12,cond:"Novo / excedente",kg:200,d:"Sobras de corte, sem oxidação.",nfe:true,sales:51},
{v:"Fabrimetal Guarulhos",c:"Guarulhos-SP",t:"Rolamentos SKF 6205 (cx c/20)",cat:"Rolamentos",p:890,m:1490,q:30,cond:"Novo / excedente",kg:18,d:"Compra em excesso para manutenção.",nfe:true,sales:47},
{v:"Plasvit Indústria",c:"Campinas-SP",t:"CLP Siemens S7-1200 + IHM",cat:"Elétrica / CLP",p:5200,m:9400,q:2,cond:"Seminovo revisado",kg:12,d:"Desativação de célula robotizada.",nfe:true,sales:12},
{v:"HidraTorque",c:"Sorocaba-SP",t:"Bomba hidráulica Rexroth A10V",cat:"Hidráulica",p:3100,m:5800,q:3,cond:"Usado funcional",kg:45,d:"Revisada, testada em bancada.",nfe:true,sales:19},
{v:"Usinagem Precisa",c:"São Paulo-SP",t:"Fresas carbide + insertos (lote)",cat:"Ferramentas",p:1150,m:2100,q:15,cond:"Novo / excedente",kg:25,d:"Troca de processo produtivo.",nfe:true,sales:28},
{v:"Papelão Forte",c:"Santos-SP",t:"Pallets plásticos 120x100 (50 un)",cat:"Embalagens",p:2900,m:4750,q:50,cond:"Usado funcional",kg:750,d:"Logística reversa, higienizados.",nfe:true,sales:63},
{v:"FixSteel",c:"Betim-MG",t:"Parafusos inox M12 (10 mil un)",cat:"Fixação",p:1980,m:3400,q:8,cond:"Novo / excedente",kg:320,d:"Lote de obra cancelada. Com NF-e.",nfe:true,sales:41},
{v:"EletroVale",c:"São José dos Campos-SP",t:"Inversor WEG CFW500 15CV",cat:"Elétrica / CLP",p:3900,m:6700,q:5,cond:"Seminovo revisado",kg:22,d:"Com manual e garantia 90 dias.",nfe:true,sales:15},
{v:"AutoBelt Curitiba",c:"Curitiba-PR",t:"Correias transportadoras 8m",cat:"Hidráulica",p:1750,m:3200,q:6,cond:"Novo / excedente",kg:140,d:"Projeto alterado.",nfe:true,sales:22},
{v:"SiderVale",c:"Resende-RJ",t:"Vigas I 6m perfil laminado",cat:"Aço / Chapas",p:6400,m:11200,q:20,cond:"Novo / excedente",kg:1800,d:"Estoque de estrutura metálica.",nfe:true,sales:18},
{v:"PackMinas",c:"Contagem-MG",t:"Bobinas filme stretch (1t)",cat:"Embalagens",p:5200,m:8100,q:4,cond:"Novo / excedente",kg:1000,d:"Excesso de importação.",nfe:true,sales:26},
];
const $=id=>document.getElementById(id);
const BRL=v=>(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const BRL2=v=>(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
let ROLE='compradora';
let USER=JSON.parse(localStorage.getItem('coopdig_user')||'null');
function hav(a,b){const R=6371,dLa=(b.lat-a.lat)*Math.PI/180,dLo=(b.lng-a.lng)*Math.PI/180;const s=Math.sin(dLa/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(s));}
function pesoFee(totalKg){if(totalKg<=50)return{label:'até 50kg (base)',v:0};if(totalKg<=200)return{label:'51–200kg',v:80};if(totalKg<=500)return{label:'201–500kg',v:180};if(totalKg<=1000)return{label:'501–1000kg',v:350};return{label:'+1t — R$0,45/kg extra',v:350+(totalKg-1000)*0.45};}
function totals(x,dist,pickup){
  const totalKg=x.kg*(x.q||1);
  const taxa=x.p*0.30;
  let frete=0,desc=0,pf=pesoFee(totalKg);
  if(pickup&&dist<=50){frete=0;}
  else{frete=45+dist*3.2+pf.v;if(dist<=30){desc=frete*0.4;frete-=desc;}}
  const seguro=x.p*0.012;
  const total=x.p+taxa+frete+seguro;
  const save=x.m-total;
  return{taxa,frete,seguro,desc,pf,totalKg,total,save,pct:Math.max(0,Math.round(save/x.m*100))};
}
function maskCnpj(el){let v=el.value.replace(/\D/g,'').slice(0,14);if(v.length>12)el.value=v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,'$1.$2.$3/$4-$5');else if(v.length>8)el.value=v.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/,'$1.$2.$3/$4');else if(v.length>5)el.value=v.replace(/(\d{2})(\d{3})(\d{0,3})/,'$1.$2.$3');else if(v.length>2)el.value=v.replace(/(\d{2})(\d{0,3})/,'$1.$2');else el.value=v;}
function validCNPJ(c){c=(c||'').replace(/\D/g,'');if(c.length!==14||/^(\d)\1+$/.test(c))return false;let t=c.length-2,n=c.substring(0,t),d=c.substring(t),s=0,p=t-7;for(let i=t;i>=1;i--){s+=n.charAt(t-i)*p--;if(p<2)p=9;}let r=s%11<2?0:11-s%11;if(r!=d.charAt(0))return false;t++;n=c.substring(0,t);s=0;p=t-7;for(let i=t;i>=1;i--){s+=n.charAt(t-i)*p--;if(p<2)p=9;}r=s%11<2?0:11-s%11;return r==d.charAt(1);}
function tab(w){$("tabIn").classList.toggle('active',w==='in');$("tabUp").classList.toggle('active',w==='up');$("formIn").classList.toggle('hidden',w!=='in');$("formUp").classList.toggle('hidden',w!=='up');}
function setRole(r){ROLE=r;[['roleB','compradora'],['roleS','vendedora'],['roleBS','ambas']].forEach(([id,v])=>$(id).classList.toggle('active',v===r));}
function goLogin(){document.getElementById('login').scrollIntoView({behavior:'smooth'});}
function msg(id,txt,ok){const e=$(id);e.textContent=txt;e.className='msg '+(ok?'ok':'err');}
function doRegister(){
  const name=$("upName").value.trim(),cnpj=$("upCnpj").value,email=$("upEmail").value.trim(),pass=$("upPass").value,city=$("upCity").value,ie=$("upNfe").value.trim();
  if(!name||!email||!pass)return msg('regMsg','Preencha razão social, e-mail e senha.',false);
  if(!validCNPJ(cnpj))return msg('regMsg','CNPJ inválido. Digite os 14 dígitos.',false);
  if(!ie)return msg('regMsg','Informe a Inscrição Estadual — NF-e é obrigatória.',false);
  if(!$("upTerm").checked)return msg('regMsg','É preciso aceitar o Termo de Consentimento + NF-e.',false);
  const users=JSON.parse(localStorage.getItem('coopdig_users')||'{}');
  users[cnpj.replace(/\D/g,'')]={name,cnpj,email,pass,city,ie,role:ROLE,termo:'v1.0-LGPD-NFe',at:new Date().toISOString()};
  localStorage.setItem('coopdig_users',JSON.stringify(users));
  USER={name,cnpj,email,city,role:ROLE};localStorage.setItem('coopdig_user',JSON.stringify(USER));
  msg('regMsg','✓ Cadastro concluído! Termo assinado digitalmente. Bem-vinda, '+name+'.',true);refreshUser();
}
function doLogin(){
  const cnpj=$("inCnpj").value,pass=$("inPass").value;
  if(!validCNPJ(cnpj))return msg('loginMsg','CNPJ inválido.',false);
  const users=JSON.parse(localStorage.getItem('coopdig_users')||'{}');
  const u=users[cnpj.replace(/\D/g,'')];
  if(!u)return msg('loginMsg','CNPJ não cadastrado. Use a aba Cadastrar empresa.',false);
  if(u.pass!==pass)return msg('loginMsg','Senha incorreta.',false);
  USER={name:u.name,cnpj:u.cnpj,email:u.email,city:u.city,role:u.role};localStorage.setItem('coopdig_user',JSON.stringify(USER));
  msg('loginMsg','✓ Bem-vinda de volta, '+u.name+' ('+u.role+').',true);refreshUser();
}
function logout(){USER=null;localStorage.removeItem('coopdig_user');refreshUser();}
function refreshUser(){
  const b=$("userBox");
  if(USER){$("footUser").textContent=USER.name+' • '+USER.role;b.classList.remove('hidden');b.innerHTML=`<strong>● ${USER.name}</strong><br>${USER.cnpj} • ${USER.role} • ${USER.city||''}<br><small>Termo LGPD + NF-e assinado ✓</small><br><br><button class="btn dark" onclick="logout()">Sair</button>`;}
  else{$("footUser").textContent='visitante';b.classList.add('hidden');}
}
function openModal(h){$("modalBox").innerHTML=h;$("modal").classList.remove("hidden")}
function closeAll(){$("modal").classList.add("hidden");$("drawerAnnounce").classList.add("hidden")}
function showTermo(){
openModal(`<div class="term-doc">
<h2>📜 Termo de Consentimento, Adesão e Isenção — COOPDIG</h2>
<p><b>Cooperativa Digital de Intermediação Industrial.</b> Versão 1.0 • Base legal: Lei 13.709/2018 (LGPD), arts. 722–729 do Código Civil (corretagem), Lei 5.172/1966 (CTN), RICMS/SP e Marco Civil da Internet (Lei 12.965/2014). <b>Leia antes de cadastrar CNPJ.</b></p>
<div class="box"><b>1. OBJETO.</b> A COOPDIG é mera <b>intermediadora digital</b> entre pessoas jurídicas (compradora e vendedora). Não adquire, estoca ou assume propriedade dos bens. Modelo de referência: marketplaces (Mercado Livre, Shopee).</div>
<h3>2. Consentimento LGPD (arts. 7º, 8º e 11)</h3>
<p>Ao cadastrar o <b>CNPJ, razão social, e-mail, localização, IE e dados de anúncios</b>, você consente de forma livre, informada e inequívoca com o tratamento para: (a) verificação de identidade e regularidade fiscal; (b) exibição de anúncios e cálculo de frete por distância/peso; (c) intermediação de pagamento via escrow; (d) emissão de ranking e certificado de reutilização. Dados sensíveis não são solicitados. Direitos do titular (art. 18 LGPD — acesso, correção, eliminação, revogação) pelo e-mail privacidade@coopdig.com.br. Retenção: 5 anos (art. 173 CTN + art. 16 LGPD).</p>
<h3>3. NF-e OBRIGATÓRIA ⚠️</h3>
<p><b>Toda circulação de mercadoria exige Nota Fiscal Eletrônica</b> (art. 113 CTN + Ajuste SINIEF 07/2005). Sem NF-e válida: (i) o anúncio é bloqueado; (ii) a venda é cancelada sem ônus à compradora; (iii) a conta pode ser suspensa; (iv) tributos, multas e autuações são de <b>exclusiva responsabilidade da vendedora</b>. A COOPDIG poderá exigir XML/DANFE antes de liberar o pagamento.</p>
<h3>4. Deveres da VENDEDORA</h3>
<p>Declarar estado real, peso, quantidade e origem; emitir NF-e; embalar e disponibilizar para coleta em 48h; aceitar devolução em 7 dias por vício oculto; responder por vícios, evicção e divergências (arts. 441–446 CC).</p>
<h3>5. Deveres da COMPRADORA</h3>
<p>Conferir anúncio, distância e frete por peso antes de propor; optar por <b>retirada própria (frete R$0 até 50 km)</b> ou coleta paga; pagar via escrow; emitir NF-e de entrada quando aplicável.</p>
<h3>6. Limitação de responsabilidade da COOPDIG</h3>
<p>A COOPDIG não responde por: qualidade, procedência, atraso de coleta, avaria no transporte de terceiros, obrigações fiscais/trabalhistas das partes ou uso indevido do bem. Responsabilidade limitada à taxa de intermediação (30%), nos termos do art. 722 CC. Força maior e caso fortuito excluem responsabilidade.</p>
<h3>7. Pagamento, taxa e frete</h3>
<p>Taxa cooperativa de 30% sobre o anúncio. Frete = R$45 base + R$3,20/km + faixa de peso (0–50kg base; 51–200 +R$80; 201–500 +R$180; 501–1000 +R$350; +1t R$0,45/kg). Desconto local de 40% até 30 km. Retirada própria até 50 km = R$0. Valores retidos em escrow até confirmação de recebimento + NF-e.</p>
<h3>8. Penalidades e foro</h3>
<p>Descumprimento do termo ou venda sem NF-e gera advertência, suspensão e exclusão do ranking. Foro: domicílio da COOPDIG, com renúncia a qualquer outro.</p>
<p><b>Ao clicar "Cadastrar e assinar termo" você declara que leu, entendeu e aceita integralmente este instrumento, assinando-o eletronicamente (art. 10, §2º, MP 2.200-2/2001).</b></p>
<button class="btn primary" onclick="closeAll()">Entendi e concordo</button>
</div>`);
}
function init(){
  const cities=Object.keys(CITIES);
  $("citySelect").innerHTML=cities.map(c=>`<option>${c}</option>`).join("");
  $("catFilter").innerHTML='<option value="">Todas categorias</option>'+CATS.map(c=>`<option>${c}</option>`).join("");
  $("fCat").innerHTML=CATS.map(c=>`<option>${c}</option>`).join("");
  $("fCity").innerHTML=cities.map(c=>`<option>${c}</option>`).join("");
  $("upCity").innerHTML=cities.map(c=>`<option>${c}</option>`).join("");
  $("citySelect").onchange=render;$("q").oninput=render;$("catFilter").onchange=render;$("radiusFilter").onchange=render;
  $("pickupOnly").onchange=render;
  $("btnAnnounce").onclick=()=>{if(!USER){goLogin();msg('regMsg','Faça login com CNPJ e aceite o termo antes de anunciar.',false);tab('in');return;}$("drawerAnnounce").classList.remove("hidden")};
  $("modal").onclick=e=>{if(e.target.id==="modal")closeAll()};
  $("drawerAnnounce").onclick=e=>{if(e.target.id==="drawerAnnounce")closeAll()};
  refreshUser();render();simUpdate();renderRank();
}
function render(){
  const home=CITIES[$("citySelect").value];const q=($("q").value||"").toLowerCase();const cat=$("catFilter").value;const rad=+($("radiusFilter").value);const sort=$("sort").value;const onlyPickup=$("pickupOnly").checked;
  let list=DB.map((x,i)=>{const dist=Math.round(hav(home,CITIES[x.c]));const tt=totals(x,dist,onlyPickup||dist<=30&&false);const ttPick=totals(x,dist,true);return{...x,i,dist,tt,ttPick}})
    .filter(x=>(!cat||x.cat===cat)&&x.t.toLowerCase().includes(q)&&x.dist<=rad&&(!onlyPickup||x.dist<=50));
  if(sort==="price")list.sort((a,b)=>a.tt.total-b.tt.total);else if(sort==="discount")list.sort((a,b)=>b.tt.pct-a.tt.pct);else list.sort((a,b)=>a.dist-b.dist);
  $("count").textContent=`• ${list.length} lotes • a partir de ${$("citySelect").value}`;
  $("grid").innerHTML=list.map(x=>{
    const near=x.dist<=50,freePick=near;
    return `<div class="p-card"><span class="tag">${near?'📍 PERTO — retirada R$0':'-'+x.tt.pct+'% vs novo'}</span>
    <div class="p-top"><span>📍 ${x.dist} km • ${x.c}</span><span>${x.cond}</span></div>
    <h3>${x.t}</h3><div class="seller">${x.v} • ${x.cat} • qtd ${x.q} • ${x.tt.totalKg.toLocaleString('pt-BR')} kg</div>
    <div class="price">${BRL(x.p)}</div><div class="market">novo ${BRL(x.m)} • economiza <b>${BRL(x.tt.save)}</b></div>
    <span class="nfe">✓ NF-e garantida</span>
    <div class="fees"><div><span>Taxa coop. 30%</span><span>${BRL(x.tt.taxa)}</span></div><div><span>Entrega (${x.tt.pf.label})</span><span>${x.tt.frete===0?'R$ 0 retirada':BRL(x.tt.frete)}</span></div><div><span><b style="color:#fff">Total entregue</b></span><span><b style="color:var(--green)">${BRL(x.tt.total)}</b></span></div>${freePick?`<div><span>🟢 Retirada própria</span><span><b style="color:var(--green)">${BRL(x.ttPick.total)}</b></span></div>`:''}</div>
    <div class="p-actions"><button class="btn primary" onclick="detail(${x.i})">Ver + propor</button><button class="btn dark" onclick="detail(${x.i},true)">♻ Reservar</button></div>
  </div>`}).join("")||"<p style='color:var(--mut)'>Nada neste raio. Desmarque 'só retirada' ou amplie a distância — mas aí entra frete por peso.</p>";
  const econ=list.reduce((s,x)=>s+Math.max(0,x.tt.save),0);$("statEcon").textContent=BRL(econ);
  $("statKg").textContent=(list.reduce((s,x)=>s+x.tt.totalKg,0)/1000).toFixed(1)+" t";
  const f=list[0]||{...DB[0],dist:60};const ft=totals(f,f.dist??60,false);
  $("simP").textContent=BRL(f.p);$("simM").textContent=BRL(f.m);$("simBar").style.width=Math.max(8,100-ft.pct)+"%";
  $("simTaxa").textContent=BRL(ft.taxa);$("simFrete").textContent=BRL(ft.frete);$("simTotal").textContent=BRL(ft.total);
}
function renderRank(){
  const agg={};
  DB.forEach(x=>{if(!agg[x.v])agg[x.v]={v:x.v,c:x.c,kg:0,sales:x.sales||1};agg[x.v].kg+=x.kg*(x.q||1);});
  const rows=Object.values(agg).map(a=>({...a,pts:Math.round(a.kg+a.sales*50)})).sort((a,b)=>b.pts-a.pts).slice(0,6);
  const medals=['🥇','🥈','🥉','4º','5º','6º'];
  $("rankList").innerHTML=rows.map((r,i)=>`<div class="rank-row ${i===0?'first':''}"><span class="rank-pos">${medals[i]}</span><div><strong>${r.v}</strong><br><small>${r.c} • ${(r.kg/1000).toFixed(1)} t recirculadas • ${r.sales} vendas c/ NF-e</small></div><span class="rank-pts">${r.pts.toLocaleString('pt-BR')} pts</span><span class="pill">${i===0?'selo ouro ♻':'selo verde'}</span></div>`).join("");
}
function detail(i,reserve){
  const x=DB[i];const home=CITIES[$("citySelect").value];const dist=Math.round(hav(home,CITIES[x.c]));const t=totals(x,dist,false);const tp=totals(x,dist,true);
  openModal(`<div class="p-top"><span>📍 ${dist} km • ${x.c} → ${$("citySelect").value} • ${t.totalKg.toLocaleString('pt-BR')} kg</span><span>${x.cat}</span></div>
  <h2>${x.t}</h2><p style="color:var(--mut)">${x.v} • ${x.cond} • ${x.d}</p>
  <span class="nfe">✓ Vendedora com CNPJ + NF-e obrigatória (venda sem NF-e é cancelada)</span>
  <div class="fees"><div><span>Preço peça</span><span>${BRL(x.p)}</span></div><div><span>Mercado (novo)</span><span>${BRL(x.m)}</span></div><div><span>Taxa cooperativa 30%</span><span>${BRL(t.taxa)}</span></div><div><span>Frete (${t.pf.label} + ${dist}km)</span><span>${BRL(t.frete)}</span></div><div><span>Seguro 1,2%</span><span>${BRL2(t.seguro)}</span></div>${dist<=30?`<div><span>Desconto local -40%</span><span>-${BRL(t.desc)}</span></div>`:''}<div><span><b style="color:#fff">Total com entrega</b></span><b style="color:var(--green)">${BRL(t.total)}</b></div>${dist<=50?`<div><span><b style="color:#fff">🟢 Com retirada própria</b></span><b style="color:var(--green)">${BRL(tp.total)} (frete R$0)</b></div>`:''}</div>
  <p style="font-size:13px;color:var(--mut)">Quanto mais pesado, mais caro: este lote tem ${t.totalKg.toLocaleString('pt-BR')} kg (${t.pf.label}). Filtre por anúncios próximos para zerar o frete. Pagamento escrow liberado após recebimento + XML da NF-e.</p>
  <div class="form"><div class="frow"><input id="offer" type="number" placeholder="Sua proposta R$" value="${Math.round(dist<=50?tp.total:t.total)}"><select id="ship"><option value="pickup" ${dist<=50?'selected':''}>Retirada própria ${dist<=50?'(R$0)':'(só até 50km)'}</option><option value="coop" ${dist>50?'selected':''}>Coleta COOPDIG (por peso)</option></select></div>
  <button class="btn primary" onclick="closeAll();alert('${reserve?'Reserva feita':'Proposta enviada'}! ${USER?'Empresa: '+USER.name:'Faça login com CNPJ para concluir.'} Vendedora responde em 24h.')">${reserve?'♻ Reservar lote':'Enviar proposta'}</button>
  <button class="btn ghost" onclick="closeAll()">Fechar</button></div>`);
}
function publish(){
  if(!USER){closeAll();goLogin();return;}
  if(!$("fNfeOk").checked){alert('⚠️ É obrigatório confirmar a emissão de NF-e. Sem NF-e a venda é cancelada (CTN + Termo COOPDIG).');return;}
  const t=$("fTitle").value||"Lote sem título";const p=+($("fPrice").value||1000);const m=+($("fMarket").value||p*1.7);const kgU=+($("fWeight").value||50);
  DB.unshift({v:USER.name,c:$("fCity").value,t,cat:$("fCat").value,p,m,q:+($("fQty").value||1),cond:$("fCond").value,kg:kgU,d:$("fDesc").value||"Anúncio B2B com NF-e.",nfe:true,sales:0,nfeRef:$("fNfe").value});
  closeAll();render();renderRank();alert("Anúncio publicado com selo NF-e! Ele já conta para o seu ranking.");
}
function simUpdate(){
  const km=+$("rngKm").value,kg=+$("rngKg").value;const pick=$("rngPickup").checked;
  $("kmOut").textContent=km;$("kgOut").textContent=kg;
  const pf=pesoFee(kg);let frete=45+km*3.2+pf.v;let desc=0;
  if(pick&&km<=50)frete=0;else if(km<=30){desc=frete*0.4;frete-=desc;}
  const seg=4800*0.012;
  $("rFrete").textContent=BRL(45+km*3.2);$("rPeso").textContent=pf.label+' • '+BRL(pf.v);$("rSeg").textContent=BRL2(seg);
  $("rDesc").textContent=desc?'-'+BRL(desc):'—';
  $("rTotal").textContent=pick&&km<=50?'R$ 0 (retirada)':BRL(frete+seg);
  $("rCo2").textContent=Math.round(kg*0.004*km/10)+" kg";
}
init();
