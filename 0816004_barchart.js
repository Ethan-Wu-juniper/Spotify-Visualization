import { renderRidgeline } from './0816004_ridgeline.js';
import { getSplitdata, dropdownMenu, float_col, clearWindow } from './0816004_utils.js'

// let chart_data.bar_data;
let split_data;

const BarChart = (selection, xLabel) => {
  let data = split_data.data[chart_data.bar_data.cur_col];
  
  const height = 800;
  const width = 1500;

  const svg = selection.selectAll('.svg-plot').data([null]);
  const svgEnter = svg.enter().append('svg')
  .merge(svg)
    .attr('class', 'svg-plot')
    .attr('height', height)
    .attr('width', width);

  const margin = { top: 30, right: 150, bottom: 70, left: 240 };
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  const InnerG = svg.merge(svgEnter)
    .selectAll('.InnerPlot').data([null]);
  const InnerPlot = InnerG.enter().append('g')
    .merge(InnerG)
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('class', 'InnerPlot');

  let histogram = d3.histogram()
    .value(d => d)
    .domain([0,1])
    .thresholds(10);
  
  let hisData = histogram(data.map(d => d[xLabel]));

  const xScale = d3.scaleLinear()
    .domain([0,1])
    .range([0, innerWidth])
    .nice();

  const yScale = d3.scaleLinear()
    .domain([0,1000])
    .range([innerHeight, 0])
    .nice();

  

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
  const xAxisG = InnerG.merge(InnerPlot)
    .selectAll(".x-axis").data([null]);
  xAxisG.enter().append('g')
  .merge(xAxisG)
    .attr('class', 'x-axis')
    .call(xAxis)
    .call(lineConfig)
    .attr('transform', `translate(0, ${innerHeight})`)
    .attr('clip-path', null);

  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(15);
  const yAxisG = InnerG.merge(InnerPlot)
    .selectAll(".y-axis").data([null]);
  const yAxisEl = yAxisG.enter().append('g')
  .merge(yAxisG)
    .attr('class', 'y-axis')
    .call(yAxis)
    .call(lineConfig);

  const yLabelText = yAxisEl
    .selectAll('.axis-label').data([null]);
  yLabelText.enter().append('text')
  .merge(yLabelText)
    .attr('class', 'axis-label')
    .attr('text-anchor', 'middle')
    .attr('fill', 'black')
    .attr('transform', `rotate(-90)`)
    .attr('font-size', 30)
    .attr('y', -70)
    .attr('x', -innerHeight / 2)
    .text('Count');

  const show_amount = (info, mouseX, mouseY) => {
    const InfoG = InnerG.merge(InnerPlot)
      .selectAll('#info-rect').data([null])
    const InfoEnter = InfoG.enter().append('g')
      .merge(InfoG)
      .attr('id', 'info-rect')
      .attr('transform', `translate(0, 0)`);

    const rect_size = {x: mouseX, y: mouseY-60, width: 100, height: 50}
    const InfoRect = InfoEnter.merge(InfoG)
      .selectAll('rect').data([null]);
    InfoRect.enter().append('rect')
      .merge(InfoRect)
      .attr('x', rect_size.x)
      .attr('y', rect_size.y)
      .attr('width', rect_size.width)
      .attr('height', rect_size.height)
      .attr('stroke-width', 2)
      .attr('opacity', 0.5);
    const InfoText = InfoEnter.merge(InfoG)
      .selectAll('text').data([null]);
    InfoText.enter().append('text')
      .merge(InfoText)
      .attr('x', rect_size.x + rect_size.width/2)
      .attr('y', rect_size.y + rect_size.height/2)
      .attr('font-size', 30)
      .style("text-anchor", "middle")
      .style("alignment-baseline", "central")
      .style('fill', 'white')
      .text(info);
  }

  const DataBar = InnerG.merge(InnerPlot)
    .selectAll('rect').data(hisData);
  DataBar
    .enter().append('rect')
    .attr('x', d => xScale(d.x0) + 10)
    .attr('y', d => yScale(0))
    .attr('width', innerWidth / 10 - 20)
    .attr('height',0)
    .on('mousemove', d => {
      let mouse = d3.pointer(event);
      let mouseX = mouse[0];
      let mouseY = mouse[1];
      show_amount(d.target.__data__.length, mouseX, mouseY);
    })
    .on('mouseout', () => d3.selectAll('#info-rect').remove())
  .merge(DataBar)
  .transition().duration(500)
    .attr('x', d => xScale(d.x0) + 10)
    .attr('y', d => yScale(d.length))
    .attr('width', innerWidth / 10 - 20)
    .attr('height', d => yScale(1000-d.length))
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', 'blue');
}

export const ReleaseBarChart = () => {
  let ridge_data = {
    selection: chart_data.bar_data.selection,
    data: chart_data.bar_data.data,
    split_col: chart_data.bar_data.split_col,
    Label: chart_data.bar_data.cur_col,
  }
  clearWindow();
  renderRidgeline(ridge_data);
}

const LabelSelector = (selection) => {
  const menus = selection.selectAll('#menus').data([null]);
  const menuDiv = menus.enter().append('div')
    .attr('id', 'menus');
  menuDiv.append('label')
    .text(`on ${chart_data.bar_data.split_col} - ${chart_data.bar_data.cur_col} : `)
  const xmenu = menuDiv.append('span')
    .attr('id', 'x-menu');
  menuDiv.append('button')
    .attr('class', 'btn btn-secondary')
    .attr('id', 'release')
    .attr('onclick', 'module.ReleaseBarChart()')
    .attr('style', 'position: relative; left: 20px; top: -2px; font-size: 1.5rem;')
    .text('Release');
}

const onColumnClicked = column => {
  chart_data.bar_data.Label = column;
  renderBarChart(chart_data.bar_data);
};


export const renderBarChart = (props) => {
  const {
    selection,
    data,
    split_col,
    cur_col,
    Label
  } = props;

  if(chart_data.bar_data != props) {
    chart_data.bar_data = props;
    split_data = getSplitdata(data, split_col);
  }

  BarChart(selection, Label);
  LabelSelector(selection);

  d3.select('#x-menu')
    .call(dropdownMenu, {
      options: data.columns.slice(1)
        .filter(d => {
          return float_col.includes(d);
        }),
      onOptionClicked: onColumnClicked,
      selectedOption: Label
    });

  // MenuConfig();
}