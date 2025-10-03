import type { TextFieldState } from "$lib/components/types.ts"
import type { Language } from "@shared/api/Language.ts"
import type { Edge, Graph } from "@shared/utils/graph.ts"
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

type GraphElementStateType = { selected: boolean; group: null | number }

export function edgeInputSetText(
  edgeField: TextFieldState | undefined,
  edgeStates: GraphElementStateType[],
  edgeListFlat: Edge[],
) {
  if (edgeField !== undefined && edgeField.setText) {
    edgeField.setText(parseEdgeText(edgeStates, edgeListFlat))
  }
}

export function nodeInputSetText(
  nodeField: TextFieldState | undefined,
  nodeStates: GraphElementStateType[],
) {
  if (nodeField !== undefined && nodeField.setText) {
    nodeField.setText(parseNodeText(nodeStates))
  }
}

export function saveNodeInput(
  nodeText: string,
  nodeStates: GraphElementStateType[],
  graph: Graph,
  lang: Language,
) {
  const nodeCheck = checkNodeInput(nodeText, graph, lang)
  if (nodeCheck.parsed) {
    if ("selected" in nodeCheck) {
      updateGraphNodeSelected(graph, nodeStates, nodeCheck.selected)
    } else {
      updateGraphNodeGroup(graph, nodeStates, nodeCheck.groups)
    }
  }
}

export function saveEdgeInput(
  edgeString: string,
  edgeStates: GraphElementStateType[],
  edgeListFlat: Edge[],
  graph: Graph,
  lang: Language,
) {
  const edgeCheck = checkEdgeInput(edgeString, graph, lang)
  if (edgeCheck.parsed) {
    if ("selected" in edgeCheck) {
      updateGraphEdgeSelected(graph.directed, edgeListFlat, edgeStates, edgeCheck.selected)
    } else {
      updateGraphEdgeGroup(graph.directed, edgeListFlat, edgeStates, edgeCheck.groups)
    }
  }
}
