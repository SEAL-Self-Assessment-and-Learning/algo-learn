import * as d3 from "d3"
import { ReactElement, useEffect, useRef } from "react"
import { Graph } from "@shared/utils/graph"

/**
 * A component that returns an SVG element representing a graph.
 * @param width - The width of the svg.
 * @param height - The height of the svg.
 * @param graph - The graph to draw.
 */
export function DrawGraph({
  width,
  height,
  graph,
}: {
  width: number
  height: number
  graph: Graph
}): ReactElement {
  const svgRef = useRef(null as SVGSVGElement | null)
  const vertices = graph.vertices as d3.SimulationNodeDatum[]
  const edges = graph.edges as Array<{
    source: d3.SimulationNodeDatum
    target: d3.SimulationNodeDatum
  }>

  const simulation = d3
    .forceSimulation(vertices)
    .force(
      "link",
      d3.forceLink(edges).id((d) => (d.index === undefined ? "" : graph.vertices[d.index].id ?? "")),
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .stop() // stop simulation immediately

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    if (!svg.selectChildren().empty()) return

    const lines = svg
      .append("g")
      .selectAll("line")
      .data(edges)
      .join("line")
      .classed("stroke-2 stroke-primary", true)

    const circles = svg
      .append("g")
      // .attr("class", "nodes")
      .selectAll("g")
      .data(vertices)
      .enter()
      .append("g")
      .classed("group", true)

    circles
      .append("circle")
      .attr("r", 14)
      .classed("fill-primary group-hover:fill-accent stroke-secondary stroke-2", true)

    circles
      .append("text")
      .text((d) => d.index?.toString() ?? "")
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .classed("fill-accent group-hover:fill-primary cursor-default", true)

    function drawGraph() {
      lines
        .attr("x1", (d) => d.source.x ?? 0)
        .attr("y1", (d) => d.source.y ?? 0)
        .attr("x2", (d) => d.target.x ?? 0)
        .attr("y2", (d) => d.target.y ?? 0)
      circles.attr("transform", (d) => `translate(${d.x},${d.y})`)
    }

    type DragEvent = d3.D3DragEvent<Element, d3.SimulationNodeDatum, d3.SimulationNodeDatum>

    // Update the subject (dragged node) position during drag.
    function dragged(event: DragEvent) {
      event.subject.x = event.x
      event.subject.y = event.y
      drawGraph()
    }

    // Add a drag behavior
    const drag = d3.drag<Element, d3.SimulationNodeDatum>().on("drag", dragged)
    circles.call(drag)

    // advance simulation 300 ticks without drawing
    simulation.tick(300)
    drawGraph()
    // remove all nodes from the simulation
    simulation.nodes([])
  }, [graph, simulation, edges, vertices, width, height])
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto max-w-full rounded-2xl bg-secondary"
    />
  )
}
