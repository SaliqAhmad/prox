import { useTheme } from "@/components/theme-provider"

import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()
    const [checkState, setCheckState] = useState(theme === "dark" ? true : false)
    return (
        <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" checked={checkState} onCheckedChange={
                () => {
                    setCheckState(!checkState)
                    setTheme(theme === "dark" ? "light" : "dark")
                }
            } />
        </div>
    )
}
