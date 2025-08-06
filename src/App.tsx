import { useEffect, useState } from "react"
import { parse, isValid } from "date-fns"
import "./App.css"

type Part = "dd" | "mm" | "yyyy"

type DateParts = {
  dd: string[]
  mm: string[]
  yyyy: string[]
}

const initialParts: DateParts = {
  mm: ["", ""],
  dd: ["", ""],
  yyyy: ["", "", "", ""],
}

const partsOrder: Part[] = ["mm", "dd", "yyyy"]

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
      mm: str.slice(0, 2).split("").concat(Array(2).fill("")).slice(0, 2),
      dd: str.slice(2, 4).split("").concat(Array(2).fill("")).slice(0, 2),
      yyyy: str.slice(4, 8).split("").concat(Array(4).fill("")).slice(0, 4),
    }))
  }

  const onBlur = () => setSelectedPart(undefined)

  const validateDate = () => {
    const str = Object.values(dateParts)
      .flat()
      .reduce((acc, parts) => (acc += parts), "")

    const dateStr = `${str.slice(0, 2)}-${str.slice(2, 4)}-${str.slice(4, 8)}`
    const parsed = parse(dateStr, "MM-dd-yyyy", new Date())

    return isValid(parsed)
  }

  return (
    <div
      role="textbox"
      tabIndex={0}
      className={"container"}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onPaste={onPaste}
      style={{
        border: !validateDate() ? "1px solid red" : "none",
      }}
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
            {index < 2 && <span>-</span>}
          </span>
        ))}
      </p>
    </div>
  )
}

export default App
