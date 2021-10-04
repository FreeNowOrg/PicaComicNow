import { PROJECT_NAME } from '../config'

export function setTitle(...title: string[]) {
  title.push(PROJECT_NAME)
  document.title = title.join(' | ')
  return document.title
}
