const DATA_URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const width = 1000;
const height = 600;
const padding = 60;

// Fetch the data
fetch(DATA_URL)
  .then(response => response.json())
  .then(data => {
    const baseTemp = data.baseTemperature;
    const dataset = data.monthlyVariance;

    const xScale = d3.scaleBand()
      .domain(dataset.map(d => d.year))
      .range([padding, width - padding]);

    const yScale = d3.scaleBand()
      .domain(d3.range(1, 13))
      .range([padding, height - padding]);

    const colorScale = d3.scaleSequential()
      .domain(d3.extent(dataset, d => baseTemp + d.variance))
      .interpolator(d3.interpolateInferno);

    const svg = d3.select("#chart");

    // X-Axis
    const xAxis = d3.axisBottom(xScale).tickValues(
      xScale.domain().filter(year => year % 10 === 0)
    );
    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - padding})`)
      .call(xAxis);

    // Y-Axis
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(month => d3.timeFormat("%B")(new Date(0, month - 1)));
    svg.append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis);

    // Tooltip
    const tooltip = d3.select("#tooltip");

    // Add cells
    svg.selectAll(".cell")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(baseTemp + d.variance))
      .attr("data-month", d => d.month - 1)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => baseTemp + d.variance)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          Year: ${d.year}<br>
          Month: ${d3.timeFormat("%B")(new Date(0, d.month - 1))}<br>
          Temp: ${(baseTemp + d.variance).toFixed(2)}℃<br>
          Variance: ${d.variance.toFixed(2)}℃
        `)
          .attr("data-year", d.year)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 25}px`);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    // Legend
    const legendColors = 10;
    const legendWidth = 300;
    const legendHeight = 20;
    const legendRectWidth = legendWidth / legendColors;

    const legendScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale).ticks(legendColors);

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - padding + 40})`);

    legend.selectAll("rect")
      .data(d3.range(legendColors))
      .enter()
      .append("rect")
      .attr("x", d => d * legendRectWidth)
      .attr("y", 0)
      .attr("width", legendRectWidth)
      .attr("height", legendHeight)
      .attr("fill", d => colorScale(colorScale.domain()[0] + (colorScale.domain()[1] - colorScale.domain()[0]) * d / legendColors));

    legend.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis);
  });
