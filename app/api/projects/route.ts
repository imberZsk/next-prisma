import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const projects = await prisma.project.findMany({
    select: { id: true, name: true }
  })
  return NextResponse.json(projects)
}
