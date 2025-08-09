import { useRef, useState } from "react"
import { parse, isValid } from "date-fns"
import "./App.css"

type Part = "dd" | "MM" | "yyyy"

type DateParts = {
  MM: string[]
  dd: string[]
  yyyy: string[]
}

const initialParts: Readonly<DateParts> = {
  MM: Array(2).fill(""),
  dd: Array(2).fill(""),
  yyyy: Array(4).fill(""),
}

const datePartsPosition = {
  MM: [0, 2],
  dd: [2, 4],
  yyyy: [4, 8],
} as const

const partsOrder = ["MM", "dd", "yyyy"] as const

const dateFormat = "MM-dd-yyyy" as const

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

function SimpleDateInput({ disabled }: { disabled: boolean }) {
  const [selectedPart, setSelectedPart] = useState<Part | undefined>()
  const [dateParts, setDateParts] = useState<DateParts>(initialParts)

  const previousSelected = useRef<Part | undefined>(undefined)

  const onBlur = () => setSelectedPart(undefined)

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedPart) {
      return
    }

    // this needs to be performed as soon as we type
    // checking this in the seDate won't work as it would yeild the same value
    // for both prev and current

    // check if selected part changed since last key event
    const shouldReset = previousSelected.current !== selectedPart
    // then remember the selected part
    previousSelected.current = selectedPart

    const idx = partsOrder.indexOf(selectedPart)
    if (e.key === "ArrowRight" && idx < partsOrder.length - 1) {
      setSelectedPart(partsOrder[idx + 1])
    } else if (e.key === "ArrowLeft" && idx > 0) {
      setSelectedPart(partsOrder[idx - 1])
    }

    if (e.key.match(/[0-9]/)) {
      setDateParts((prevParts) => {
        const digits = prevParts[selectedPart]
          .slice()
          .map((v) => (shouldReset ? "" : v))

        if (!digits.every(Boolean)) {
          digits.shift()
          digits.push(e.key)
        } else if (idx < partsOrder.length - 1) {
          setSelectedPart(partsOrder[idx + 1])
        }

        return {
          ...prevParts,
          [selectedPart]: digits,
        }
      })
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const step = e.key === "ArrowUp" ? 1 : -1

      setDateParts((prevParts) => {
        const digits = prevParts[selectedPart].slice()

        return {
          ...prevParts,
          [selectedPart]: (Number(digits.join("")) + step).toString().split(""),
        }
      })
    }
  }

  const onPaste = (e: React.ClipboardEvent) => {
    if (disabled) {
      return
    }

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

  return (
    <div className={`container ${disabled ? "disabled" : ""}`.trim()}>
      <p
        role="button"
        aria-label="Date input box"
        aria-description="A date input in MM-dd-yyyy format"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onPaste={onPaste}
        onFocus={() => setSelectedPart(previousSelected.current)}
      >
        {partsOrder.map((part, index) => (
          <span key={part}>
            <span
              onClick={() => setSelectedPart(part)}
              style={{
                background: part === selectedPart ? "#0DBCB4" : "inherit",
              }}
            >
              {dateParts[part].join("") || part}
            </span>
            {index < partsOrder.length - 1 && <span>-</span>}
          </span>
        ))}
      </p>
      {!getIsValidDate() && <span>Please enter a valid date</span>}
    </div>
  )
}

export default function App() {
  const [disabled, setDisabled] = useState(false)

  return (
    <div>
      <button onClick={() => setDisabled((v) => !v)}>disable input</button>
      <SimpleDateInput disabled={disabled} />
    </div>
  )
}
