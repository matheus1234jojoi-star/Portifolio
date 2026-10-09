const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;


const scene = document.querySelector('.scene');
let tx = 50, ty = 30, mx = 50, my = 30;
addEventListener('mousemove', e => { tx = e.clientX / innerWidth * 100; ty = e.clientY / innerHeight * 100; });

function loop() {
  mx += (tx - mx) * 0.07; my += (ty - my) * 0.07;           
  const max = document.documentElement.scrollHeight - innerHeight;
  scene.style.setProperty('--x', mx.toFixed(2));
  scene.style.setProperty('--y', my.toFixed(2));
  scene.style.setProperty('--p', (max > 0 ? scrollY / max : 0).toFixed(3));
  requestAnimationFrame(loop);
}
if (scene && !reduce) loop();


document.querySelectorAll('[data-tilt]').forEach(card => {
  const base = getComputedStyle(card).transform;
  const start = base === 'none' ? '' : base;
  card.addEventListener('mousemove', e => {
    if (reduce) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `${start} perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  card.addEventListener('mouseleave', () => (card.style.transform = ''));
});


const stack = document.querySelector('.projects');
if (stack) {
  const links = [...document.querySelectorAll('.nav ul a[href^="#"]')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href')));

  addEventListener('scroll', () => {
  
    const r = stack.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, 1 - (r.top + r.height / 2) / innerHeight));
    stack.style.setProperty('--p', p.toFixed(3));
   
    secs.forEach((s, i) => {
      const b = s.getBoundingClientRect();
      links[i].classList.toggle('on', b.top < innerHeight * 0.4 && b.bottom > innerHeight * 0.4);
    });
  }, { passive: true });

}


const form = document.getElementById('form');
if (form) {
  const nome = form.nome, tel = form.tel, email = form.email, msg = form.msg;
  const count = document.getElementById('count');
  const status = document.getElementById('status');

 
  nome.addEventListener('input', () => {
    nome.value = nome.value.replace(/[^A-Za-zÀ-ÿ'\- ]/g, '').replace(/\s{2,}/g, ' ');
  });


  tel.addEventListener('input', () => {
    let v = tel.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10)     v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    else if (v.length)     v = v.replace(/^(\d*)$/, '($1');
    tel.value = v;
  });


  email.addEventListener('input', () => {
    email.value = email.value.replace(/\s/g, '').toLowerCase();
  });


  const MAX = msg.maxLength;
  function updateCount() {
    const n = msg.value.length;
    count.textContent = `${n} / ${MAX}`;
    count.className = 'count' + (n >= MAX ? ' full' : n >= MAX * 0.9 ? ' warn' : '');
  }
  msg.addEventListener('input', updateCount);

  function setErr(field, text) {
    const box = field.parentElement.querySelector('.err');
    box.textContent = text;
    field.classList.toggle('bad', !!text);
    return !text;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const okNome  = setErr(nome,  nome.value.trim().split(' ').length >= 2 ? '' : 'Digite nome e sobrenome.');
    const okTel   = setErr(tel,   tel.value.replace(/\D/g, '').length === 11 ? '' : 'Use o formato (00) 00000-0000.');
    const okEmail = setErr(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value) ? '' : 'Digite um e-mail válido.');
    const okMsg   = setErr(msg,   msg.value.trim().length >= 10 ? '' : 'Escreva pelo menos 10 caracteres.');
    if (!(okNome && okTel && okEmail && okMsg)) { status.style.color = '#ff8a8a'; status.textContent = 'Corrija os campos destacados.'; return; }


    const corpo = `Nome: ${nome.value}\nTelefone: ${tel.value}\nE-mail: ${email.value}\n\n${msg.value}`;
    location.href = `mailto:seuemail@exemplo.com?subject=${encodeURIComponent('Contato pelo portfólio')}&body=${encodeURIComponent(corpo)}`;
    status.style.color = 'var(--green)';
    status.textContent = 'Mensagem pronta! Confirme o envio no seu app de e-mail.';
    form.reset(); updateCount();
  });
}

const SKILLS = [
  { t: 'Programação', ic: '</>', items: [['C#','C#','.cs'],['Py','Python','.py'],['JS','JavaScript','.js'],['SQL','MySQL','.sql']] },
  { t: 'SO e Nuvem', ic: '⚙', items: [['Lx','Linux','.sh'],['Win','Windows','.exe']] },
  { t: 'Web e Dispositivos Móveis', ic: '◍', items: [['H5','HTML5','.html'],['C3','CSS3','.css']] },
  { t: 'Design e IA', ic: '✎', items: [['Fg','Figma','.fig'],['✳','Claude','.md'],['Ps','Photoshop','.psd']] }
];
const sk = document.getElementById('skills');
if (sk) {
  sk.innerHTML = SKILLS.map(g => {
    const n = g.items.length;
    const chips = g.items.map((it, k) =>
      `<div class="chip" style="--i:${k - (n - 1) / 2};--k:${k}"><span class="mark">${it[0]}</span><b>${it[1]}</b><code>${it[2]}</code></div>`).join('');
    return `<article class="kit" aria-label="${g.t}"><div class="fan">${chips}</div><div class="fb"></div>
      <div class="ff"><span class="fic">${g.ic}</span><strong>${g.t}</strong><small>● ${n} ferramentas</small></div></article>`;
  }).join('');
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('open')), { threshold: 0.5 });
  sk.querySelectorAll('.kit').forEach(k => { io.observe(k); k.addEventListener('click', () => k.classList.toggle('open')); });
}


document.querySelectorAll('.shot').forEach(box => {
  const fit = () => box.style.setProperty('--sc', box.clientWidth / 1280);
  fit(); addEventListener('resize', fit);
});
