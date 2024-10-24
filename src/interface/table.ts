export interface Column {
  prop: string
  label?: string
  width?: number
  headerStyle?: { [key: string]: string }
  disabledRules?: SelectionDisableRules
}

export interface SelectionDisableRules {
  prop: string
  value: Set<string>
}