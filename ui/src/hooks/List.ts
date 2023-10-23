import { reactive } from "vue";

export function useDisable(initDisableIds: number[]) {
  const disableIds = reactive<number[]>(initDisableIds)
  const handleDisable = (index: number) => {
    let flag = true
    for (let i = 0; i < disableIds.length; i++)
      if (disableIds[i] === index) {
        disableIds.splice(i, 1)
        flag = false
        break
      }
    if (flag)
      disableIds.push(index)
  }
  return { disableIds, handleDisable }
}
