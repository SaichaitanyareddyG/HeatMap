import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export const Heatmap = ({ data }) => {
  const svgRef = useRef();
  const [startIndex, setStartIndex] = useState(0);
  const numColumns = 10; 


  const handleLeftClick = () => {
    setStartIndex((prev) => Math.max(prev - numColumns, 0));
  };

  
  const handleRightClick = () => {
    setStartIndex((prev) =>
      Math.min(prev + numColumns, data.length - numColumns)
    );
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); 

    const margin = { top: 50, right: 30, bottom: 40, left: 200 }; 
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const displayedData = data.slice(startIndex, startIndex + numColumns); 

    const x = d3
      .scaleBand()
      .domain(displayedData.map((d) => d.id)) 
      .range([0, width])
      .padding(0.1); 

    const y = d3
      .scaleBand()
      .domain(['Experience', ...Object.keys(displayedData[0].skills)]) 
      .range([0, height])
      .padding(0.3); 

    const skillColorScale = d3
      .scaleOrdinal()
      .domain([0, 1, 2, 3, 4])
      .range(['#FFFFFF', '#F8F8A7', '#a6d96a', '#1A9641', '#003F0B']); 

    const experienceColor = '#E7F3EC';
    const radioColor = '#D9D9D9'; 

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  
    g.selectAll('.user')
      .data(displayedData)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${x(d.id)}, 0)`) 
      .each(function (userData) {
        const userGroup = d3.select(this);

        userGroup
          .append('circle')
          .attr('class', 'dummy-circle')
          .attr('cx', x.bandwidth() / 2) 
          .attr('cy', -20) 
          .attr('r', 10) 
          .attr('fill', radioColor) 
          .attr('stroke', '#000') 
          .attr('stroke-width', 1);

        userGroup
          .append('text')
          .attr('x', x.bandwidth() / 2) 
          .attr('y', -30) 
          .attr('text-anchor', 'middle')
          .style('font-size', '10px') 
          .style('fill', '#000') 
          .text('A.B'); 

        userGroup
          .append('rect')
          .attr('class', 'cell experience-cell')
          .attr('x', 0)
          .attr('y', y('Experience'))
          .attr('width', x.bandwidth())
          .attr('height', y.bandwidth())
          .attr('fill', experienceColor) 
          .attr('stroke', '#000') 
          .attr('stroke-width', 1)
          .append('title') 
          .text(`Experience: ${userData.experience} years`);

        userGroup
          .append('text')
          .attr('x', x.bandwidth() / 2) 
          .attr('y', y('Experience') + y.bandwidth() / 2) 
          .attr('dy', '0.35em') 
          .attr('text-anchor', 'middle') 
          .style('font-size', '10px') 
          .style('fill', '#000') 
          .text(userData.experience); 

        userGroup
          .selectAll('.skill-cell')
          .data(Object.entries(userData.skills))
          .enter()
          .append('rect') 
          .attr('class', 'cell skill-cell')
          .attr('x', 0)
          .attr('y', (d) => y(d[0])) 
          .attr('width', x.bandwidth())
          .attr('height', y.bandwidth())
          .attr('fill', (d) => skillColorScale(d[1])) 
          .attr('stroke', '#000') 
          .attr('stroke-width', 1)
          .append('title') 
          .text((d) => `${d[0]}: ${d[1]}`);
      });

    g.append('g')
      .call(d3.axisLeft(y).tickSize(0)) 
      .call(
        (g) =>
          g
            .selectAll('text')
            .style('font-weight', 'bold') 
            .style('font-size', '12px') 
            .style('text-anchor', 'start') 
            .attr('x', -180) 
      )
      .call((g) => g.select('.domain').remove()); 

   
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .call((g) => g.selectAll('text').remove()) 
      .call((g) => g.select('.domain').remove()); 
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
    </div>
  );
};
