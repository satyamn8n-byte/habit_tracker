import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Plus, CheckCircle, Circle, BarChart3, PieChart as PieChartIcon, LogOut, TrendingUp, Activity } from 'lucide-react';
import { format, startOfToday, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface Habit {
  _id: string;
  name: string;
  description: string;
}

interface Log {
  habit: string;
  date: string;
  completed: boolean;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);

  const today = startOfToday();
  const todayStr = format(today, 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [habitsData, logsData] = await Promise.all([
        apiFetch('/habits'),
        apiFetch(`/habits/logs?start=${subDays(today, 365).toISOString()}&end=${new Date().toISOString()}`),
      ]);
      setHabits(habitsData);
      setLogs(logsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName) return;
    try {
      const newHabit = await apiFetch('/habits', {
        method: 'POST',
        body: JSON.stringify({ name: newHabitName }),
      });
      setHabits([...habits, newHabit]);
      setNewHabitName('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHabit = async (habitId: string) => {
    const isCompleted = logs.find(l => l.habit === habitId && isSameDay(new Date(l.date), today))?.completed;
    try {
      const updatedLog = await apiFetch('/habits/toggle-log', {
        method: 'POST',
        body: JSON.stringify({
          habitId,
          date: todayStr,
          completed: !isCompleted,
        }),
      });
      
      const newLogs = logs.filter(l => !(l.habit === habitId && isSameDay(new Date(l.date), today)));
      setLogs([...newLogs, updatedLog]);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Heatmap Data
  const heatmapValues = useMemo(() => {
    return logs.reduce((acc: any[], log) => {
      const dateStr = format(new Date(log.date), 'yyyy-MM-dd');
      const existing = acc.find(v => v.date === dateStr);
      if (existing) {
        if (log.completed) existing.count += 1;
      } else {
        acc.push({ date: dateStr, count: log.completed ? 1 : 0 });
      }
      return acc;
    }, []);
  }, [logs]);

  // 2. Weekly Bar Chart Data (last 7 days)
  const weeklyData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today
    });

    return last7Days.map(day => {
      const count = logs.filter(l => l.completed && isSameDay(new Date(l.date), day)).length;
      return {
        name: format(day, 'EEE'),
        completed: count
      };
    });
  }, [logs, today]);

  // 3. Completion Trend (last 30 days)
  const trendData = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today
    });

    return last30Days.map(day => {
      const count = logs.filter(l => l.completed && isSameDay(new Date(l.date), day)).length;
      return {
        date: format(day, 'MMM d'),
        completed: count
      };
    });
  }, [logs, today]);

  // 4. Success Ratio Pie Chart
  const pieData = useMemo(() => {
    const completed = logs.filter(l => l.completed).length;
    const missed = logs.filter(l => !l.completed).length;
    return [
      { name: 'Completed', value: completed, color: '#6366f1' },
      { name: 'Missed', value: missed, color: '#334155' }
    ];
  }, [logs]);

  // 5. Progress Score (Radial Bar Chart)
  const progressData = useMemo(() => {
    const completedToday = logs.filter(l => l.completed && isSameDay(new Date(l.date), today)).length;
    const totalHabits = habits.length;
    const rate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    return [
      { name: 'Score', value: rate, fill: '#6366f1' }
    ];
  }, [logs, habits, today]);

  // 6. Highlight Stats
  const highlights = useMemo(() => {
    const completedToday = logs.filter(l => l.completed && isSameDay(new Date(l.date), today)).length;
    const totalHabits = habits.length;
    const successRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const day = subDays(today, i);
      const dayCompletions = logs.filter(l => l.completed && isSameDay(new Date(l.date), day)).length;
      if (dayCompletions >= totalHabits && totalHabits > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return [
      { label: "Completion", value: `${successRate}%` },
      { label: "Streak", value: `${streak}d` },
      { label: "Total Wins", value: logs.filter(l => l.completed).length },
    ];
  }, [logs, habits, today]);

  if (loading) return <div className="container">Optimizing Screen...</div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>HabitPulse</h1>
        <div className="nav-actions">
          <form onSubmit={handleAddHabit} className="nav-add-habit">
            <input 
              type="text" 
              placeholder="Track new habit..." 
              value={newHabitName} 
              onChange={(e) => setNewHabitName(e.target.value)}
            />
            <button type="submit" className="btn" style={{ padding: '0.2rem 0.4rem' }}><Plus size={16} /></button>
          </form>
          <div className="navbar-user" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
            <span>{user?.email}</span>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }}><LogOut size={14} /></button>
          </div>
        </div>
      </nav>

      <div className="main-container">
        {/* Fixed Sidebar for Habits */}
        <aside className="sidebar">
          <h2><Activity size={14} style={{ marginRight: '0.4rem' }} /> Daily Check-in</h2>
          <div className="habit-list">
            {habits.map(habit => {
              const isCompleted = logs.find(l => l.habit === habit._id && isSameDay(new Date(l.date), today))?.completed;
              return (
                <div key={habit._id} className="habit-item" onClick={() => toggleHabit(habit._id)} style={{
                  borderColor: isCompleted ? 'var(--success)' : 'var(--border)',
                  background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--background)'
                }}>
                  {isCompleted ? <CheckCircle color="var(--success)" size={16} /> : <Circle color="var(--border)" size={16} />}
                  <span style={{ 
                    marginLeft: '0.75rem', 
                    textDecoration: isCompleted ? 'line-through' : 'none', 
                    color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {habit.name}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Dynamic Stats Row */}
        <section className="stats-row">
          {highlights.map((stat, i) => (
            <div key={i} className="small-stat">
              <span className="label">{stat.label}</span>
              <span className="value">{stat.value}</span>
            </div>
          ))}
        </section>

        {/* Bento Grid Visuals */}
        <div className="bento-grid">
          
          <div className="bento-item" style={{ gridColumn: 'span 2' }}>
            <h2><TrendingUp size={14} /> Performance Trend (30D)</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161e2e', border: '1px solid #2d3748', borderRadius: '8px', fontSize: '0.75rem' }}
                  />
                  <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2} fill="url(#colorComp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bento-item">
            <h2><Activity size={14} /> Today's Score</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="80%" 
                  barSize={10} 
                  data={progressData} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161e2e', border: '1px solid #2d3748', borderRadius: '8px', fontSize: '0.75rem' }}
                  />
                  <RadialBar
                    background
                    dataKey="value"
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--text-main)"
                    style={{ fontSize: '1rem', fontWeight: 'bold' }}
                  >
                    {progressData[0].value}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bento-item">
            <h2><BarChart3 size={14} /> Weekly Activity</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#161e2e', border: '1px solid #2d3748', borderRadius: '8px', fontSize: '0.75rem' }}
                  />
                  <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bento-item">
            <h2><PieChartIcon size={14} /> Success Ratio</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161e2e', border: '1px solid #2d3748', borderRadius: '8px', fontSize: '0.75rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bento-item">
            <h2>Consistency Matrix</h2>
            <div className="chart-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarHeatmap
                startDate={subDays(today, 120)}
                endDate={today}
                values={heatmapValues}
                classForValue={(value) => {
                  if (!value || value.count === 0) return 'color-empty';
                  return `color-scale-${Math.min(value.count, 4)}`;
                }}
                titleForValue={(value) => {
                  if (!value) return 'No activity';
                  return `${value.date}: ${value.count} completions`;
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
