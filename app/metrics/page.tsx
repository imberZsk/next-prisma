'use client'
import { useEffect, useState, useRef } from 'react'
import ReactECharts from 'echarts-for-react'

const metricsList = [
  {
    type: 'lcp',
    name: 'LCP (最大内容绘制)',
    unit: 'ms',
    chartType: 'line',
    color: '#3b82f6',
    threshold: '小于 2.5s 为优秀',
    thresholdValue: 2500,
    thresholdType: 'lt', // 小于为优秀
    displayUnit: 'ms'
  },
  {
    type: 'cls',
    name: 'CLS (累积布局偏移)',
    unit: '',
    chartType: 'bar',
    color: '#22d3ee',
    threshold: '小于 0.1 为优秀',
    thresholdValue: 0.1,
    thresholdType: 'lt',
    displayUnit: ''
  },
  {
    type: 'inp',
    name: 'INP (交互延迟)',
    unit: 'ms',
    chartType: 'line',
    color: '#fde047',
    threshold: '小于 200ms 为优秀',
    thresholdValue: 200,
    thresholdType: 'lt',
    displayUnit: 'ms'
  },
  {
    type: 'fcp',
    name: 'FCP (首次内容绘制)',
    unit: 'ms',
    chartType: 'line',
    color: '#f87171',
    threshold: '小于 1.8s 为优秀',
    thresholdValue: 1800,
    thresholdType: 'lt',
    displayUnit: 'ms'
  },
  {
    type: 'ttfb',
    name: 'TTFB (首字节时间)',
    unit: 'ms',
    chartType: 'line',
    color: '#38bdf8',
    threshold: '小于 800ms 为优秀',
    thresholdValue: 800,
    thresholdType: 'lt',
    displayUnit: 'ms'
  }
]

// 新增 Project 类型
interface Project {
  id: number
  name: string
}

function formatTime(str: string) {
  if (!str) return ''
  const date = new Date(str)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffMinutes < 24 * 60) {
    const hours = Math.floor(diffMinutes / 60)
    return `${hours}小时前`
  }
  return `${Math.floor(diffMinutes / (24 * 60))}天前`
}

interface EChartsParams {
  dataIndex: number
  marker: string
  value: number
}

function getChartOption(
  metric: (typeof metricsList)[0],
  data: { value: number; timestamp: string }[]
) {
  const values = data.map((d) => d.value)
  const avg = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 600,
    animationEasingUpdate: 'cubicInOut',
    tooltip: {
      trigger: 'axis',
      formatter: (params: EChartsParams[]) => {
        const time = new Date(
          data[params[0].dataIndex]?.timestamp || ''
        ).toLocaleString()
        const value = params[0].value
        const avgDiff = (((value - avg) / avg) * 100).toFixed(1)
        const diffColor = value > avg ? '#f87171' : '#4ade80'
        return `
          <div class="font-medium">
            ${time}<br/>
            ${params[0].marker}${metric.name}: ${value}${metric.unit}<br/>
            <span style="color: ${diffColor}">
              较平均值: ${value > avg ? '+' : ''}${avgDiff}%
            </span>
          </div>
        `
      },
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      borderColor: '#374151',
      textStyle: { color: '#fff' }
    },
    title: {
      text: metric.name,
      subtext: `平均值: ${avg.toFixed(2)}${metric.unit}`,
      left: 'center',
      top: 10,
      textStyle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
      },
      subtextStyle: {
        color: '#9ca3af',
        fontSize: 14
      }
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => formatTime(d.timestamp)).reverse(), // 反转数据，最新的在右边
      name: '时间',
      nameLocation: 'middle',
      nameGap: 35,
      axisLabel: {
        color: '#9ca3af',
        interval: 'auto',
        rotate: 0
      },
      axisLine: {
        lineStyle: { color: '#374151' }
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#1f2937' }
      }
    },
    yAxis: {
      type: 'value',
      name: metric.unit || '数值',
      nameGap: 30,
      nameLocation: 'middle',
      axisLabel: { color: '#9ca3af' },
      axisLine: {
        show: true,
        lineStyle: { color: '#374151' }
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#1f2937' }
      }
    },
    series: [
      {
        data: values.reverse(), // 反转数据，最新的在右边
        type: metric.chartType,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        areaStyle:
          metric.chartType === 'line'
            ? {
                opacity: 0.2,
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: metric.color
                    },
                    {
                      offset: 1,
                      color: 'transparent'
                    }
                  ]
                }
              }
            : undefined,
        lineStyle: {
          width: 3,
          shadowColor: metric.color,
          shadowBlur: 10
        },
        itemStyle: {
          color: metric.color,
          borderWidth: 2,
          borderColor: '#111827'
        },
        name: metric.name,
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: '#9ca3af',
            type: 'dashed'
          },
          data: [
            {
              type: 'average',
              name: '平均值',
              label: {
                position: 'insideEndTop',
                formatter: '平均值: {c}',
                color: '#9ca3af',
                fontSize: 12,
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: [6, 10],
                distance: 10,
                borderRadius: 4
              }
            }
          ]
        },
        animation: true,
        animationDuration: 800,
        animationEasing: 'cubicOut',
        animationDurationUpdate: 600,
        animationEasingUpdate: 'cubicInOut'
      }
    ],
    grid: {
      left: 60,
      right: 40,
      top: 90,
      bottom: 60
    }
  }
}

