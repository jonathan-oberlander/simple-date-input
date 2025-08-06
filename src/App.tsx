import { useState } from "react"
import { parse, isValid } from "date-fns"
import "./App.css"

type Part = "dd" | "MM" | "yyyy"

type DateParts = {
  MM: string[]
  dd: string[]
  yyyy: string[]
}

const initialParts: DateParts = {
  MM: Array(2).fill(""),
  dd: Array(2).fill(""),
  yyyy: Array(4).fill(""),
}

const datePartsPosition: Record<Part, [number, number]> = {
  MM: [0, 2],
  dd: [2, 4],
  yyyy: [4, 8],
}

const partsOrder: Part[] = ["MM", "dd", "yyyy"]

const dateFormat = "MM-dd-yyyy"

const fillDatePartBlanks = (part: Part, str: string) => {
  const [start, end] = datePartsPosition[part]

  return str
    .slice(start, end)
    .split("")
    .concat(Array(2).fill(""))
    .slice(0, end - start)
}

const removeNonDigitChars = (str: string) => str.replace(/[^0-9]/g, "")

const produceAbitraryDate = (str: string) =>
  `${str.slice(...datePartsPosition.MM)}-${str.slice(
    ...datePartsPosition.dd
  )}-${str.slice(...datePartsPosition.yyyy)}`

const datePartsToString = (dateParts: DateParts) =>
  Object.values(dateParts)
    .flat()
    .reduce((acc, parts) => (acc += parts), "")

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
    const text = e.clipboardData.getData("Text")
    const cleanText = removeNonDigitChars(text)

    setDateParts(() => ({
      MM: fillDatePartBlanks("MM", cleanText),
      dd: fillDatePartBlanks("dd", cleanText),
      yyyy: fillDatePartBlanks("yyyy", cleanText),
    }))
  }

  const getIsValidDate = () => {
    const str = datePartsToString(dateParts)
    const dateStr = produceAbitraryDate(str)
    const parsed = parse(dateStr, dateFormat, new Date())

    return isValid(parsed)
  }

  const onBlur = () => setSelectedPart(undefined)

  return (
    <div
      role="textbox"
      tabIndex={0}
      className={"container"}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onPaste={onPaste}
      style={{
        border: getIsValidDate() ? "none" : "1px solid red",
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
