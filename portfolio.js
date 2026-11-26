'use strict';

const portfolioProjects = [
  {
    id: 'campusgpt', name: 'CampusGPT', mark: 'AI', color: '#4b42a5',
    desc: 'An AI chat app for students with Google sign-in.',
    tags: ['TypeScript', 'Google sign-in', 'Hosted AI'],
    repo: 'https://github.com/keshavjangid0229-source/campusgpt-google',
    demo: 'https://campusgpt-web.vercel.app',
    details: 'The project connects a student-facing chat interface to a hosted AI service. Google sign-in gives users a familiar way to access the app.',
    tryIt: 'Open the live app to see the sign-in flow, or read the source to explore the integration.'
  },
  {
    id: 'bike', name: '3D Interactive Bike Model', mark: '3D', color: '#a84422',
    desc: 'An interactive bike model that you can rotate and inspect in your browser.',
    tags: ['JavaScript', 'Web 3D'],
    repo: 'https://github.com/keshavjangid0229-source/3d-intractive-bike-model',
    demo: 'https://3d-intractive-bike-model.vercel.app',
    details: 'This project explores presenting a product from multiple angles with an interactive 3D scene.',
    tryIt: 'Open the demo and rotate or zoom the model to inspect its details.'
  },
  {
    id: 'desktop', name: 'KeshavOS', mark: 'K', color: '#345a86',
    desc: 'A portfolio that opens projects and tools in an interactive desktop.',
    tags: ['JavaScript', 'CSS', 'React widgets'],
    repo: 'https://github.com/keshavjangid0229-source/keshavos-site',
    demo: '/',
    details: 'KeshavOS brings projects, notes, a terminal, and desktop settings into one browser workspace. On phones, the same apps open in a touch-friendly view.',
    tryIt: 'Search for an app or project, open a window, and change the desktop wallpaper in Settings.'
  }
];

function projectLinks(project) {
  return '<a href="' + project.repo + '" target="_blank" rel="noopener">Source code</a>' +
    ' <a href="' + project.demo + '">Live demo</a>';
}
