export interface FileThumb {
  originalName: string
  path: string
  fileServer: string
}

export interface FileMedia extends FileThumb {
  fileUrl: string
}
