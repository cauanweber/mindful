import type { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'

type AppError = Error & {
  statusCode?: number
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Rota não encontrada: ${req.originalUrl}` })
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (res.headersSent) return

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      message: 'Banco de dados indisponível. Verifique a conexão.',
    })
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      message: 'Operação inválida no banco de dados.',
      code: err.code,
    })
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: 'Dados inválidos para operação no banco de dados.',
    })
  }

  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500

  if (statusCode >= 500) {
    console.error(err)
  }

  return res.status(statusCode).json({
    message: statusCode === 500 ? 'Erro interno do servidor.' : err.message,
  })
}
