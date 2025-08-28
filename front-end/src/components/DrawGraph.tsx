import { useEffect, useRef, useState, type ReactElement } from "react"
import { RiInputField } from "react-icons/ri"
import type { Language } from "@shared/api/Language.ts"
import { edgeInputFieldID, nodeInputFieldID, type Edge, type Graph } from "@shared/utils/graph"
import {
  checkEdgeInput,
  checkNodeInput,
  parseEdgeText,
  parseNodeText,
  updateGraphEdgeGroup,
  updateGraphEdgeSelected,
  updateGraphNodeGroup,
  updateGraphNodeSelected,
} from "@shared/utils/graphInput.ts"
import { Markdown } from "@/components/Markdown.tsx"
import { Toggle } from "@/components/ui/toggle.tsx"
import { addFormField, useFormField, type TextFieldState } from "@/hooks/useFormContext.ts"
import { useTheme } from "@/hooks/useTheme.ts"
import { useTranslation } from "@/hooks/useTranslation.ts"

export type GraphElementStateType = { selected: boolean; group: null | number }

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

  // Make the drag area 2x bigger than the visible node
  const dragAreaSize = size * 2

  return (
    <g
      className="group"
      transform={`translate(${pos.x},${pos.y})`}
      onMouseDown={setDragged}
      onTouchStart={(e) => {
        if (setDragged) {
          e.preventDefault()
          // e.stopPropagation()
          setDragged()
        }
      }}
      onClick={onClickCallback}
    >
      {/* Invisible larger circle for easier dragging */}
      <circle
        r={dragAreaSize}
        fill="transparent"
        stroke="none"
        className={clickable ? "cursor-pointer" : ""}
      />

      {/* Visible node circle */}
      <circle className={`fill-${nodeStyle} stroke-secondary`} r={size} strokeWidth="6" />
      {label === undefined || label === "" ? null : (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          className={`cursor-${clickable ? "pointer" : "default group-hover:fill-accent-foreground"} ${!state.selected && state.group === null ? "fill-primary-foreground" : ""} pointer-events-none select-none`}
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
  const { lang, t } = useTranslation()

  const svgRef = useRef(null as SVGSVGElement | null)
  const coordinateScale = 60
  const nodeScale = 20

  const edgeListFlat = graph.edges
    .flat()
    .filter(graph.directed ? () => true : (e) => e.source < e.target)

  const [fieldsOpen, setFieldsOpen] = useState(false)

  const nodeInputFieldMd = `${nodeInputFieldID(graph.inputFields)}#TL###`
  const edgeInputFieldMd = `${edgeInputFieldID(graph.inputFields)}#TL###`
  let nodeField: TextFieldState | undefined
  let edgeField: TextFieldState | undefined
  if (graph.inputFields) {
    if (graph.nodeClickType !== "none") {
      addFormField(nodeInputFieldMd)
      nodeField = useFormField(`${nodeInputFieldID(graph.inputFields)}`)
    }
    if (graph.edgeClickType !== "none") {
      addFormField(edgeInputFieldMd)
      edgeField = useFormField(`${edgeInputFieldID(graph.inputFields)}`)
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

  useEffect(() => {
    saveNodeInput(nodeField, nodeStates, graph, lang)
  }, [nodeField?.text])

  useEffect(() => {
    saveEdgeInput(edgeField, edgeStates, edgeListFlat, graph, lang)
  }, [edgeField?.text])

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
        clickable={graph.edgeClickType !== "none" && !edgeField?.disabled}
        onClickCallback={() => {
          if (!edgeField?.disabled) {
            setEdgeStates((prevEdgeStates) => {
              const newEdgeStates = [...prevEdgeStates]
              newEdgeStates[i] = { ...prevEdgeStates[i] }
              if (graph.edgeClickType === "select") {
                newEdgeStates[i].selected = !newEdgeStates[i].selected
              } else if (graph.edgeClickType === "group") {
                newEdgeStates[i].group =
                  newEdgeStates[i].group === Math.min(graph.edgeGroupMax ?? maxGroups, maxGroups) - 1
                    ? null
                    : newEdgeStates[i].group === null
                      ? 0
                      : newEdgeStates[i].group + 1
              }
              edgeInputSetText(edgeField, newEdgeStates, edgeListFlat)
              return newEdgeStates
            })
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
        clickable={graph.nodeClickType !== "none" && !nodeField?.disabled}
        state={nodeStates[i]}
        // todo the onClickCallback is duplicate code.
        onClickCallback={() => {
          if (!nodeField?.disabled) {
            setNodeStates((prevNodeStates) => {
              const newNodeStates = [...prevNodeStates]
              newNodeStates[i] = { ...prevNodeStates[i] }
              if (graph.nodeClickType === "select") {
                newNodeStates[i].selected = !newNodeStates[i].selected
              } else if (graph.nodeClickType === "group") {
                newNodeStates[i].group =
                  newNodeStates[i].group === Math.min(graph.nodeGroupMax ?? maxGroups, maxGroups) - 1
                    ? null
                    : newNodeStates[i].group === null
                      ? 0
                      : newNodeStates[i].group + 1
              }
              nodeInputSetText(nodeField, newNodeStates)
              return newNodeStates
            })
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

  const updateDraggedNode = (clientX: number, clientY: number) => {
    if (currentlyDragged === null || svgRef.current === null) return

    const pt = svgRef.current.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const svgPos = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse())

    // Calculate boundaries with node radius as buffer
    const nodeRadius = nodeScale
    const minX = viewBox.x - (viewBox.width - maxWidth) / 2
    const maxX = viewBox.x + viewBox.width + (viewBox.width - maxWidth) / 2
    const minY = viewBox.y + nodeRadius
    const maxY = viewBox.y + viewBox.height - nodeRadius

    // Constrain the position within boundaries
    const constrainedX = Math.max(minX, Math.min(maxX, svgPos.x))
    const constrainedY = Math.max(minY, Math.min(maxY, svgPos.y))

    nodePositions[currentlyDragged].x = constrainedX
    nodePositions[currentlyDragged].y = constrainedY
    setNodePositions([...nodePositions])
  }
  return (
    <div className={`mb-8`}>
      <div className={`relative`}>
    <svg
      ref={svgRef}
      width={maxWidth}
      height={
        viewBox.height / viewBox.width > 1 && viewBox.height < maxHeight
          ? viewBox.height * 0.75
          : maxWidth * viewBoxAspectRatio
      }
      // - 10 and + 20 to give some extra space for arrow heads and edge weights
      viewBox={`${viewBox.x} ${viewBox.y - 10} ${viewBox.width} ${viewBox.height + 20}`}
      className={`mx-auto h-auto max-w-full touch-none overscroll-x-none rounded-2xl bg-secondary`}
      onMouseMove={(e) => updateDraggedNode(e.clientX, e.clientY)}
      // Even simpler alternative - remove the threshold entirely:

            onTouchMove={(e) => {
            // Always prevent default when a node is being dragged
        if (currentlyDragged !== null) {
          e.preventDefault()
          e.stopPropagation()
            updateDraggedNode(e.touches[0].clientX, e.touches[0].clientY)
            }
            }}
      onMouseUp={() => {
            if (currentlyDragged !== null) setCurrentlyDragged(null)
            }}
      onTouchEnd={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (currentlyDragged !== null) {
            setCurrentlyDragged(null)
            }
          }}
          onTouchCancel={(e) => {
        e.preventDefault()
            if (currentlyDragged !== null) {
          setCurrentlyDragged(null)
        }
          }}
        >
          <g>{edges}</g>
          <g>{nodes}</g>
        </svg>
        <div className="absolute -bottom-5 right-2 flex flex-row items-center space-x-1 rounded-lg dark:border-gray-700 dark:bg-gray-800">
          {graph.inputFields !== 0 && (
            <Toggle
              className={`${theme === "dark" ? "text-white" : "text-black"}`}
              size="sm"
              variant="bg"
              disabled={nodeField?.disabled || edgeField?.disabled}
              onClick={() => setFieldsOpen(!fieldsOpen)}
            >
              <RiInputField />
            </Toggle>
          )}
        </div>
      </div>
      {graph.nodeClickType !== "none" && fieldsOpen && (
        <div className={`mt-1`}>
          <div className={`mb-1`}>
            <b>{t("nodeSelection")}</b>
          </div>
          <div className="flex w-full flex-row items-center justify-center space-x-1">
            <div className="mr-0.5 flex-grow">
              <Markdown md={`{{${nodeInputFieldMd}}}`} />
            </div>
          </div>
        </div>
      )}
      {graph.edgeClickType !== "none" && fieldsOpen && (
        <div className={`mt-1`}>
          <div className={`mb-1`}>
            <b>{t("edgeSelection")}</b>
          </div>
          <div className="flex w-full flex-row items-center justify-center space-x-1">
            <div className="mr-0.5 flex-grow">
              <Markdown md={`{{${edgeInputFieldMd}}}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function edgeInputSetText(
  edgeField: TextFieldState | undefined,
  edgeStates: GraphElementStateType[],
  edgeListFlat: Edge[],
) {
  if (edgeField !== undefined && edgeField.setText) {
    edgeField.setText(parseEdgeText(edgeStates, edgeListFlat))
  }
}

function nodeInputSetText(nodeField: TextFieldState | undefined, nodeStates: GraphElementStateType[]) {
  if (nodeField !== undefined && nodeField.setText) {
    nodeField.setText(parseNodeText(nodeStates))
  }
}

function saveNodeInput(
  nodeField: TextFieldState | undefined,
  nodeStates: GraphElementStateType[],
  graph: Graph,
  lang: Language,
) {
  const nodeCheck = checkNodeInput(nodeField?.text ?? "", graph, lang)
  if (nodeCheck.parsed) {
    if ("selected" in nodeCheck) {
      updateGraphNodeSelected(graph, nodeStates, nodeCheck.selected)
    } else {
      updateGraphNodeGroup(graph, nodeStates, nodeCheck.groups)
    }
  }
}

function saveEdgeInput(
  edgeField: TextFieldState | undefined,
  edgeStates: GraphElementStateType[],
  edgeListFlat: Edge[],
  graph: Graph,
  lang: Language,
) {
  const edgeCheck = checkEdgeInput(edgeField?.text ?? "", graph, lang)
  if (edgeCheck.parsed) {
    if ("selected" in edgeCheck) {
      updateGraphEdgeSelected(graph.directed, edgeListFlat, edgeStates, edgeCheck.selected)
    } else {
      updateGraphEdgeGroup(graph.directed, edgeListFlat, edgeStates, edgeCheck.groups)
    }
  }
}
