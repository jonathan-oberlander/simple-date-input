import { useState } from "react"
import "./App.css"

type Part = "dd" | "mm" | "yyyy"

type DateParts = {
  dd: string[]
  mm: string[]
  yyyy: string[]
}

const initialParts: DateParts = {
  dd: ["", ""],
  mm: ["", ""],
  yyyy: ["", "", "", ""],
}

const partsOrder: Part[] = ["dd", "mm", "yyyy"]

function App() {
  const [selectedPart, setSelectedPart] = useState<Part | undefined>()
  const [dateParts, setDateParts] = useState<DateParts>(initialParts)

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (selectedPart) {
      const idx = partsOrder.indexOf(selectedPart)

      if (e.key === "ArrowRight" && idx < partsOrder.length - 1) {
        setSelectedPart(partsOrder[idx + 1])
      } else if (e.key === "ArrowLeft" && idx > 0) {
        setSelectedPart(partsOrder[idx - 1])
      }
    }

    if (selectedPart && e.key.match(/[0-9]/)) {
      setDateParts((parts) => {
        const partArr = parts[selectedPart].slice()

        partArr.shift()
        partArr.push(e.key)

        return {
          ...parts,
          [selectedPart]: partArr,
        }
      })
    }
  }

  const onPaste = (e: React.ClipboardEvent) => {
    const str = e.clipboardData.getData("Text").replace(/[^0-9]/g, "")
    
    setDateParts(() => ({
      dd: str.slice(0, 2).split("").concat(Array(2).fill("")).slice(0, 2),
      mm: str.slice(2, 4).split("").concat(Array(2).fill("")).slice(0, 2),
      yyyy: str.slice(4, 8).split("").concat(Array(4).fill("")).slice(0, 4),
    }))
  }

  const onBlur = () => setSelectedPart(undefined)

  return (
    <div
      role="textbox"
      tabIndex={0}
      className="container"
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onPaste={onPaste}
    >
      <p>
        {partsOrder.map((part, index) => (
          <span key={part}>
            <span
              onClick={() => setSelectedPart(part)}
              style={{
                background: part === selectedPart ? "#FDBCB4" : "inherit",
              }}
            >
              {dateParts[part].join("") || part}
            </span>
            {index < 2 && <span key={part + index}>-</span>}
          </span>
        ))}
      </p>
    </div>
  )
}

export default App
