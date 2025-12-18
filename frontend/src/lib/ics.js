// -------------------------------------------------------------
// Why: Generate iCalendar (.ics) content for exporting plans to calendar apps.
// -------------------------------------------------------------
export function planToICS(plan){
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudyPlanner//EN'
  ]
  const content = plan?.content || {}
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  let dayOffset = 0
  for (const [day, items] of Object.entries(content)){
    for (const item of items){
      const start = new Date(Date.now() + dayOffset*24*3600*1000)
      const end = new Date(start.getTime() + (item.duration||30)*60000)
      const dtStart = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      const dtEnd = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      const summary = (item.task || 'Study')
      const description = (item.notes || '')
      lines.push('BEGIN:VEVENT')
      lines.push(`DTSTAMP:${now}`)
      lines.push(`DTSTART:${dtStart}`)
      lines.push(`DTEND:${dtEnd}`)
      lines.push(`SUMMARY:${escapeICS(summary)}`)
      if (description) lines.push(`DESCRIPTION:${escapeICS(description)}`)
      lines.push('END:VEVENT')
    }
    dayOffset += 1
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

function escapeICS(text){
  return String(text).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')
}

export function downloadICS(plan){
  const blob = new Blob([planToICS(plan)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(plan?.title || 'study-plan').replace(/\s+/g,'-')}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
