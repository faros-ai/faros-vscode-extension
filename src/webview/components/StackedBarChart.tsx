import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { IGroupedData } from "./types";
import React = require("react");
import { PANEL_WIDTH } from "./Styles";

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

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const width = PANEL_WIDTH - margin.left - margin.right;
  const height = 30 - margin.top - margin.bottom;

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
