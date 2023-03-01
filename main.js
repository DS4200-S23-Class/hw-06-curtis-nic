const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 500;
const MARGINS = { left: 50, right: 50, top: 50, bottom: 50 };

async function buildScatterPlot(
  id,
  filepath,
  title,
  x_attribute,
  y_attribute,
  renderPoint = () => 'point'
) {
  const data = await d3.csv(filepath);

  const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
  const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

  const FRAME = d3
    .select(id)
    .append('svg')
    .attr('id', 'frame')
    .attr('height', FRAME_HEIGHT)
    .attr('width', FRAME_WIDTH)
    .attr('class', 'frame');

  // find max X
  const MAX_X = d3.max(data, (d) => Number(d[x_attribute]));

  const X_SCALE = d3
    .scaleLinear() // linear scale because we have
    // linear data
    .domain([0, MAX_X]) // add some padding
    .range([0, VIS_WIDTH]);

  const MAX_Y = d3.max(data, (d) => Number(d[y_attribute]));

  const Y_SCALE = d3
    .scaleLinear() // linear scale because we have
    // linear data
    .domain([0, MAX_Y]) // add some padding
    .range([VIS_HEIGHT, 0]);

  FRAME.selectAll('points')
    .data(data)
    .enter()
    .append('circle')
    .attr('id', (d) => `(${d[x_attribute]}, ${d[y_attribute]})`)
    .attr('cx', (d) => X_SCALE(d[x_attribute]) + MARGINS.left)
    .attr('cy', (d) => Y_SCALE(d[y_attribute]) + MARGINS.top)
    .attr('r', 5)
    .attr('class', (d) => renderPoint(d))
    .attr('onclick', 'onPointClick(this)');

  FRAME.append('g') // g is a "placeholder" svg
    .attr('transform', 'translate(' + MARGINS.left + ',' + (VIS_HEIGHT + MARGINS.top) + ')')
    .call(d3.axisBottom(X_SCALE).ticks(4))
    .attr('font-size', '20px');

  FRAME.append('g')
    .attr('transform', 'translate(' + MARGINS.top + ',' + MARGINS.left + ')')
    .call(d3.axisLeft(Y_SCALE).ticks(4))
    .attr('font-size', '20px');

  FRAME.append('text')
    .attr('x', VIS_WIDTH / 2 + MARGINS.left / 2)
    .attr('y', MARGINS.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .text(title);

  FRAME.call(
    d3
      .brush()
      .extent([
        [MARGINS.left, MARGINS.bottom],
        [VIS_WIDTH + MARGINS.left, VIS_HEIGHT + MARGINS.top],
      ])
      .on('start brush', brushChart)
  );

  const myCircle1 = d3.selectAll('.eachpoint1');
  const myCircle2 = d3.selectAll('.eachpoint2');
  const myBar = d3.selectAll('.bar');

  function updateChart(event) {
    extent = event.selection;
    myCircle1.classed('selected', function (d) {
      return isBrushed(
        extent,
        X_SCALE2(d.Sepal_Width) + MARGINS.left,
        Y_SCALE2(d.Petal_Width) + MARGINS.top
      );
    });
    myCircle2.classed('selected', function (d) {
      return isBrushed(
        extent,
        X_SCALE2(d.Sepal_Width) + MARGINS.left,
        Y_SCALE2(d.Petal_Width) + MARGINS.top
      );
    });
    myBar.classed('selected', function (d) {
      return barBrushed(extent, d);
    });
  }
}

// translate SVG coordinates into grid coordinates
function getGridCoordinates(circleElement, height, scalar = 1) {
  const xCoordinate = circleElement.cx.baseVal.value / scalar;
  const yCoordinate = (height - circleElement.cy.baseVal.value) / scalar;

  return { xCoordinate, yCoordinate };
}

// add a border to a point if the point is clicked
// if the point already has a border, remove it
// update the coordinates on display
// assumes grid is a square
function onPointClick(circleElement) {
  const coordinateDisplay = document.getElementById('coordinates');

  coordinateDisplay.innerHTML = circleElement.id;

  // if border already exists remove it
  if (circleElement.classList.contains('border')) {
    circleElement.classList.remove('border');
    return;
  }

  circleElement.classList.add('border');
}

async function buildBarChart(
  id,
  filepath,
  title,
  x_attribute,
  y_attribute,
  renderBar = () => 'bar'
) {
  const dataBar = await d3.csv(filepath);

  const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
  const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

  const FRAME = d3
    .select(id)
    .append('svg')
    .attr('id', 'frame')
    .attr('height', FRAME_HEIGHT)
    .attr('width', FRAME_WIDTH)
    .attr('class', 'frame');

  const X_SCALE = d3
    .scaleBand()
    .padding(0.2)
    .domain(dataBar.map((d) => d[x_attribute])) // add some padding
    .range([0, VIS_WIDTH]);

  const MAX_Y = d3.max(dataBar, (d) => Number(d[y_attribute]));

  const Y_SCALE = d3
    .scaleLinear()
    // linear data
    .domain([0, MAX_Y]) // add some padding
    .range([VIS_HEIGHT, 0]);

  FRAME.selectAll('.bar')
    .data(dataBar)
    .enter()
    .append('rect')
    .attr('class', (d) => renderBar(d))
    .attr('id', (d) => `${d[x_attribute]}: ${d[y_attribute]}`)
    .attr('x', (d) => X_SCALE(d[x_attribute]) + MARGINS.left)
    .attr('y', (d) => Y_SCALE(d[y_attribute]) + MARGINS.top)
    .attr('width', X_SCALE.bandwidth())
    .attr('height', (d) => VIS_HEIGHT - Y_SCALE(d[y_attribute]));

  FRAME.append('g')
    .attr('transform', 'translate(' + MARGINS.left + ',' + (VIS_HEIGHT + MARGINS.top) + ')')
    .call(d3.axisBottom(X_SCALE));

  FRAME.append('g')
    .attr('transform', 'translate(' + MARGINS.top + ',' + MARGINS.left + ')')
    .call(d3.axisLeft(Y_SCALE).ticks(4));

  FRAME.append('text')
    .attr('x', VIS_WIDTH / 2 + MARGINS.left / 2)
    .attr('y', MARGINS.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .text(title);
}

// add a class to the point representing a visual distinction in the
// species of the flower
function renderSpecies(flower) {
  return flower.Species;
}

buildScatterPlot(
  '#vis1',
  'data/iris.csv',
  'Pental_Length vs Sepal_Length',
  'Petal_Length',
  'Sepal_Length',
  (d) => `point ${renderSpecies(d)}`
);
buildScatterPlot(
  '#vis2',
  'data/iris.csv',
  'Petal_Width vs Sepal_Width',
  'Petal_Width',
  'Sepal_Width',
  (d) => `point ${renderSpecies(d)}`
);
buildBarChart(
  '#vis3',
  'data/iris_count.csv',
  'Count of Species',
  'Species',
  'Count',
  renderSpecies
);
