'use strict';
document.getElementById('plain-projects').innerHTML = portfolioProjects.map(project =>
  '<article id="' + project.id + '"><h3>' + project.name + '</h3><p>' + project.desc +
  '</p><p>' + project.details + '</p><p>' + projectLinks(project) + '</p></article>'
).join('');
