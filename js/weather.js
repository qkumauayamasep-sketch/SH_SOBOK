(() => {
  'use strict';
  const api = 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=6';
  const status = document.querySelector('#weather-status');
  const retry = document.querySelector('#weather-retry');
  const current = document.querySelector('#current-weather');
  const weekly = document.querySelector('#weekly-weather');
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();
  document.querySelector('.current-date').textContent = `${today.getMonth()+1}월 ${today.getDate()}일 (${weekdays[today.getDay()]})`;
  const recommendations = {
    clear: [
      ['따뜻한 음료 마시기', '오늘 같은 날엔 따뜻한 음료로 몸을 녹여보세요.'],
      ['실내에서 책 읽기', '조용한 오후, 따뜻한 공간에서 책과 함께해요.'],
      ['가까운 공원 산책하기', '맑은 겨울 하늘을 보며 가볍게 걸어보세요.']
    ],
    cloudy: [
      ['카페에서 시간 보내기', '흐린 하늘 아래, 아늑한 카페에서 잠시 쉬어가요.'],
      ['실내에서 책 읽기', '차분한 날에는 따뜻한 공간에서 책장을 넘겨보세요.'],
      ['따뜻한 음식 먹기', '김이 모락모락 나는 한 끼로 몸과 마음을 채워요.']
    ],
    rain: [
      ['실내 영화 보기', '창밖 빗소리를 배경으로 좋아하는 영화를 즐겨요.'],
      ['집에서 쿠키 만들기', '달콤한 쿠키 향으로 비 오는 하루를 채워보세요.'],
      ['따뜻한 차 마시기', '따뜻한 차 한 잔과 함께 느긋한 시간을 보내요.']
    ],
    snow: [
      ['눈 구경하기', '소복이 내리는 눈을 따뜻한 창가에서 바라봐요.'],
      ['따뜻한 음료 마시기', '눈 오는 날에는 따뜻한 음료로 손끝을 녹여요.'],
      ['겨울 풍경 사진 찍기', '하얗게 달라진 풍경을 사진으로 남겨보세요.']
    ]
  };
  function weather(code) {
    if (code === 0) return {label:'맑음', group:'clear', icon:'sun', phrase:'맑은 겨울이에요.'};
    if ([1,2].includes(code)) return {label:'구름 조금', group:'clear', icon:'partly', phrase:'구름이 조금 떠 있어요.'};
    if (code === 3) return {label:'흐림', group:'cloudy', icon:'cloud', phrase:'차분한 흐린 날이에요.'};
    if ([45,48].includes(code)) return {label:'안개', group:'cloudy', icon:'fog', phrase:'안개가 머물고 있어요.'};
    if ([51,53,55,56,57].includes(code)) return {label:'이슬비', group:'rain', icon:'rain', phrase:'이슬비가 내리고 있어요.'};
    if ([61,63,65,66,67].includes(code)) return {label:'비', group:'rain', icon:'rain', phrase:'비가 내리는 날이에요.'};
    if ([71,73,75,77].includes(code)) return {label:'눈', group:'snow', icon:'snow', phrase:'눈 내리는 겨울이에요.'};
    if ([80,81,82].includes(code)) return {label:'소나기', group:'rain', icon:'rain', phrase:'소나기가 지나가요.'};
    if ([85,86].includes(code)) return {label:'눈 소나기', group:'snow', icon:'snow', phrase:'눈 소나기가 내려요.'};
    if ([95,96,99].includes(code)) return {label:'뇌우', group:'rain', icon:'storm', phrase:'천둥과 비가 오는 날이에요.'};
    return {label:'날씨 정보 없음', group:'cloudy', icon:'cloud', phrase:'오늘의 하늘을 만나보세요.'};
  }
  function icon(kind, label, large = false) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 80 80'); svg.setAttribute('role','img'); svg.setAttribute('aria-label',label);
    svg.classList.add('weather-icon');
    if (large) svg.classList.add('large-weather-icon');
    if (large && kind === 'sun') svg.classList.add('rotating-sun');
    function shape(tag, attributes) {
      const node = document.createElementNS(ns,tag);
      Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,value)); svg.append(node);
    }
    if (kind === 'sun' || kind === 'partly') {
      shape('circle',{cx:40,cy:40,r:17,fill:'#F3D27A',stroke:'#F3D27A','stroke-width':2});
      for(let i=0;i<8;i++) {
        const a = i*Math.PI/4;
        shape('path',{d:`M${40+25*Math.cos(a)} ${40+25*Math.sin(a)}L${40+34*Math.cos(a)} ${40+34*Math.sin(a)}`,stroke:'#F3D27A','stroke-width':3,'stroke-linecap':'round'});
      }
      if (kind === 'sun') return svg;
    }
    if (kind === 'snow') {
      shape('path',{d:'M40 9v62M13 24l54 32M13 56l54-32M31 15l9 8 9-8M31 65l9-8 9 8M16 35l11-4-1-12M64 45l-11 4 1 12M16 45l11 4-1 12M64 35l-11-4 1-12',fill:'none',stroke:'#68765E','stroke-width':2.5,'stroke-linecap':'round','stroke-linejoin':'round'});
      return svg;
    }
    shape('path',{d:'M20 51C5 49 8 30 22 29C23 10 51 10 55 30C74 27 78 53 60 54H22',fill:'#F7F8F6',stroke:'#68765E','stroke-width':2.5,'stroke-linecap':'round','stroke-linejoin':'round'});
    if (kind === 'rain') shape('path',{d:'M26 61l-3 8m18-8-3 8m18-8-3 8',stroke:'#68765E','stroke-width':2.5,'stroke-linecap':'round'});
    if (kind === 'fog') shape('path',{d:'M14 63h52M20 71h40',stroke:'#68765E','stroke-width':2.5,'stroke-linecap':'round'});
    if (kind === 'storm') shape('path',{d:'M42 54l-8 12h9l-5 11 17-17H44l5-6',fill:'#F3D27A',stroke:'#68765E','stroke-width':1.5});
    return svg;
  }
  const textNode = (tag, text, className) => { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; };
  function showRecommendations(group) {
    document.querySelectorAll('.recommend-grid article').forEach((card, i) => {
      const [title, description] = recommendations[group][i];
      card.querySelector('h3').textContent = title; card.querySelector('p').textContent = description;
      const button = card.querySelector('button');
      button.setAttribute('aria-label', `${title} 활동 살펴보기`);
      button.onclick = () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!expanded));
        let detail = card.querySelector('.activity-detail');
        if (expanded) { detail?.remove(); return; }
        detail = textNode('p', `${title}, 오늘의 작은 겨울 계획으로 남겨보세요.`, 'activity-detail');
        card.append(detail);
      };
      button.setAttribute('aria-expanded','false');
    });
  }
  function validate(data) {
    const c = data.current, d = data.daily;
    return c && d && [c.temperature_2m,c.relative_humidity_2m,c.weather_code].every(Number.isFinite) &&
      ['time','weather_code','temperature_2m_max','temperature_2m_min'].every(key=>Array.isArray(d[key]) && d[key].length >= 6) &&
      d.time.slice(0,6).every(date=>/^\d{4}-\d{2}-\d{2}$/.test(date)) &&
      ['weather_code','temperature_2m_max','temperature_2m_min'].every(key=>d[key].slice(0,6).every(Number.isFinite));
  }
  async function load() {
    status.hidden = false; status.textContent = '날씨를 불러오는 중이에요…'; retry.hidden = true;
    current.hidden = true; weekly.replaceChildren();
    document.querySelector('.recommendations').hidden = true;
    document.querySelector('#weather-heading').textContent = '지금, 서울의 겨울을 만나보세요.';
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(),15000);
    try {
      const response = await fetch(api,{signal:controller.signal});
      if (!response.ok) throw new Error('Weather request failed');
      const data = await response.json();
      if (!validate(data)) throw new Error('Invalid weather response');
      const c = data.current, d = data.daily, state = weather(c.weather_code);
      const heading = document.querySelector('#weather-heading');
      heading.replaceChildren(document.createTextNode('지금, 서울은'),document.createElement('br'),document.createTextNode(state.phrase));
      const main = document.createElement('div'); main.className = 'temperature-line';
      main.append(icon(state.icon,state.label,true),textNode('span',`${Math.round(c.temperature_2m)}°C`,'current-temperature'),textNode('span',state.label,'current-condition'));
      const metrics = document.createElement('div'); metrics.className = 'weather-metrics';
      metrics.append(textNode('span',`최고 ${Math.round(d.temperature_2m_max[0])}°`),textNode('span',`최저 ${Math.round(d.temperature_2m_min[0])}°`),textNode('span',`습도 ${c.relative_humidity_2m}%`));
      current.replaceChildren(main,metrics); current.hidden = false;
      d.time.slice(0,6).forEach((date,i)=>{
        const day = new Date(`${date}T12:00:00+09:00`), state = weather(d.weather_code[i]);
        const item = document.createElement('div'); item.className = 'forecast-day';
        item.append(textNode('span',`${Number(date.slice(5,7))}.${date.slice(8,10)}`,'forecast-date'),textNode('span',`(${weekdays[day.getDay()]})`,'forecast-weekday'),icon(state.icon,state.label),textNode('span',`${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°`,'forecast-temperatures'));
        weekly.append(item);
      });
      showRecommendations(state.group); document.querySelector('.recommendations').hidden = false; status.hidden = true;
    } catch {
      status.textContent = '날씨를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'; retry.hidden = false;
    } finally { clearTimeout(timer); }
  }
  retry.addEventListener('click',load);
  load();
})();
