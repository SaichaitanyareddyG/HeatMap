import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export const Heatmap = ({ data }) => {
  const svgRef = useRef();
  const [startIndex, setStartIndex] = useState(0);
  const numColumns = 10; // Number of user columns to display at a time

  // Function to navigate left
  const handleLeftClick = () => {
    setStartIndex((prev) => Math.max(prev - numColumns, 0));
  };

  // Function to navigate right
  const handleRightClick = () => {
    setStartIndex((prev) =>
      Math.min(prev + numColumns, data.length - numColumns)
    );
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawings

    const margin = { top: 50, right: 30, bottom: 40, left: 200 }; // Adjust left margin
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const displayedData = data.slice(startIndex, startIndex + numColumns); // Display only a portion of data

    const x = d3
      .scaleBand()
      .domain(displayedData.map((d) => d.id)) // User IDs
      .range([0, width])
      .padding(0.1); // Padding between blocks

    const y = d3
      .scaleBand()
      .domain(['Experience', ...Object.keys(displayedData[0].skills)]) // Skills
      .range([0, height])
      .padding(0.3); // Padding between rows

    // Define color scales
    const skillColorScale = d3
      .scaleOrdinal()
      .domain([0, 1, 2, 3, 4])
      .range(['#FFFFFF', '#F8F8A7', '#a6d96a', '#1A9641', '#003F0B']); // Skill colors

    const experienceColor = '#E7F3EC'; // Experience color
    const radioColor = '#D9D9D9'; // Radio button color

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create heatmap cells for each user
    g.selectAll('.user')
      .data(displayedData)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${x(d.id)}, 0)`) // Move group according to user id
      .each(function (userData) {
        const userGroup = d3.select(this);

        // Create dummy radio-button-like row without any label
        userGroup
          .append('circle')
          .attr('class', 'dummy-circle')
          .attr('cx', x.bandwidth() / 2) // Center the circle horizontally
          .attr('cy', -20) // Adjust the circle to be above the cells
          .attr('r', 10) // Increased circle size
          .attr('fill', radioColor) // Gray color for dummy buttons
          .attr('stroke', '#000') // Border for dummy circles
          .attr('stroke-width', 1);

        // Add "A.B" text above the radio button
        userGroup
          .append('text')
          .attr('x', x.bandwidth() / 2) // Center the text horizontally
          .attr('y', -30) // Position the text above the radio button
          .attr('text-anchor', 'middle')
          .style('font-size', '10px') // Set font size
          .style('fill', '#000') // Text color
          .text('A.B'); // Example text

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

        // Add text for experience value
        userGroup
          .append('text')
          .attr('x', x.bandwidth() / 2) // Center text horizontally
          .attr('y', y('Experience') + y.bandwidth() / 2) // Center text vertically
          .attr('dy', '0.35em') // Vertically center the text
          .attr('text-anchor', 'middle') // Center the text
          .style('font-size', '10px') // Increased text size for better visibility
          .style('fill', '#000') // Text color
          .text(userData.experience); // Display experience number

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

    // Create bold Y-axis labels with enough space for long text
    g.append('g')
      .call(d3.axisLeft(y).tickSize(0)) // Remove tick lines on Y-axis
      .call(
        (g) =>
          g
            .selectAll('text')
            .style('font-weight', 'bold') // Bold labels
            .style('font-size', '12px') // Increased label size
            .style('text-anchor', 'start') // Align text to the left
            .attr('x', -180) // Adjust label position to the left with enough space
      )
      .call((g) => g.select('.domain').remove()); // Remove the Y-axis line

    // Remove X-axis labels and lines
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .call((g) => g.selectAll('text').remove()) // Remove X-axis labels
      .call((g) => g.select('.domain').remove()); // Remove X-axis line
  }, [data, startIndex]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderBottom: '1px solid'
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'flex-end' }}>
          {`${data.length} Candidates`}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <button
            onClick={handleLeftClick}
            disabled={startIndex === 0}
            style={{
              border: '1px solid #000',
              backgroundColor: '#fff',
              borderRadius: '4px',
              padding: '5px 10px',
              marginRight: '5px',
              cursor: 'pointer',
            }}
          >
            &lt; Prev
          </button>
          <button
            onClick={handleRightClick}
            disabled={startIndex + numColumns >= data.length}
            style={{
              border: '1px solid #000',
              backgroundColor: '#fff',
              borderRadius: '4px',
              padding: '5px 10px',
              marginLeft: '5px',
              cursor: 'pointer',
            }}
          >
            Next &gt;
          </button>
        </div>
      </div>
      <svg ref={svgRef} width={900} height={500}></svg>{' '}
      {/* Adjusted width and height */}
    </div>
  );
};