// 计算性能总结和每个指标状态
function getProjectSummary(
  data: Record<string, { value: number; timestamp: string }[]>
) {
  let total = 0,
    good = 0
  const badList: string[] = []
  const details: {
    name: string
    avg: number
    displayUnit: string
    isGood: boolean
    color: string
    icon: string
    threshold: string
  }[] = []
  metricsList.forEach((metric) => {
    const arr = data[metric.type] || []
    if (!arr.length) return
    total++
    const avg = arr.reduce((a, b) => a + b.value, 0) / arr.length
    let isGood = false
    if (metric.thresholdType === 'lt') isGood = avg < metric.thresholdValue
    if (metric.thresholdType === 'gt') isGood = avg > metric.thresholdValue
    details.push({
      name: metric.name,
      avg,
      displayUnit: metric.displayUnit,
      isGood,
      color: isGood ? 'text-green-400' : 'text-yellow-400',
      icon: isGood ? '✅' : '⚠️',
      threshold: metric.threshold
    })
    if (isGood) {
      good++
    } else {
      badList.push(`${metric.name}（${avg.toFixed(2)}${metric.displayUnit}）`)
    }
  })
  if (total === 0)
    return {
      level: 'unknown',
      text: '暂无数据',
      color: 'text-gray-400',
      icon: '❓',
      details: []
    }
  if (good === total)
    return {
      level: 'good',
      text: '本项目整体性能优秀',
      color: 'text-green-400',
      icon: '✅',
      details
    }
  if (good === 0)
    return {
      level: 'bad',
      text: '本项目所有核心指标均不达标',
      color: 'text-red-400',
      icon: '⛔',
      details
    }
  return {
    level: 'warn',
    text: `部分指标不达标：${badList.join('、')}`,
    color: 'text-yellow-400',
    icon: '⚠️',
    details
  }
}

