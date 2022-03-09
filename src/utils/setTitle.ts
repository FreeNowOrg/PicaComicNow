import { PROJECT_NAME } from '../config'

export function setTitle(...title: string[]) {
  document.title = [...title, PROJECT_NAME].join(' | ')
  return document.title
}
