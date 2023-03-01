const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 500;
const MARGINS = { left: 50, right: 50, top: 50, bottom: 50 };
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

async function buildScatterPlot(
  id,
  filepath,
  title,
  x_attribute,
  y_attribute,
  renderPoint = () => 'point',
  renderId = () => 'point',
  showBrush = false
) {
  const data = await d3.csv(filepath);

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

  const points = FRAME.append('g')
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('id', (d) => (renderId ? renderId(d) : `(${d[x_attribute]}, ${d[y_attribute]})`))
    .attr('cx', (d) => X_SCALE(d[x_attribute]) + MARGINS.left)
    .attr('cy', (d) => Y_SCALE(d[y_attribute]) + MARGINS.top)
    .attr('r', 5)
    .attr('class', (d) => renderPoint(d));

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

  if (showBrush) {
    FRAME.call(
      d3
        .brush() // Add the brush feature using the d3.brush function
        .extent([
          [0, 0],
          [FRAME_WIDTH, FRAME_HEIGHT],
        ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on('start brush', updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
    );

    // Function that is triggered when brushing is performed
    function updateChart(event) {
      const extent = event.selection;

      const circles = d3.selectAll('circle');

      circles.classed('selected', function (d) {
        return isBrushed(extent, X_SCALE(d[x_attribute]), Y_SCALE(d[y_attribute]));
      });
    }

    // A function that return TRUE or FALSE according if a dot is in the selection or not
    function isBrushed(brush_coords, cx, cy) {
      const x0 = brush_coords[0][0] - MARGINS.left,
        x1 = brush_coords[1][0] - MARGINS.top,
        y0 = brush_coords[0][1] - MARGINS.left,
        y1 = brush_coords[1][1] - MARGINS.top;
      return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This return TRUE or FALSE depending on if the points is in the selected area
    }
  }
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
    .attr('id', 'bar')
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
  (d) => `point ${renderSpecies(d)}`,
  (d) => d.id
);
buildScatterPlot(
  '#vis2',
  'data/iris.csv',
  'Petal_Width vs Sepal_Width',
  'Petal_Width',
  'Sepal_Width',
  (d) => `point ${renderSpecies(d)}`,
  (d) => d.id,
  true
);
buildBarChart(
  '#vis3',
  'data/iris_count.csv',
  'Count of Species',
  'Species',
  'Count',
  renderSpecies
);
