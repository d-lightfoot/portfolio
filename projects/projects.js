import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

let colors = d3.scaleOrdinal(d3.schemeTableau10);
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let selectedIndex = -1;

function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
  
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));
  
  let svg = d3.select('svg');
  svg.selectAll('path').remove();
  
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();
  
  newArcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        
        svg
          .selectAll('path')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''));
        
        legend
          .selectAll('li')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'selected legend-item' : 'legend-item'));
        
        if (selectedIndex === -1) {
          renderProjects(projects, projectsContainer, 'h2');
        } else {
          let selectedYear = newData[selectedIndex].label;
          let filteredByYear = projects.filter(p => p.year === selectedYear);
          renderProjects(filteredByYear, projectsContainer, 'h2');
        }
      });
  });
  
  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

renderPieChart(projects);
renderProjects(projects, projectsContainer, 'h2');

let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
  selectedIndex = -1;
});