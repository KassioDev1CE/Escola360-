import express from "express";
import path from "path";
import { z } from "zod";
import { createServer as createViteServer } from "vite";
import { CreateStudentSchema, createStudentAction } from "./server/actions/academic";

const app = express();
const PORT = 3000;

app.use(express.json());

// ---------------------------------------------------------
// MOCK DATABASE (In-Memory)
// ---------------------------------------------------------
const db: { 
  students: any[], 
  classes: any[], 
  finance: any[], 
  teachers: any[], 
  schedules: Record<string, any[]>,
  users: any[]
} = {
  students: [],
  classes: [],
  finance: [],
  teachers: [],
  schedules: {},
  users: [
    {
      id: "admin-1",
      name: "Administrador",
      email: "kmurilo2012@gmail.com",
      password: "Novasenha2024@",
      role: "admin"
    }
  ]
};

// 1. Simulação de Middleware de Auth/Multi-tenancy
const authMiddleware = (req: any, res: any, next: any) => {
  req.schoolId = "cm_school_123";
  next();
};

// ---------------------------------------------------------
// API ROUTES
// ---------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", system: "Escola360" });
});

// --- Auth ---
app.post("/api/auth/login", (req, res) => {
  const { identifier, password, role } = req.body;

  if (role === 'admin') {
    const admin = db.users.find(u => u.email === identifier && u.password === password && u.role === 'admin');
    if (admin) {
      return res.json({ name: admin.name, role: 'admin', email: admin.email });
    }
  } else if (role === 'teacher') {
    const teacher = db.teachers.find(t => t.email === identifier && t.password === password);
    if (teacher) {
      return res.json({ name: teacher.name, role: 'teacher', email: teacher.email, id: teacher.id });
    }
  } else if (role === 'parent') {
    const cleanedCpf = identifier.replace(/\D/g, '');
    const student = db.students.find(s => s.guardianCpf === cleanedCpf && s.guardianBirthDate === password);
    if (student) {
      // Encontra todos os alunos do mesmo responsável
      const students = db.students.filter(s => s.guardianCpf === cleanedCpf);
      return res.json({
        name: student.guardianName,
        role: 'parent',
        cpf: student.guardianCpf,
        students
      });
    }
  }

  res.status(401).json({ error: "Credenciais inválidas." });
});

app.get("/api/dashboard/stats", authMiddleware, (req, res) => {
  const activeStudents = db.students.length;
  const teachersCount = db.teachers.length;
  const classesCount = db.classes.length;
  
  const income = db.finance
    .filter(f => f.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const expenses = db.finance
    .filter(f => f.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = income + expenses;

  res.json({
    activeStudents,
    teachersCount,
    classesCount,
    income,
    expenses,
    balance,
    alerts: []
  });
});

// --- Alunos ---
app.get("/api/students", authMiddleware, (req, res) => {
  res.json(db.students);
});

app.post("/api/students", authMiddleware, async (req: any, res) => {
  console.log(`[POST] /api/students - Payload:`, JSON.stringify(req.body));
  try {
    const validatedData = CreateStudentSchema.parse(req.body);
    
    // Auto-generate RA if not provided or empty
    let ra = validatedData.ra;
    if (!ra || ra.trim() === '') {
      const year = new Date().getFullYear();
      const count = db.students.filter(s => s.ra?.startsWith(year.toString())).length + 1;
      ra = `${year}${String(count).padStart(4, '0')}`;
      
      // Ensure uniqueness if the count already exists
      while (db.students.some(s => s.ra === ra)) {
        const suffix = Math.floor(Math.random() * 100);
        ra = `${year}${String(count).padStart(4, '0')}${suffix}`;
      }
    }

    const birthDate = validatedData.birthDate instanceof Date && !isNaN(validatedData.birthDate.getTime())
      ? validatedData.birthDate.toISOString()
      : new Date().toISOString();

    const newStudent = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      ra,
      birthDate,
      schoolId: req.schoolId
    };
    db.students.push(newStudent);
    console.log(`[POST] /api/students - Success: ${newStudent.id}`);
    res.json({ success: true, data: newStudent });
  } catch (error) {
    console.error(`[POST] /api/students - Error:`, error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : "Error",
      details: error instanceof z.ZodError ? (error as z.ZodError).issues : undefined
    });
  }
});

