/**
 * Document parsing utilities for PDF, DOCX, and TXT files
 */

export async function parsePDF(file) {
  try {
    const pdf = require('pdf-parse')
    const buffer = await file.arrayBuffer()
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF')
  }
}

export async function parseDOCX(file) {
  try {
    const mammoth = require('mammoth')
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return result.value
  } catch (error) {
    console.error('DOCX parsing error:', error)
    throw new Error('Failed to parse DOCX')
  }
}

export async function parseTXT(file) {
  try {
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder().decode(buffer)
    return text
  } catch (error) {
    console.error('TXT parsing error:', error)
    throw new Error('Failed to parse TXT')
  }
}

export async function parseFile(file) {
  const fileName = file.name
  const fileType = file.type

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return parsePDF(file)
  } else if (
    fileType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return parseDOCX(file)
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return parseTXT(file)
  } else {
    throw new Error('Unsupported file type')
  }
}
