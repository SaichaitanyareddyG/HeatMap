import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const Heatmap = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawings

    const margin = { top: 30, right: 30, bottom: 40, left: 130 }; // Adjusted left margin for space between labels
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom; // Adjusted height for better spacing

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.id)) // User IDs
      .range([0, width])
      .padding(0.1); // Added padding between blocks

    const y = d3
      .scaleBand()
      .domain(['Dummy', 'Experience', ...Object.keys(data[0].skills)]) // Added "Dummy" above "Experience"
      .range([0, height])
      .padding(0.3); // Add more padding between rows

    // Define the skill color scale with updated colors
    const skillColorScale = d3
      .scaleOrdinal()
      .domain([0, 1, 2, 3, 4])
      .range(['#FFFFFF', '#F8F8A7', '#a6d96a', '#1A9641', '#003F0B']); // White, Light Yellow, Light Green, Dark Green, Very Dark Green

    // Define the experience color
    const experienceColor = '#E7F3EC'; // Light blue-green for experience

    // Define the radio button color
    const radioColor = '#D9D9D9'; // Light gray color for radio buttons

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create heatmap cells for each user (including experience)
    g.selectAll('.user')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${x(d.id)}, 0)`) // Move group according to user id
      .each(function (userData) {
        const userGroup = d3.select(this);

        // Create dummy radio-button-like row
        userGroup
          .append('circle')
          .attr('class', 'dummy-circle')
          .attr('cx', x.bandwidth() / 2) // Center the circle horizontally
          .attr('cy', y('Dummy') + y.bandwidth() / 2) // Center the circle vertically
          .attr('r', 10) // Increased circle size
          .attr('fill', radioColor) // Gray color for dummy buttons
          .attr('stroke', '#000') // Border for dummy circles
          .attr('stroke-width', 1);

        // Create experience cell
        userGroup
          .append('rect')
          .attr('class', 'cell experience-cell')
          .attr('x', 0)
          .attr('y', y('Experience'))
          .attr('width', x.bandwidth())
          .attr('height', y.bandwidth())
          .attr('fill', experienceColor) // Use light blue-green for experience
          .attr('stroke', '#000') // Add border to experience cell
          .attr('stroke-width', 1)
          .append('title') // Tooltip for experience
          .text(`Experience: ${userData.experience} years`);

        // Create skill cells
        userGroup
          .selectAll('.skill-cell')
          .data(Object.entries(userData.skills))
          .enter()
          .append('rect') // Keep the rectangles for the skills
          .attr('class', 'cell skill-cell')
          .attr('x', 0)
          .attr('y', (d) => y(d[0])) // y based on the skill name
          .attr('width', x.bandwidth())
          .attr('height', y.bandwidth())
          .attr('fill', (d) => skillColorScale(d[1])) // Skill score to updated color scheme
          .attr('stroke', '#000') // Add border to skill cells
          .attr('stroke-width', 1)
          .append('title') // Tooltip for each skill cell
          .text((d) => `${d[0]}: ${d[1]}`);
      });

    // Create bold Y-axis labels with space
    g.append('g')
      .call(d3.axisLeft(y).tickSize(0)) // Remove tick lines on Y-axis
      .call(
        (g) =>
          g
            .selectAll('text')
            .style('font-weight', 'bold') // Bold labels
            .style('font-size', '14px') // Fix label size
            .style('text-anchor', 'end') // Align labels to the end (right)
            .attr('x', -10) // Add space between labels and blocks
      )
      .call((g) => g.select('.domain').remove()); // Remove the Y-axis line

    // Remove X-axis labels and lines
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .call((g) => g.selectAll('text').remove()) // Remove X-axis labels
      .call((g) => g.select('.domain').remove()); // Remove X-axis line
  }, [data]);

  return <svg ref={svgRef} width={800} height={500}></svg>; // Adjusted height
};
