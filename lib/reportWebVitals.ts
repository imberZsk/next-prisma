export const reportWebVitals = async (metric: any) => {
  const projectId = 1 // TODO: 替换为你的实际项目ID
  await fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId,
      type: metric.name.toLowerCase(),
      value: metric.value,
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  })
}