app.put("/api/students/:id", authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  console.log(`[PUT] /api/students/${id} - Payload:`, JSON.stringify(req.body));
  try {
    const index = db.students.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Student not found" });
    }

    // We allow partial updates on PUT in this mock implementation
    // but let's at least ensure birthDate is valid if provided
    const studentData = { ...db.students[index], ...req.body };
    
    if (req.body.birthDate) {
      const d = new Date(req.body.birthDate);
      if (!isNaN(d.getTime())) {
        studentData.birthDate = d.toISOString();
      }
    }

    db.students[index] = studentData;
    console.log(`[PUT] /api/students/${id} - Success`);
    res.json({ success: true, data: db.students[index] });
  } catch (error) {
    console.error(`[PUT] /api/students/${id} - Error:`, error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Error" });
  }
});

app.delete("/api/students/:id", authMiddleware, (req: any, res) => {
  const { id } = req.params;
  db.students = db.students.filter(s => s.id !== id);
  res.json({ success: true });
});

// --- Turmas ---
app.get("/api/classes", authMiddleware, (req, res) => {
  res.json(db.classes);
});

app.post("/api/classes", authMiddleware, (req: any, res) => {
  const newClass = {
    id: Math.random().toString(36).substr(2, 9),
    ...req.body,
    schoolId: req.schoolId
  };
  db.classes.push(newClass);
  res.json({ success: true, data: newClass });
});

app.put("/api/classes/:id", authMiddleware, (req: any, res) => {
  const { id } = req.params;
  const index = db.classes.findIndex(c => c.id === id);
  if (index !== -1) {
    db.classes[index] = { ...db.classes[index], ...req.body };
    res.json({ success: true, data: db.classes[index] });
  } else {
    res.status(404).json({ error: "Class not found" });
  }
});

app.delete("/api/classes/:id", authMiddleware, (req: any, res) => {
  const { id } = req.params;
  db.classes = db.classes.filter(c => c.id !== id);
  res.json({ success: true });
});

// --- Financeiro ---
app.get("/api/finance", authMiddleware, (req, res) => {
  res.json(db.finance);
});

// --- Professores ---
app.get("/api/teachers", authMiddleware, (req, res) => {
  res.json(db.teachers);
});

app.post("/api/teachers", authMiddleware, (req: any, res) => {
  const newTeacher = {
    id: Math.random().toString(36).substr(2, 9),
    ...req.body,
    schoolId: req.schoolId
  };
  db.teachers.push(newTeacher);
  res.json({ success: true, data: newTeacher });
});

app.put("/api/teachers/:id", authMiddleware, (req: any, res) => {
  const { id } = req.params;
  const index = db.teachers.findIndex(t => t.id === id);
  if (index !== -1) {
    db.teachers[index] = { ...db.teachers[index], ...req.body };
    res.json({ success: true, data: db.teachers[index] });
  } else {
    res.status(404).json({ error: "Teacher not found" });
  }
});

app.delete("/api/teachers/:id", authMiddleware, (req: any, res) => {
  const { id } = req.params;
  db.teachers = db.teachers.filter(t => t.id !== id);
  res.json({ success: true });
});

// Schedules API
app.get("/api/schedules", (req, res) => {
  const schedules = db.schedules || {};
  const classId = req.query.classId as string;
  if (classId) {
    return res.json(schedules[classId] || []);
  }
  res.json(schedules);
});

app.post("/api/schedules/:classId", (req, res) => {
  try {
    const { classId } = req.params;
    const schedule = req.body; // Expects Array of { day, period, subjectId, teacherId, startTime, endTime }
    
    db.schedules[classId] = schedule;
    
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ error: "Failed to save schedule" });
  }
});

// ---------------------------------------------------------
// VITE MIDDLEWARE (Development)
// ---------------------------------------------------------

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Escola360 rodando em http://localhost:${PORT}`);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite();

export default app;
