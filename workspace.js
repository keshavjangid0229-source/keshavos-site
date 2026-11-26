'use strict';

function registerPortfolioApps() {
  for (const project of portfolioProjects) {
    APPS[project.id] = {
      name: project.name, title: project.name + ' — Project', tpl: 'tpl-project-detail',
      w: 660, h: 480, kind: 'Project', keywords: project.tags.join(' ') + ' ' + project.desc,
      icon: ic(project.color, txtIc(project.mark, 18))
    };
  }
  const sections = [
    ['research', 'Research', 'R', '#655799', 'BM25 retrieval search experiments'],
    ['experience', 'Experience', 'E', '#98613c', 'education learning automation robotics'],
    ['skills', 'Skills', 'S', '#39726c', 'TypeScript JavaScript Next.js Flutter Supabase'],
    ['ask', 'Ask Keshav', '?', '#36578c', 'assistant questions portfolio help']
  ];
  for (const [id, name, mark, color, keywords] of sections) {
    APPS[id] = { name, title: name, tpl: 'tpl-' + id, w: 600, h: 465, keywords,
      icon: ic(color, txtIc(mark, 20)) };
  }
}

function initPortfolioApp(id, win) {
  if (id === 'projects') {
    win.querySelector('#projGrid').innerHTML = portfolioProjects.map(project =>
      '<article class="proj"><div class="thumb" style="background:' + project.color + ';color:white">' + project.mark + '</div>' +
      '<div class="p-body"><h4>' + project.name + '</h4><p>' + project.desc +
      '</p><div class="tags">' + project.tags.map(tag => '<span>' + tag + '</span>').join('') + '</div>' +
      '<div class="p-actions"><button type="button" data-goto="' + project.id + '">Open case study</button></div></div></article>'
    ).join('');
  }
  const project = portfolioProjects.find(item => item.id === id);
  if (project) {
    win.querySelector('.project-detail').innerHTML = '<h2>' + project.name + '</h2><p>' + project.desc +
      '</p><h3>What I built</h3><p>' + project.details + '</p><h3>Try it</h3><p>' + project.tryIt +
      '</p><p><strong>Tools:</strong> ' + project.tags.join(' · ') + '</p><p>' + projectLinks(project) + '</p>';
  }
  if (id === 'ask') {
    const form = win.querySelector('form');
    const result = win.querySelector('[role="status"]');
    form.addEventListener('submit', event => {
      event.preventDefault();
      const words = form.elements.question.value.toLowerCase();
      const match = portfolioProjects.find(item => words.includes(item.name.toLowerCase()) ||
        (item.id === 'bike' && /3d|bike/.test(words)));
      if (match) result.textContent = match.name + ' — ' + match.desc + ' ' + match.tryIt;
      else if (/skills|stack|language/.test(words)) result.textContent = 'Keshav works with JavaScript, TypeScript, Next.js, Flutter and Supabase. Open Skills for more.';
      else if (/research|bm25|lab/.test(words)) result.textContent = 'Open Labs to try the interactive BM25 retrieval demo.';
      else if (/project|built|work/.test(words)) result.textContent = 'Start with CampusGPT, the interactive 3D bike, and KeshavOS. Find all three in Projects.';
      else if (/contact|github|resume/.test(words)) result.textContent = 'Use Contact, GitHub, or Resume in the desktop apps.';
      else result.textContent = 'Try asking about CampusGPT, the 3D bike, skills, Labs, or contact.';
    });
  }
}
