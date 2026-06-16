import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: 'admin' }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      },
    })
    console.log('Admin created: admin / admin123')
  } else {
    console.log('Admin already exists')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
