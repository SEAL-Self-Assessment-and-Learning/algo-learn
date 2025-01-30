import { useRef, useState, type ReactElement } from "react"
import { BsArrowsFullscreen } from "react-icons/bs"
import { RiInputField } from "react-icons/ri"
import { TbBrandGraphql } from "react-icons/tb"
import type { Graph } from "@shared/utils/graph"
import { Markdown } from "@/components/Markdown.tsx"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx"
import { Button } from "@/components/ui/button.tsx"
import { addFormField } from "@/hooks/useFormContext.ts"
import { useTheme } from "@/hooks/useTheme.ts"

type GraphElementStateType = { selected: boolean; group: null | number }

// limited by the number of colors we have. See tailwind --color-group-0,...,--color-group-7.
const maxGroups = 8

const Node = ({
  pos,
  setDragged,
  size,
  label,
  clickable,
  state,
  onClickCallback,
}: {
  pos: { x: number; y: number }
  setDragged: (() => void) | undefined
  size: number
  label?: string
  clickable: boolean
  state: GraphElementStateType
  onClickCallback: () => void
}) => {
  const nodeStyle = `${state.selected ? "cg-4" : state.group !== null ? `cg-${state.group}` : "primary"} ${clickable ? "cursor-pointer" : "group-hover:fill-accent"}`

  return (
    <g
      className="group"
      transform={`translate(${pos.x},${pos.y})`}
      onMouseDown={setDragged}
      onClick={onClickCallback}
    >
      <circle className={`fill-${nodeStyle} stroke-secondary`} r={size} strokeWidth="6" />
      {label === undefined || label === "" ? null : (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          className={`cursor-${clickable ? "pointer" : "default group-hover:fill-accent-foreground"} ${!state.selected && state.group === null ? "fill-primary-foreground" : ""} select-none`}
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
      className="select-none fill-primary"
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

function getVectorLength(x: number, y: number): number {
  return Math.sqrt(x * x + y * y)
}

function getNormalVec(u: { x: number; y: number }, v: { x: number; y: number }) {
  const orthVec = {
    x: v.y - u.y,
    y: u.x - v.x,
  }
  const orthVecLen = getVectorLength(orthVec.x, orthVec.y)
  return {
    x: orthVec.x / orthVecLen,
    y: orthVec.y / orthVecLen,
  }
}

const Edge = ({
  edgeId,
  u,
  v,
  weight,
  directed,
  clickable,
  state,
  onClickCallback,
}: {
  edgeId: string
  u: { x: number; y: number }
  v: { x: number; y: number }
  weight: number | undefined
  directed: boolean
  clickable: boolean
  state: GraphElementStateType
  onClickCallback: () => void
}) => {
  const edge = []
  const normalVec = getNormalVec(u, v)
  const center = {
    x: (u.x + v.x) / 2,
    y: (u.y + v.y) / 2,
  }

  const edgeStyle = `${state.selected ? "cg-4" : state.group !== null ? `cg-${state.group}` : "primary"}${clickable ? " cursor-pointer" : ""}`

  if (directed) {
    const curveHandle = {
      x: center.x + normalVec.x * 25,
      y: center.y + normalVec.y * 25,
    }
    const arrowDirection = {
      x: v.x - curveHandle.x,
      y: v.y - curveHandle.y,
    }
    const arrowDirectionLength = getVectorLength(arrowDirection.x, arrowDirection.y)

    const arrowDirectionUnit = {
      x: arrowDirection.x / arrowDirectionLength,
      y: arrowDirection.y / arrowDirectionLength,
    }

    edge.push(
      <path
        key={`${edgeId}-l`}
        className={`stroke-${edgeStyle}`}
        strokeWidth="6"
        fill="none"
        d={`M ${u.x} ${u.y} Q ${curveHandle.x} ${curveHandle.y}, ${v.x - 32 * arrowDirectionUnit.x} ${v.y - 32 * arrowDirectionUnit.y}`}
        onClick={onClickCallback}
      />,
      <path
        key={`${edgeId}-h`}
        transform={`translate(${v.x},${v.y}) scale(4,4) rotate(${Math.atan2(arrowDirection.y, arrowDirection.x) * (180 / Math.PI)},0,0) translate(-9.7,-1.9)`}
        d="M0,0 V4 L4,2 Z"
        className={`fill-${edgeStyle}`}
      />,
    )
  } else {
    edge.push(
      <line
        key={`${edgeId}-e`}
        className={`stroke-${edgeStyle}`}
        strokeWidth="6"
        x1={u.x}
        y1={u.y}
        x2={v.x}
        y2={v.y}
        onClick={onClickCallback}
      />,
    )
  }

  if (weight !== undefined) {
    const weightOffset = directed ? 38 : 18
    edge.push(
      <EdgeWeight
        key={`${edgeId}-w`}
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
 * @param maxWidth - The maximum width of the svg.
 * @param maxHeight - The maximum height of the svg.
 * @param graph - The graph to draw.
 */
export function DrawGraph({
  maxWidth,
  maxHeight,
  graph,
}: {
  maxWidth: number
  maxHeight: number
  graph: Graph
}): ReactElement {
  const { theme } = useTheme()

  const svgRef = useRef(null as SVGSVGElement | null)
  const coordinateScale = 60
  const nodeScale = 20

  const edgeListFlat = graph.edges
    .flat()
    .filter(graph.directed ? () => true : (e) => e.source < e.target)

  const [fieldsOpen, setFieldsOpen] = useState(false)
  const nodeInputFieldMd = "node-field#NL###"
  const edgeInputFieldMd = "edge-field#NL###"
  if (graph.inputFields) {
    if (graph.edgeClickType) {
      addFormField(nodeInputFieldMd)
    }
    if (graph.edgeClickType) {
      addFormField(edgeInputFieldMd)
    }
  }

  const [currentlyDragged, setCurrentlyDragged] = useState<null | number>(null)
  const [nodePositions, setNodePositions] = useState(
    graph.nodes.map((u) => {
      return {
        x: u.coords.x * coordinateScale,
        y: u.coords.y * coordinateScale,
      }
    }),
  )
  const [nodeStates, setNodeStates] = useState<GraphElementStateType[]>(
    graph.nodes.map((u) => {
      return {
        selected: false,
        group: u.group ?? null,
      }
    }),
  )
  const [edgeStates, setEdgeStates] = useState<GraphElementStateType[]>(
    edgeListFlat.map((e) => {
      return {
        selected: false,
        group: e.group ?? null,
      }
    }),
  )

  const edges = edgeListFlat.map((e, i) => {
    return (
      <Edge
        edgeId={`e${i}`}
        key={`e${i}`}
        u={nodePositions[e.source]}
        v={nodePositions[e.target]}
        weight={e.value}
        directed={graph.directed}
        state={edgeStates[i]}
        clickable={graph.edgeClickType !== "none"}
        onClickCallback={() => {
          if (graph.edgeClickType === "select") {
            edgeStates[i].selected = !edgeStates[i].selected
            setEdgeStates([...edgeStates])
          } else if (graph.edgeClickType === "group") {
            edgeStates[i].group =
              edgeStates[i].group === Math.min(graph.edgeGroupMax ?? maxGroups, maxGroups) - 1
                ? null
                : edgeStates[i].group === null
                  ? 0
                  : edgeStates[i].group + 1
            setEdgeStates([...edgeStates])
          }
        }}
      />
    )
  })

  const nodes = graph.nodes.map((u, i) => {
    return (
      <Node
        key={`n${i}`}
        pos={nodePositions[i]}
        setDragged={
          graph.nodeDraggable
            ? () => {
                if (currentlyDragged === null) setCurrentlyDragged(i)
              }
            : undefined
        }
        size={nodeScale}
        label={u.label ?? ""}
        clickable={graph.nodeClickType !== "none"}
        state={nodeStates[i]}
        // todo the onClickCallback is duplicate code.
        onClickCallback={() => {
          if (graph.nodeClickType === "select") {
            nodeStates[i].selected = !nodeStates[i].selected
            setEdgeStates([...nodeStates])
          } else if (graph.nodeClickType === "group") {
            nodeStates[i].group =
              nodeStates[i].group === Math.min(graph.nodeGroupMax ?? maxGroups, maxGroups) - 1
                ? null
                : nodeStates[i].group === null
                  ? 0
                  : nodeStates[i].group + 1
            setNodeStates([...nodeStates])
          }
        }}
      />
    )
  })

  const dimensions = graph.getDimensions()
  const margin = 0.7
  const viewBox = {
    x: (dimensions.minX - margin) * coordinateScale,
    y: (dimensions.minY - margin) * coordinateScale,
    width: (dimensions.width + 2 * margin) * coordinateScale,
    height: (dimensions.height + 2 * margin) * coordinateScale,
  }

  const minViewBox = { width: 100, height: 100 }
  if (viewBox.width < minViewBox.width) {
    viewBox.x -= (minViewBox.width - viewBox.width) * 0.5
    viewBox.width = minViewBox.width
  }

  if (viewBox.height < minViewBox.height) {
    viewBox.y -= (minViewBox.height - viewBox.height) * 0.5
    viewBox.height = minViewBox.height
  }

  const viewBoxAspectRatio = Math.min(maxHeight / maxWidth, viewBox.height / viewBox.width)
  return (
    <div className={`relative`}>
      <svg
        ref={svgRef}
        width={maxWidth}
        height={
          viewBox.height / viewBox.width > 1 && viewBox.height < 300
            ? viewBox.height * 0.75
            : maxWidth * viewBoxAspectRatio
        }
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="mx-auto h-auto max-w-full rounded-lg bg-secondary pb-2"
        onMouseMove={(e) => {
          if (currentlyDragged === null || svgRef.current === null) return

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
        <g>{edges}</g>
        <g>{nodes}</g>
      </svg>
      <div className="absolute -bottom-3.5 right-2 flex flex-row items-center space-x-1 rounded-lg dark:border-gray-700 dark:bg-gray-800">
        <Button
          className={`${theme === "dark" ? "text-white hover:text-black" : "text-black hover:text-white"}`}
          size="iconSm"
          variant="outline"
        >
          <BsArrowsFullscreen />
        </Button>
        {graph.inputFields && (
          <AlertDialog open={fieldsOpen} onOpenChange={setFieldsOpen}>
            <AlertDialogTrigger asChild>
              <Button
                className={`${theme === "dark" ? "text-white hover:text-black" : "text-black hover:text-white"}`}
                size="iconSm"
                variant="outline"
                onClick={() => {}}
              >
                <RiInputField />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <p className="flex items-center gap-1">
                    Graph Input <TbBrandGraphql />
                  </p>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {graph.nodeClickType !== "none" && (
                    <>
                      <b>Node selection:</b>
                      <Markdown md={`{{${nodeInputFieldMd}}}`} />
                    </>
                  )}
                  {graph.edgeClickType !== "none" && (
                    <>
                      <b>Edge selection:</b>
                      <Markdown md={`{{${edgeInputFieldMd}}}`} />
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className={`m-1`} onClick={() => setFieldsOpen(false)}>
                  Back
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
