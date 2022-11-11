import { getSplitdata, nonNumeric_col } from './utils.js'

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
  console.log(LabelCount);
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

  // const xLabelText = xAxisGEnter.append('text')
  // .merge(xAxisG.select('.axis-label'))
  //   .attr('class', 'axis-label')
  //   .attr('text-anchor', 'middle')
  //   .attr('fill', 'black')
  //   .attr('font-size', 30)
  //   .attr('y', 60)
  //   .attr('x', innerWidth / 2)
  //   .text(xLabel);

  const yLabelText = yAxisGEnter.append('text')
  .merge(yAxisG.select('.axis-label'))
    .attr('class', 'axis-label')
    .attr('text-anchor', 'middle')
    .attr('fill', 'black')
    .attr('transform', `rotate(-90)`)
    .attr('font-size', 30)
    .attr('y', -70)
    .attr('x', -innerHeight / 2)
    .text('Count');

  const line = d3.line()
    .x(d => xScale(d[0]))
    .y(d => yScale(d[1]));

  console.log(line(LabelCount));
  const DataLine = InnerG.merge(InnerPlot)
    .selectAll('path').data([LabelCount]);
  DataLine.enter().append('path')
  .merge(DataLine)
    .attr('d', d => line(d))
    .attr('stroke', 'blue')
    .attr('stroke-width', 3)
    .attr('fill', 'none');
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

const dropdownMenu = (selection, props) => {
  const {
    options,
    onOptionClicked,
    selectedOption
  } = props;
  
  let select = selection.selectAll('select').data([null]);
  select = select.enter().append('select')
    .merge(select)
      .on('change', function() {
        onOptionClicked(this.value);
      });
  
  let numericOptions = options.slice(1)
      .filter(d => {
        return !nonNumeric_col.includes(d);
      })
  const option = select.selectAll('option').data(numericOptions);
  option.enter().append('option')
    .merge(option)
      .attr('value', d => d)
      .property('selected', d => d === selectedOption)
      .text(d => d);
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
      options: data.columns,
      onOptionClicked: onColumnClicked,
      selectedOption: Label
    });

  MenuConfig();
}