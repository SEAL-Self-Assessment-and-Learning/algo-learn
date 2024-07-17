import { ReactElement, RefObject, useRef, useState } from "react"
import { Graph } from "@shared/utils/graph"

const Node = ({
  pos,
  setDragged,
  size,
  label,
}: {
  pos: { x: number; y: number }
  setDragged: () => void
  size: number
  label?: string
}) => {
  return (
    <g
      className="group"
      transform={`translate(${pos.x},${pos.y})`}
      onMouseDown={() => {
        setDragged()
      }}
    >
      <circle
        className="fill-primary stroke-secondary group-hover:fill-accent"
        r={size}
        strokeWidth="6"
      />
      {label === undefined || label === "" ? null : (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          className="cursor-default select-none fill-primary-foreground group-hover:fill-accent-foreground"
          fontSize="1.5em"
        >
          {label}
        </text>
      )}
    </g>
  )
}

const EdgeWeight = ({ weight, x, y }: { weight: number; x: number; y: number }) => {
  return (
    <text
      className="fill-primary"
      textAnchor="middle"
      dominantBaseline="central"
      x={x}
      y={y}
      fontSize="1.5em"
    >
      {weight}
    </text>
  )
}

function getNormalVec(u: { x: number; y: number }, v: { x: number; y: number }) {
  const orthVec = {
    x: v.y - u.y,
    y: u.x - v.x,
  }
  const orthVecLen = Math.sqrt(orthVec.x * orthVec.x + orthVec.y * orthVec.y)
  return {
    x: orthVec.x / orthVecLen,
    y: orthVec.y / orthVecLen,
  }
}

const Edge = ({
  u,
  v,
  weight,
  directed,
}: {
  u: { x: number; y: number }
  v: { x: number; y: number }
  weight: number | undefined
  directed: boolean
}) => {
  // todo add click event to switch group
  const edge = []
  const normalVec = getNormalVec(u, v)
  const center = {
    x: (u.x + v.x) / 2,
    y: (u.y + v.y) / 2,
  }

  if (directed) {
    const curveHandle = {
      x: center.x + normalVec.x * 30,
      y: center.y + normalVec.y * 30,
    }

    edge.push(
      <path
        className="stroke-primary"
        strokeWidth="4"
        fill="none"
        markerEnd="url(#edge-head)"
        d={`M ${u.x} ${u.y} Q ${curveHandle.x} ${curveHandle.y}, ${v.x} ${v.y}`}
      />,
    )
  } else {
    edge.push(<line className="stroke-primary" strokeWidth="4" x1={u.x} y1={u.y} x2={v.x} y2={v.y} />)
  }

  if (weight !== undefined) {
    const weightOffset = directed ? 38 : 18
    edge.push(
      <EdgeWeight
        weight={weight}
        x={center.x + normalVec.x * weightOffset}
        y={center.y + normalVec.y * weightOffset}
      />,
    )
  }

  return edge
}

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
  // todo support: node groups, edge groups
  const svgRef = useRef(null as SVGSVGElement | null)
  const coordinateScale = 50
  const nodeScale = 20

  const [currentlyDragged, setCurrentlyDragged] = useState(null)
  const [nodePositions, setNodePositions] = useState(
    graph.nodes.map((u) => {
      return {
        x: u.coords.x * coordinateScale,
        y: u.coords.y * coordinateScale,
      }
    }),
  )

  const edges = graph.edges
    .flat()
    .filter(graph.directed ? () => true : (e) => e.source < e.target)
    .map((e) => {
      return (
        <Edge
          key={`e${e.source}-${e.target}`}
          u={nodePositions[e.source]}
          v={nodePositions[e.target]}
          weight={e.value}
          directed={graph.directed}
        />
      )
    })

  const nodes = graph.nodes.map((u, i) => {
    return (
      <Node
        key={`n${i}`}
        pos={nodePositions[i]}
        setDragged={() => {
          if (currentlyDragged === null) setCurrentlyDragged(i)
        }}
        size={nodeScale}
        label={u.label ?? ""}
      />
    )
  })

  const dimensions = graph.getDimensions()

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`${(dimensions.minX - dimensions.width * 0.2) * coordinateScale} ${(dimensions.minY - dimensions.height * 0.2) * coordinateScale} ${dimensions.width * 1.4 * coordinateScale} ${dimensions.height * 1.4 * coordinateScale}`}
      className="mx-auto h-auto max-w-full rounded-2xl bg-secondary"
      onMouseMove={(e) => {
        if (currentlyDragged === null) return

        const pt = svgRef.current.createSVGPoint()
        pt.x = e.clientX
        pt.y = e.clientY
        // The cursor point, translated into svg coordinates
        const svgPos = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse())

        nodePositions[currentlyDragged].x = svgPos.x
        nodePositions[currentlyDragged].y = svgPos.y
        // react requires a new array here
        setNodePositions([...nodePositions])
      }}
      onMouseUp={() => {
        if (currentlyDragged !== null) setCurrentlyDragged(null)
      }}
    >
      {!graph.directed ? null : (
        <defs>
          <marker id="edge-head" orient="auto" markerWidth="4" markerHeight="4" refX="9" refY="1.5">
            <rect stroke="none" className="fill-secondary" x="1" y="0.9" width="3" height="2.2" />
            <path d="M0,0 V4 L3,2 Z" className="fill-primary" />
          </marker>
        </defs>
      )}
      <g>{edges}</g>
      <g>{nodes}</g>
    </svg>
  )
}
