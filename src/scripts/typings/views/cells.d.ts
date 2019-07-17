declare namespace Cells {
  interface InputCellData<T extends string> {
    label: string,
    placeholder: string,
    name: T,
    type?: "text" | "select" | "number",
    optional?: boolean,
    value?: string,
    tapHandler?: string
  }

  interface InfoCellData {
    label: string,
    value: string
  }
}