export default function MetricsCharts() {
  const [data, setData] = useState<
    Record<string, { value: number; timestamp: string }[]>
  >({})
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 获取所有项目
  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((arr: Project[]) => {
        setProjects(arr)
        if (arr.length > 0 && !currentProject) {
          setCurrentProject(arr[0])
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 切换项目时拉取数据
  useEffect(() => {
    if (!currentProject) return
    setLoading(true)
    Promise.all(
      metricsList.map((metric) =>
        fetch(
          `/api/metrics?projectId=${currentProject.id}&type=${metric.type}`
        ).then((res) => res.json())
      )
    ).then((results) => {
      const newData: typeof data = {}
      metricsList.forEach((metric, idx) => {
        newData[metric.type] = results[idx]
      })
      setData(newData)
      setLoading(false)
    })
  }, [currentProject])

  // 关闭弹层的点击事件
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  const summary = getProjectSummary(data)

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-[1800px] mx-auto p-4 md:p-8 space-y-8">
        {/* 标题和项目选择区域 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 backdrop-blur-sm py-6">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 text-transparent bg-clip-text">
              性能监控面板
            </h1>
            <p className="text-gray-400">实时监控核心 Web Vitals 指标</p>
          </div>

          {/* 项目选择器 */}
          <div className="flex justify-center md:justify-end z-50">
            <div className="relative w-72" ref={dropdownRef}>
              <button
                type="button"
                className={
                  `w-full bg-gray-900/60 backdrop-blur-sm text-white px-5 py-3 rounded-xl border border-gray-700/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-200 text-center flex items-center justify-between hover:bg-gray-800/60 shadow-lg ` +
                  (dropdownOpen ? 'ring-2 ring-cyan-400/50' : '') +
                  (projects.length === 0
                    ? ' opacity-60 cursor-not-allowed'
                    : ' cursor-pointer')
                }
                onClick={() =>
                  projects.length > 0 && setDropdownOpen((v) => !v)
                }
                disabled={projects.length === 0}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (projects.length > 0) setDropdownOpen((v) => !v)
                  }
                  if (e.key === 'Escape') setDropdownOpen(false)
                }}
              >
                <div className="flex items-center gap-2 flex-1 text-left">
                  <span className="text-cyan-400/80">项目：</span>
                  <span className="truncate">
                    {currentProject ? currentProject.name : '暂无可选项目'}
                  </span>
                </div>
                <span
                  className={`ml-2 transition-transform duration-200 text-cyan-400/80 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 z-50 mt-2 w-full rounded-xl bg-gray-900/90 backdrop-blur-md border border-gray-700/30 shadow-xl py-1 max-h-60 overflow-auto animate-fade-in">
                  {projects.length === 0 && (
                    <div className="px-4 py-2 text-gray-400 text-center select-none">
                      暂无可选项目
                    </div>
                  )}
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className={
                        `px-4 py-2.5 cursor-pointer select-none text-gray-200 hover:bg-cyan-600/30 hover:text-white transition-all duration-150 flex items-center gap-2 ` +
                        (currentProject?.id === p.id
                          ? ' bg-cyan-700/30 text-white font-medium'
                          : '')
                      }
                      onClick={() => {
                        setCurrentProject(p)
                        setDropdownOpen(false)
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setCurrentProject(p)
                          setDropdownOpen(false)
                        }
                      }}
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400/60"></span>
                      <span className="truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 性能总结卡片 */}
        <div className="relative w-full max-w-4xl mx-auto backdrop-blur-sm">
          <div className="absolute inset-x-0 h-full bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
          <div className="relative flex flex-col items-center gap-6 py-8">
            <div
              className={`flex items-center gap-4 px-10 py-5 rounded-2xl bg-gray-900/50 border border-gray-700/30 shadow-lg backdrop-blur-md ${summary.color} transform hover:scale-[1.02] transition-all duration-300`}
            >
              <span className="text-4xl">{summary.icon}</span>
              <span className="text-xl font-medium">{summary.text}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full px-4">
              {summary.details.map((d) => (
                <div
                  key={d.name}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900/40 backdrop-blur-sm border border-gray-700/30 ${d.color} hover:scale-[1.02] transition-all duration-300 group`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800/50 group-hover:bg-gray-800/70 transition-colors">
                    <span className="text-xl">{d.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm truncate">{d.name}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-medium text-base">
                        {d.avg.toFixed(2)}
                        {d.displayUnit}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        ({d.threshold})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900/40 border border-gray-700/30 text-cyan-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>数据加载中...</span>
            </div>
          </div>
        )}

        {/* 图表网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {metricsList.map((metric) => (
            <div
              key={metric.type}
              className="group bg-gray-900/40 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700/30 transition-all duration-300 hover:shadow-cyan-400/20 hover:border-cyan-400/30 hover:bg-gray-900/60"
            >
              <div className="flex items-center justify-between mb-2 px-6 pt-6">
                <span className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors duration-300">
                  {metric.name}
                </span>
                <span className="text-xs text-green-400/80 ml-2 group-hover:text-green-400 transition-colors duration-300">
                  {metric.threshold}
                </span>
              </div>
              <div className="px-6 pb-6">
                <ReactECharts
                  style={{ height: 360 }}
                  option={getChartOption(metric, data[metric.type] || [])}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
