import { resized } from "@/utils/image-sizing"
import { useMemo } from "react"

export const useResized = (uri: string, layoutWidth: number) => {
    useMemo(() => resized(uri, layoutWidth), [uri, layoutWidth]);
}
