import { z } from 'zod';

/**
 * Schema de Validação para Criação de Aluno
 */
export const CreateStudentSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  socialName: z.string().optional(),
  birthDate: z.string().transform((str) => new Date(str)),
  ra: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  address: z.string().min(5, "Endereço obrigatório"),
  gender: z.string(),
  race: z.string(),
  traditionalCommunity: z.string().default('none'),
  socialProgram: z.string(),
  nationality: z.string(),
  birthCountry: z.string(),
  birthCity: z.string(),
  motherName: z.string(),
  fatherName: z.string(),
  guardianPhone: z.string(),
  guardianEmail: z.string().optional(),
  specialNeeds: z.boolean().default(false),
  publicTransport: z.boolean().default(false),
  disabilities: z.array(z.string()).default([]),
  birthCertificate: z.string().optional(),
  classId: z.string().optional(),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;

/**
 * "Server Action" para criar um aluno.
 * Em um sistema real, aqui chamariamos o PrismaClient.
 */
export async function createStudentAction(input: CreateStudentInput, schoolId: string) {
  // 1. Validação extra de permissão (opcional aqui, idealmente no middleware)
  console.log(`[Action] Criando aluno ${input.name} para a escola ${schoolId}`);
  
  // 2. Lógica de Banco (Exemplo Mock)
  // return await db.student.create({ data: { ...input, schoolId } });
  
  return {
    success: true,
    data: {
      id: Math.random().toString(36).substr(2, 9),
      ...input,
      schoolId,
    }
  };
}
