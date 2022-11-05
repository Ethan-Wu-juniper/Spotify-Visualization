export const ScatterPlot = (selection, data, xLabel, yLabel) => {
  console.log(xLabel, yLabel);
  const width = +selection.attr('width');
  const height = +selection.attr('height');

  const margin = { top: 30, right: 20, bottom: 170, left: 100 };
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  selection.attr('transform', `translate(50, 10)`);

  const InnerG = selection.selectAll('.InnerPlot').data([null]);
  const InnerPlot = InnerG.enter().append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'InnerPlot');
    

  const Scale = (column, axis) => d3.scaleLinear()
    .domain(d3.extent(data, d => d[column]))
    .range(axis==="x"?[0, innerWidth]:[innerHeight, 0])
    .nice();
  const xScale = Scale(xLabel, "x");
  const yScale = Scale(yLabel, "y");

  const lineConfig = AxisG => {
    AxisG.selectAll('.domain').remove();
    AxisG.selectAll('line')
      .attr("opacity", 0.5)
      .attr("stroke-width", 1.6);
    AxisG.selectAll('text')
      .attr('font-size', 20);
  }

  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15);
  const xAxisG = InnerG.select('.x-axis');
  const xAxisGEnter = InnerPlot.append('g')
    .attr('class', 'x-axis');
  xAxisG.merge(xAxisGEnter)
    .call(xAxis)
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(lineConfig);

  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(15);
  const yAxisG = InnerG.select('.y-axis');
  const yAxisGEnter = InnerPlot.append('g')
    .attr('class', 'y-axis');
  yAxisG.merge(yAxisGEnter)
    .call(yAxis)
    .call(lineConfig);

  const xLabelText = xAxisGEnter.append('text')
  .merge(xAxisG.select('.axis-label'))
    .attr('class', 'axis-label')
    .attr('text-anchor', 'middle')
    .attr('fill', 'black')
    .attr('font-size', 30)
    .attr('y', 60)
    .attr('x', innerWidth / 2)
    .text(xLabel);

  const yLabelText = yAxisGEnter.append('text')
  .merge(yAxisG.select('.axis-label'))
    .attr('class', 'axis-label')
    .attr('text-anchor', 'middle')
    .attr('fill', 'black')
    .attr('transform', `rotate(-90)`)
    .attr('font-size', 30)
    .attr('y', -70)
    .attr('x', -innerHeight / 2)
    .text(yLabel);

  const DataCircle = InnerG.merge(InnerPlot)
  .selectAll('circle').data(data);
  DataCircle
    .enter().append('circle')
      .attr('opacity', 0.5)
      .attr('fill', 'blue')
      .attr('cx', d => innerWidth / 2)
      .attr('cy', d => innerHeight / 2)
      .attr('r', 1)
    .merge(DataCircle)
    .transition().duration(1000)
      .attr('cx', d => xScale(d[xLabel]))
      .attr('cy', d => yScale(d[yLabel]))
      .attr('r', 10);
}