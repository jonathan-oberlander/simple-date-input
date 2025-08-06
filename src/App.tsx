import { useState } from "react"
import "./App.css"

type Part = "dd" | "mm" | "yyyy"

type Input = (string | undefined)[]

type Stack<T> = {
  set(val: string): T
  get(): T
}

type DateParts = {
  dd: Stack<Input>
  mm: Stack<Input>
  yyyy: Stack<Input>
}

function stack(length: number): Stack<Input> {
  const arr: Input = Array.from({ length })

  return {
    set(val: string) {
      arr.shift()
      arr.push(val)
      return arr
    },
    get() {
      return arr
    },
  }
}

const initialParts: DateParts = {
  dd: stack(2),
  mm: stack(2),
  yyyy: stack(4),
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

    if (e.key.match(/[0-9]/)) {
      setDateParts((parts) => {
        if (selectedPart) {
          parts[selectedPart].set(e.key)
        }

        return { ...parts }
      })
    }
  }

  const onPaste = (e: React.ClipboardEvent) => {
    const str = e.clipboardData.getData("Text").replace(/[^0-9]/g, "")

    setDateParts((parts) => {
      parts.dd.set(str.slice(0, 2))
      parts.mm.set(str.slice(2, 4))
      parts.yyyy.set(str.slice(4, 8))

      return { ...parts }
    })
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
        {Object.entries(dateParts).map(([part, stack], index) => (
          <span key={part}>
            <span
              onClick={() => setSelectedPart(part as Part)}
              style={{
                background: part === selectedPart ? "#FDBCB4" : "inherit",
              }}
            >
              {stack.get().join("") || part}
            </span>
            {index < 2 && <span key={part + index}>-</span>}
          </span>
        ))}
      </p>
    </div>
  )
}

export default App
