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
      d3
        .forceLink(edges)
        .id((d) =>
          d.index === undefined ? "" : graph.vertices[d.index].id ?? "",
        ),
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2))

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    if (!svg.selectChildren().empty()) return

    const lines = svg
      .append("g")
      .selectAll("line")
      .data(edges)
      .join("line")
      .classed("stroke-2 stroke-primary", true)

    const circles: d3.Selection<Element, d3.SimulationNodeDatum, Element, any> =
      svg
        .append("g")
        .selectAll<Element, null>("circle")
        .data(vertices)
        .join("circle")
        .attr("r", 7)
        .classed(
          "fill-primary hover:fill-accent stroke-secondary stroke-2",
          true,
        )

    function ticked() {
      lines
        .attr("x1", (d) => d.source.x ?? 0)
        .attr("y1", (d) => d.source.y ?? 0)
        .attr("x2", (d) => d.target.x ?? 0)
        .attr("y2", (d) => d.target.y ?? 0)
      circles.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0)
    }

    type DragEvent = d3.D3DragEvent<
      Element,
      d3.SimulationNodeDatum,
      d3.SimulationNodeDatum
    >

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event: DragEvent) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event: DragEvent) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event: DragEvent) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    // Add a drag behavior.
    const drag = d3
      .drag<Element, d3.SimulationNodeDatum>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
    circles.call(drag)

    // Start the simulation.
    simulation.on("tick", ticked)
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
