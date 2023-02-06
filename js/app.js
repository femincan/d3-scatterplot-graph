const tooltipContainer = document.getElementById('tooltip-container');
const tooltipWidth = 220;
const tooltipHeight = 110;
const tooltipDistanceConsonant = 20;
const tooltipDistanceRight = tooltipDistanceConsonant;
const tooltipDistanceLeft = -(tooltipWidth + tooltipDistanceConsonant);
const tooltipDistanceTop = -(tooltipHeight / 2);
const pagePadding = 20;

const setHorizontalDistance = (x) => {
  const { width: clientWidth } = document.body.getBoundingClientRect();

  if (x + tooltipDistanceRight + tooltipWidth + pagePadding > clientWidth) {
    return tooltipDistanceLeft;
  }

  return tooltipDistanceRight;
};

const formatTooltipText = (name, nationality, year, time, doping) =>
  `${name}: ${nationality}<br />Year: ${year}, Time: ${time}${
    doping && '<br /><br />' + doping
  }`;

const drawTooltip = (event, data) => {
  const { clientX, clientY } = event;
  const distance = setHorizontalDistance(clientX);

  const tooltip = d3
    .create('div')
    .attr('id', 'tooltip')
    .attr('data-year', event.srcElement.dataset.xvalue)
    .style('top', `${clientY + tooltipDistanceTop}px`)
    .style('left', `${clientX + distance}px`)
    .join('p')
    .html(
      formatTooltipText(
        data.Name,
        data.Nationality,
        data.Year,
        data.Time,
        data.Doping
      )
    );

  tooltipContainer.appendChild(tooltip.node());
};

const updateTooltipLocation = (event) => {
  d3.select('#tooltip').style('top', `${event.clientY + tooltipDistanceTop}px`);
};

const removeTooltip = () => {
  tooltipContainer.innerHTML = '';
};

const drawChart = async () => {
  const dataset = await d3.json(
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
  );

  const svgContainer = document.getElementById('svg-container');

  const { height: HEIGHT, width: WIDTH } = svgContainer.getBoundingClientRect();
  const TOP_PADDING = 30;
  const BOTTOM_PADDING = 50;
  const LEFT_PADDING = 95;
  const RIGHT_PADDING = 40;

  const svg = d3.create('svg').attr('width', WIDTH).attr('height', HEIGHT);

  const categories = [
    { label: 'Riders with doping allegations', class: 'fill-orange' },
    { label: 'No doping allegations', class: 'fill-blue' },
  ];

  const years = dataset.map((data) => new Date(data.Year.toString()));
  const [minYear, maxYear] = d3.extent(years);
  minYear.setFullYear(minYear.getFullYear() - 1);
  maxYear.setFullYear(maxYear.getFullYear() + 1);

  const parseTime = (time) => new Date(`2023-01-01T23:${time}`);
  const times = dataset.map((data) => parseTime(data.Time));
  const [minTime, maxTime] = d3.extent(times);
  minTime.setSeconds(minTime.getSeconds() - 5);
  maxTime.setSeconds(maxTime.getSeconds() + 5);

  const xScale = d3
    .scaleTime()
    .domain([minYear, maxYear])
    .range([LEFT_PADDING, WIDTH - RIGHT_PADDING]);
  const yScale = d3
    .scaleTime()
    .domain([minTime, maxTime])
    .range([TOP_PADDING, HEIGHT - BOTTOM_PADDING]);

  const axisLeft = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));
  const axisBottom = d3.axisBottom(xScale);

  svg
    .selectAll('circle')
    .data(dataset)
    .join('circle')
    .attr('class', (data) =>
      data.Doping ? 'dot fill-orange' : 'dot fill-blue'
    )
    .attr('data-xvalue', (data) => new Date(data.Year.toString()))
    .attr('data-yvalue', (data) => parseTime(data.Time))
    .attr('r', 7)
    .attr('cx', (data) => xScale(new Date(data.Year.toString())))
    .attr('cy', (data) => yScale(parseTime(data.Time)))
    .on('mouseover', drawTooltip)
    .on('mousemove', updateTooltipLocation)
    .on('mouseout', removeTooltip);

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${HEIGHT - BOTTOM_PADDING})`)
    .call(axisBottom);
  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${LEFT_PADDING}, 0)`)
    .call(axisLeft);

  svg
    .append('text')
    .attr('id', 'y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -250)
    .attr('y', 30)
    .text('Time in Minutes');

  svg
    .append('g')
    .attr('id', 'legend')
    .selectAll('g')
    .data(categories)
    .join('g')
    .attr('class', 'category')
    .attr('width', 200)
    .attr('height', 50)
    .attr(
      'transform',
      (_, index) =>
        `translate(${WIDTH - RIGHT_PADDING - 10}, ${TOP_PADDING + index * 30})`
    );

  svg
    .selectAll('.category')
    .append('rect')
    .attr('x', 5)
    .attr('class', (data) => `category-rect stroke ${data.class}`);
  svg
    .selectAll('.category')
    .append('text')
    .attr('y', 14)
    .text((data) => data.label);

  svgContainer.appendChild(svg.node());
};

drawChart();
