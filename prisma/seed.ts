import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // 创建一个项目
  const project = await prisma.project.create({
    data: { name: 'Demo Project' }
  })

  // 创建一条 Web Vitals 指标
  await prisma.webVitalMetric.create({
    data: {
      projectId: project.id,
      type: 'lcp',
      value: 2.5,
      userAgent: 'seed-script',
      url: 'http://localhost/'
    }
  })

  console.log('Seed data created:', project)
}

main().finally(() => prisma.$disconnect())
