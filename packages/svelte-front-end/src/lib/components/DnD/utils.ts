import {
  defaultDropAnimationSideEffects,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DropAnimation,
} from "@dnd-kit-svelte/core"

export const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
}

export const sensors = useSensors(
  useSensor(TouchSensor),
  useSensor(KeyboardSensor),
  useSensor(MouseSensor),
)
