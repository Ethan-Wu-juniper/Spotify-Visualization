import { getSplitdata, dropdownMenu, float_col } from './utils.js'

let line_data;
let split_data;

const LineChart = (selection, xLabel) => {
  let data = split_data.data[split_data.cats[0]];
  
  const width = +selection.attr('width');
  const height = +selection.attr('height');

  const margin = { top: 30, right: 20, bottom: 70, left: 100 };
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  selection.attr('transform', `translate(50, 10)`);

  const InnerG = selection.selectAll('.InnerPlot').data([null]);
  const InnerPlot = InnerG.enter().append('g')
    .merge(InnerG)
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('class', 'InnerPlot');
    

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => +d[xLabel]))
    .range([0, innerWidth])
    .nice();

  const LabelGroup = d3.group(data, d => d[xLabel]);
  let LabelCount = [];
  Array.from(LabelGroup, (key, value) => {
    LabelCount.push([+key[0], key[1].length]);
  });

  LabelCount = LabelCount.sort((a,b) => a[0] - b[0]);
  const yScale = d3.scaleLinear()
    .domain(d3.extent(LabelCount.map(d => d[1])))
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

  const line = d3.line()
    .x(d => xScale(d[0]))
    .y(d => yScale(d[1]));

  for(let label of float_col) {
    if(label != xLabel)
      InnerG.merge(InnerPlot).selectAll(`#${label}`).data([])
        .exit().remove();
  }

  const DataLine = InnerG.merge(InnerPlot)
    .selectAll(`#${xLabel}`).data([LabelCount]);
  DataLine.enter().append('path')
  .merge(DataLine)
    .attr('stroke', 'blue')
    .attr('stroke-width', 3)
  .transition().duration(1000)
    .attr('id', xLabel)
    .attr('d', d => line(d))
    .attr('stroke', 'blue')
    .attr('stroke-width', 3)
    .attr('fill', 'none')
    .attr('transform', `translate(0, 0)`)
    .attr('clip-path', null);

  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15);
  const xAxisG = InnerG.merge(InnerPlot)
    .selectAll(".x-axis").data([null]);
  xAxisG.enter().append('g')
  .merge(xAxisG)
    .attr('class', 'x-axis')
    .call(xAxis)
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(lineConfig)
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
}

const LabelSelector = (selection) => {
  const menus = selection.selectAll('#menus').data([null]);
  const menuDiv = menus.enter().append('div')
    .attr('id', 'menus');
  const xmenu = menuDiv.append('span')
    .attr('id', 'x-menu');
}

const onColumnClicked = column => {
  line_data.Label = column;
  renderLineChart(line_data);
};

const MenuConfig = () => {
  const menu = document.querySelector('#menus');
  const menuStyle = `
    font-size: 2.5em;
    position: relative; left: 650px;
  `;
  menu.style.cssText = menuStyle;

  const menuselect = document.querySelectorAll('#menus select');
  const selectStyle = `
    font-size: 2.5rem;
  `;
  menuselect.forEach(el => el.style.cssText = selectStyle);

  const option = document.querySelectorAll('#menus select option');
  const optionStyle = `
    font-size: 1rem;
  `;
  option.forEach(el => el.style.cssText = optionStyle);
}

export const renderLineChart = (props) => {
  const {
    selection,
    data,
    split_col,
    Label
  } = props;

  if(line_data != props) {
    line_data = props;
    split_data = getSplitdata(data, split_col);
  }

  LineChart(selection, Label);
  LabelSelector(selection.select(function() { return this.parentNode; }));

  d3.select('#x-menu')
    .call(dropdownMenu, {
      options: data.columns.slice(1)
        .filter(d => {
          return float_col.includes(d);
        }),
      onOptionClicked: onColumnClicked,
      selectedOption: Label
    });

  MenuConfig();
}