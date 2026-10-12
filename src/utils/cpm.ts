import { Ticket } from '../types';

export interface CPMTask {
  id: string;
  name: string;
  duration: number;
  dependencies: string[];
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  ES?: number;
  EF?: number;
  LS?: number;
  LF?: number;
  totalFloat?: number;
  isCritical?: boolean;
}

export const CPMEngine = {
  calculate(tickets: Ticket[]) {
    if (tickets.length === 0) return { tasks: [], criticalPath: [], projectDuration: 0, criticalTasks: [] };
    
    const tasks: CPMTask[] = tickets.map(t => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      return {
        id: t.id,
        name: t.title,
        duration,
        dependencies: t.dependencies || [],
        startDate: t.startDate,
        endDate: t.endDate,
        status: t.status,
        priority: t.priority
      };
    });

    const taskMap: Record<string, CPMTask> = {};
    tasks.forEach(t => { taskMap[t.id] = t; });

    const computeES = (taskId: string, visited = new Set<string>()) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);
      const task = taskMap[taskId];
      if (!task) return;

      if (task.dependencies.length === 0) {
        task.ES = 0;
      } else {
        task.dependencies.forEach(depId => computeES(depId, visited));
        task.ES = Math.max(...task.dependencies.map(depId => {
          const dep = taskMap[depId];
          return dep && dep.EF !== undefined ? dep.EF : 0;
        }));
      }
      task.EF = task.ES + task.duration;
    };

    tasks.forEach(t => computeES(t.id));

    const projectDuration = Math.max(...tasks.map(t => t.EF || 0));

    const computeLF = (taskId: string, visited = new Set<string>()) => {
      if (visited.has(taskId)) return;
      const task = taskMap[taskId];
      if (!task) return;

      const successors = tasks.filter(t => t.dependencies.includes(taskId));
      if (successors.length === 0) {
        task.LF = projectDuration;
      } else {
        successors.forEach(s => computeLF(s.id, visited));
        task.LF = Math.min(...successors.map(s => s.LS !== undefined ? s.LS : projectDuration));
      }
      task.LS = task.LF - task.duration;
      task.totalFloat = (task.LS !== undefined && task.ES !== undefined) ? task.LS - task.ES : 0;
      task.isCritical = task.totalFloat <= 0;
      visited.add(taskId);
    };

    tasks.forEach(t => computeLF(t.id));

    const criticalTasks = tasks.filter(t => t.isCritical).sort((a, b) => (a.ES || 0) - (b.ES || 0));
    const criticalPath = this.traceCriticalPath(criticalTasks, tasks);

    return { tasks, criticalPath, projectDuration, criticalTasks };
  },

  traceCriticalPath(criticalTasks: CPMTask[], allTasks: CPMTask[]) {
    if (criticalTasks.length === 0) return [];
    const criticalIds = new Set(criticalTasks.map(t => t.id));
    const startNodes = criticalTasks.filter(t => !t.dependencies.some(d => criticalIds.has(d)));
    if (startNodes.length === 0) return criticalTasks.map(t => t.id);

    const path: string[] = [];
    const visited = new Set<string>();

    const traverse = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);
      path.push(taskId);
      const successors = allTasks
        .filter(t => t.dependencies.includes(taskId) && criticalIds.has(t.id))
        .sort((a, b) => (a.ES || 0) - (b.ES || 0));
      if (successors.length > 0) traverse(successors[0].id);
    };

    startNodes.sort((a, b) => (a.ES || 0) - (b.ES || 0));
    traverse(startNodes[0].id);
    return path;
  }
};
