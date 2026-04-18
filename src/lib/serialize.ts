// Chuyển MongoDB document thành plain object an toàn để truyền qua props
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
