import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { IGroupedData } from "./types";
import React = require("react");
import { PANEL_WIDTH, tooltipStyle } from "./styles";

interface Props {
  data: IGroupedData[];
}

function sum(values: number[]) {
  return values.reduce((prev, value) => prev + value, 0);
}

export function StackedBarChart({ data }: Props) {
  const axisBottomRef = useRef<SVGGElement>(null);
  const axisLeftRef = useRef<SVGGElement>(null);

  const header = "label,value1,value2";
  const body = data
    .map(({ label, values }) => [label, ...values].join(","))
    .join("\n");
  const csv = d3.csvParse([header, body].join("\n"));

  const margin = { top: 0, right: 0, bottom: 1, left: 0 };
  const width = PANEL_WIDTH - margin.left - margin.right;
  const height = 35 - margin.top - margin.bottom;

  const subgroups = header.split(",");
  const labels = csv.map((data) => data.label || "");
  const max = Math.max(
    ...csv.map((data) =>
      sum([data.value1, data.value2].map(Number))
    )
  );

  const scaleX = d3.scaleBand().domain(labels).range([0, width]).padding(0.3);
  const scaleY = d3.scaleLinear().domain([0, max]).range([height, 0]);
  const color = d3
    .scaleOrdinal<string>()
    .domain(subgroups)
    .range(["#A0A0A0", "#E37933"]);
  const stacked = d3.stack().keys(subgroups)(csv as Iterable<{ [key: string]: number; }>);

  useEffect(() => {
    if (axisBottomRef.current) {
      d3.select(axisBottomRef.current).call(d3.axisBottom(scaleX));
    }

    if (axisLeftRef.current) {
      d3.select(axisLeftRef.current).call(d3.axisLeft(scaleY));
    }
  }, [scaleX, scaleY]);

  const TOOLTIP_ID = 'chart-tooltip';

  const handleMouseEnter = (label: string, value1: number, value2: number) => {
    const autoCompleted = Number(value1);
    const handwritten = Number(value2);
    const tooltip = document.createElement('div');
    Object.assign(tooltip.style, tooltipStyle);
    tooltip.id = TOOLTIP_ID;
    tooltip.innerHTML = `
      <div style="text-decoration: underline; padding-bottom: 5px">${label}</div>
      <div>Handwritten:</div>
      <li>${handwritten} chars (${((handwritten) / (autoCompleted + handwritten) * 100).toFixed(0)}%)</li>
      <div>Auto-completed:</div>
      <li>${autoCompleted} chars (${((autoCompleted) / (autoCompleted + handwritten) * 100).toFixed(0)}%)</li>
    `;
    document.body.appendChild(tooltip);
  };

  const handleMouseLeave = () => {
    const tooltip = document.getElementById(TOOLTIP_ID);
    if (tooltip) {
      tooltip.remove();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    const tooltip = document.getElementById(TOOLTIP_ID);
    if (tooltip) {
      const tooltipWidth = tooltip.offsetWidth;
      const windowWidth = window.innerWidth;
      const cursorX = e.clientX;
      const padding = 10;
      const wouldOverflowRight = cursorX + tooltipWidth + padding > windowWidth;
      const wouldOverflowLeft = cursorX - tooltipWidth - padding < 0;

      if (wouldOverflowRight) {
        tooltip.style.left = `${cursorX - tooltipWidth - padding}px`;
      } else if (wouldOverflowLeft) {
        tooltip.style.left = `${cursorX + padding}px`;
      } else {
        tooltip.style.left = `${cursorX + padding}px`;
      }
      tooltip.style.top = `${e.clientY - padding}px`;
    }
  };

  return (
    <svg
      width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <g ref={axisBottomRef} transform={`translate(0, ${height})`} />
        <g ref={axisLeftRef} />
        {stacked.map((data, index) => {
          return (
            <g key={`group-${index}`} fill={color(data.key)}>
              {data.map((d, index) => {
                const label = String(d.data.label);
                const y0 = scaleY(d[0]);
                const y1 = scaleY(d[1]);

                return (
                  <rect
                    key={`rect-${index}`}
                    x={scaleX(label)}
                    y={y1}
                    width={scaleX.bandwidth()}
                    height={y0 - y1 || 0}
                    onMouseEnter={() => handleMouseEnter(label, d.data.value1, d.data.value2)}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                  />
                );
              })}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
