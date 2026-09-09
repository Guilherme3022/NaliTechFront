// Lê o texto de um arquivo com fallback de encoding: tenta UTF-8 estrito e, se o
// arquivo não for UTF-8 válido (ex.: Windows-1252/Latin-1 de sistemas contábeis BR),
// decodifica como windows-1252 — evitando o "�" no lugar de acentos (ex.: DISPONÍVEL).
export async function decodeFileText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('windows-1252').decode(buffer);
  }
}
