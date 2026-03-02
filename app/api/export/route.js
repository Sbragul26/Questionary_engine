import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import PDFDocument from 'pdfkit'
import { Packer, Document, Paragraph, TextRun } from 'docx'

async function generatePDF(answers) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument()
    let buffers = []

    doc.on('data', (chunk) => buffers.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)

    doc.fontSize(16).text('Questionnaire Answers Report', { underline: true })
    doc.moveDown()

    answers.forEach((answer, index) => {
      doc.fontSize(12).text(`Q${index + 1}: ${answer.question}`, { underline: true })
      doc.fontSize(11).text(`Answer: ${answer.answer}`)

      if (answer.citations && answer.citations.length > 0) {
        doc.fontSize(10).text('Citations:')
        answer.citations.forEach((citation) => {
          doc.text(`  • ${citation.documentName}`)
        })
      }

      if (answer.confidenceScore) {
        doc.fontSize(10).text(`Confidence: ${answer.confidenceScore.level}`)
      }

      doc.moveDown()
    })

    doc.end()
  })
}

async function generateDOCX(answers) {
  const sections = []

  sections.push(
    new Paragraph({
      text: 'Questionnaire Answers Report',
      bold: true,
      size: 32,
    })
  )

  answers.forEach((answer, index) => {
    sections.push(
      new Paragraph({
        text: `Q${index + 1}: ${answer.question}`,
        bold: true,
        size: 24,
      })
    )

    sections.push(
      new Paragraph({
        text: `Answer: ${answer.answer}`,
        size: 22,
      })
    )

    if (answer.citations && answer.citations.length > 0) {
      sections.push(
        new Paragraph({
          text: 'Citations:',
          bold: true,
          size: 20,
        })
      )

      answer.citations.forEach((citation) => {
        sections.push(
          new Paragraph({
            text: `• ${citation.documentName}`,
            size: 20,
          })
        )
      })
    }

    if (answer.confidenceScore) {
      sections.push(
        new Paragraph({
          text: `Confidence: ${answer.confidenceScore.level}`,
          size: 20,
        })
      )
    }

    sections.push(new Paragraph({ text: '' }))
  })

  const doc = new Document({
    sections: [{ children: sections }],
  })

  const buffer = await Packer.toBuffer(doc)
  return buffer
}

export async function POST(request) {
  try {
    const userId = verifyToken(request).userId
    const { answerId, format } = await request.json()

    const { data: answer, error } = await supabaseAdmin
      .from('generated_answers')
      .select('*')
      .eq('id', answerId)
      .eq('user_id', userId)
      .single()

    if (error || !answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    let buffer
    let contentType
    let fileName

    if (format === 'pdf') {
      buffer = await generatePDF(answer.answers_json)
      contentType = 'application/pdf'
      fileName = `questionnaire-answers-${Date.now()}.pdf`
    } else if (format === 'docx') {
      buffer = await generateDOCX(answer.answers_json)
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      fileName = `questionnaire-answers-${Date.now()}.docx`
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
