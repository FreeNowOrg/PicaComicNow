import { PROJECT_NAME } from '../config'

export function setTitle(...title: any[]) {
  document.title = [...title, PROJECT_NAME]
    .filter(Boolean)
    .map(String)
    .join(' | ')
  return document.title
}
