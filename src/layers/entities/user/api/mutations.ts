import { prisma } from '@/lib/prisma'
import type { CreateUserInput, User } from '../model/types'

export async function createUser(data: CreateUserInput): Promise<User> {
  return prisma.user.create({
    data,
  })
}

export async function updateUser(
  id: string,
  data: Partial<CreateUserInput>
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data,
  })
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  })
}
